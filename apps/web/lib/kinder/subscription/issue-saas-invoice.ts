import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';

import type { Database } from '~/lib/database.types';
import { isSmtpConfigured } from '~/lib/kinder/mail/smtp-config';
import { sendMail } from '~/lib/kinder/mail/send-mail';

import { getStripeClient } from '../billing/stripe-server';
import {
  convertUsdCentsToVnd,
  resolveVndPerUsdFromMetadata,
} from '../billing/vnd-usd-exchange';
import { getStripeVndPerUsd } from '../billing/stripe-vnd-exchange.server';
import {
  buildSaasInvoicePdfFilename,
  generateSaasInvoicePdfBuffer,
  type SaasInvoicePdfData,
} from './generate-saas-invoice-pdf';
import {
  getSaasVatRate,
  splitVatFromTotal,
} from './saas-invoice-config';
import { buildSaasInvoiceEmail } from './saas-invoice-email';
import { loadSchoolOwner } from './trial-reminder-shared';

type AdminClient = SupabaseClient<Database>;

export type SaasBillingInvoice = {
  id: string;
  school_id: string;
  package_id: string | null;
  stripe_invoice_id: string;
  invoice_number: string;
  billing_period_start: string | null;
  billing_period_end: string | null;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total_amount: number;
  currency: string;
  package_name: string;
  school_name: string;
  buyer_email: string | null;
  status: 'issued' | 'sent' | 'failed';
  issued_at: string;
  emailed_at: string | null;
  created_at: string;
};

function getStripeInvoiceSubscriptionId(invoice: Stripe.Invoice) {
  const subscriptionRef = (
    invoice as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null;
    }
  ).subscription;

  if (!subscriptionRef) {
    return null;
  }

  return typeof subscriptionRef === 'string'
    ? subscriptionRef
    : subscriptionRef.id;
}

function resolvePaidAmount(invoice: Stripe.Invoice) {
  const paid = invoice.amount_paid ?? 0;
  const total = invoice.total ?? paid;

  return paid > 0 ? paid : total;
}

function resolveStripeTaxAmountCents(invoice: Stripe.Invoice) {
  const taxAmounts = (
    invoice as Stripe.Invoice & {
      total_tax_amounts?: Array<{ amount?: number | null }>;
    }
  ).total_tax_amounts;

  const tax = taxAmounts?.reduce(
    (sum: number, item: { amount?: number | null }) => sum + (item.amount ?? 0),
    0,
  );

  return tax && tax > 0 ? tax : null;
}

function collectStripeMetadata(
  stripeInvoice: Stripe.Invoice,
): Record<string, string | undefined> {
  const lineMeta = stripeInvoice.lines?.data[0]?.metadata ?? {};
  const subscriptionDetails = (
    stripeInvoice as Stripe.Invoice & {
      subscription_details?: { metadata?: Stripe.Metadata | null } | null;
    }
  ).subscription_details?.metadata;

  return {
    ...lineMeta,
    ...(stripeInvoice.metadata ?? {}),
    ...(subscriptionDetails ?? {}),
  };
}

function resolveInvoiceAmountsInVnd(stripeInvoice: Stripe.Invoice) {
  const currency = (stripeInvoice.currency ?? 'usd').toLowerCase();
  const paidCents = resolvePaidAmount(stripeInvoice);
  const metadata = collectStripeMetadata(stripeInvoice);
  const vndPerUsd = resolveVndPerUsdFromMetadata(
    metadata,
    getStripeVndPerUsd(),
  );

  let totalVnd: number;

  if (currency === 'vnd') {
    totalVnd = paidCents;
  } else {
    totalVnd = convertUsdCentsToVnd(paidCents, vndPerUsd);
  }

  const vatRate = getSaasVatRate();
  const stripeTaxCents = resolveStripeTaxAmountCents(stripeInvoice);

  if (stripeTaxCents !== null) {
    const vatAmount =
      currency === 'vnd'
        ? stripeTaxCents
        : convertUsdCentsToVnd(stripeTaxCents, vndPerUsd);
    const subtotal = Math.max(0, totalVnd - vatAmount);

    return { subtotal, vatAmount, totalVnd, vatRate };
  }

  const split = splitVatFromTotal(totalVnd, vatRate);

  return {
    subtotal: split.subtotal,
    vatAmount: split.vatAmount,
    totalVnd,
    vatRate,
  };
}

async function resolveSchoolContext(
  client: AdminClient,
  schoolId: string,
  packageIdHint: string | null,
) {
  const [{ data: school }, { data: subscription }] = await Promise.all([
    client.from('schools').select('id, name, email').eq('id', schoolId).single(),
    client
      .from('school_subscriptions')
      .select('package_id')
      .eq('school_id', schoolId)
      .maybeSingle(),
  ]);

  const packageId = packageIdHint ?? subscription?.package_id ?? null;

  let packageName = 'Gói đăng ký';

  if (packageId) {
    const { data: pkg } = await client
      .from('packages')
      .select('name')
      .eq('id', packageId)
      .maybeSingle();

    packageName = pkg?.name ?? packageName;
  }

  return {
    schoolName: school?.name ?? 'Trường học',
    schoolEmail: school?.email ?? null,
    packageId,
    packageName,
  };
}

async function allocateInvoiceNumber(client: AdminClient) {
  const { data, error } = await client.rpc('next_saas_invoice_number');

  if (error || !data) {
    throw error ?? new Error('Failed to allocate SaaS invoice number');
  }

  return data as string;
}

function toPdfData(invoice: SaasBillingInvoice): SaasInvoicePdfData {
  return {
    invoiceNumber: invoice.invoice_number,
    issuedAt: invoice.issued_at,
    schoolName: invoice.school_name,
    buyerEmail: invoice.buyer_email,
    packageName: invoice.package_name,
    billingPeriodStart: invoice.billing_period_start,
    billingPeriodEnd: invoice.billing_period_end,
    subtotal: invoice.subtotal,
    vatRate: Number(invoice.vat_rate),
    vatAmount: invoice.vat_amount,
    totalAmount: invoice.total_amount,
    currency: invoice.currency,
  };
}

async function emailSaasInvoice(
  client: AdminClient,
  invoice: SaasBillingInvoice,
) {
  if (!isSmtpConfigured()) {
    return false;
  }

  const owner = await loadSchoolOwner(invoice.school_id);
  const recipient =
    owner?.email ?? invoice.buyer_email ?? null;

  if (!recipient) {
    return false;
  }

  const pdfData = toPdfData(invoice);
  const pdfBuffer = await generateSaasInvoicePdfBuffer(pdfData);
  const email = buildSaasInvoiceEmail({
    schoolName: invoice.school_name,
    ownerName: owner?.name ?? null,
    invoice: pdfData,
  });

  await sendMail({
    to: recipient,
    subject: email.subject,
    html: email.html,
    text: email.text,
    attachments: [
      {
        filename: buildSaasInvoicePdfFilename(invoice.invoice_number),
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });

  await client
    .from('saas_billing_invoices')
    .update({
      status: 'sent',
      emailed_at: new Date().toISOString(),
      buyer_email: recipient,
    })
    .eq('id', invoice.id);

  return true;
}

export async function issueSaasInvoiceFromStripe(
  client: AdminClient,
  stripeInvoice: Stripe.Invoice,
  schoolIdHint?: string | null,
) {
  const stripeInvoiceId = stripeInvoice.id;

  if (!stripeInvoiceId) {
    return null;
  }

  if (stripeInvoice.status && stripeInvoice.status !== 'paid') {
    return null;
  }

  const paidAmount = resolvePaidAmount(stripeInvoice);

  if (paidAmount <= 0) {
    return null;
  }

  const { data: existing } = await client
    .from('saas_billing_invoices')
    .select('*')
    .eq('stripe_invoice_id', stripeInvoiceId)
    .maybeSingle();

  if (existing?.emailed_at) {
    return existing as SaasBillingInvoice;
  }

  if (existing && !existing.emailed_at) {
    const emailed = await emailSaasInvoice(client, existing as SaasBillingInvoice);

    if (!emailed) {
      await client
        .from('saas_billing_invoices')
        .update({ status: 'issued' })
        .eq('id', existing.id);
    }

    return existing as SaasBillingInvoice;
  }

  let schoolId = schoolIdHint ?? stripeInvoice.metadata?.school_id ?? null;

  if (!schoolId) {
    const subscriptionId = getStripeInvoiceSubscriptionId(stripeInvoice);

    if (subscriptionId) {
      const stripe = getStripeClient();
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      schoolId = subscription.metadata.school_id ?? null;
    }
  }

  if (!schoolId) {
    console.warn('[saas-invoice] missing school_id for stripe invoice', stripeInvoiceId);
    return null;
  }

  const packageIdHint =
    stripeInvoice.metadata?.package_id ??
    stripeInvoice.lines?.data[0]?.metadata?.package_id ??
    null;

  const schoolContext = await resolveSchoolContext(
    client,
    schoolId,
    packageIdHint,
  );
  const owner = await loadSchoolOwner(schoolId);
  const { subtotal, vatAmount, totalVnd, vatRate } =
    resolveInvoiceAmountsInVnd(stripeInvoice);

  const periodStart = stripeInvoice.period_start
    ? new Date(stripeInvoice.period_start * 1000).toISOString()
    : null;
  const periodEnd = stripeInvoice.period_end
    ? new Date(stripeInvoice.period_end * 1000).toISOString()
    : null;

  const invoiceNumber = await allocateInvoiceNumber(client);

  const { data: created, error } = await client
    .from('saas_billing_invoices')
    .insert({
      school_id: schoolId,
      package_id: schoolContext.packageId,
      stripe_invoice_id: stripeInvoiceId,
      invoice_number: invoiceNumber,
      billing_period_start: periodStart,
      billing_period_end: periodEnd,
      subtotal,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      total_amount: totalVnd,
      currency: 'VND',
      package_name: schoolContext.packageName,
      school_name: schoolContext.schoolName,
      buyer_email: owner?.email ?? schoolContext.schoolEmail,
      status: 'issued',
      issued_at: new Date(
        (stripeInvoice.status_transitions?.paid_at ?? stripeInvoice.created) * 1000,
      ).toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      const { data: raced } = await client
        .from('saas_billing_invoices')
        .select('*')
        .eq('stripe_invoice_id', stripeInvoiceId)
        .maybeSingle();

      return (raced as SaasBillingInvoice | null) ?? null;
    }

    throw error;
  }

  const invoice = created as SaasBillingInvoice;

  try {
    const emailed = await emailSaasInvoice(client, invoice);

    if (!emailed) {
      await client
        .from('saas_billing_invoices')
        .update({ status: 'issued' })
        .eq('id', invoice.id);
    }
  } catch (mailError) {
    console.error('[saas-invoice] email failed', mailError);
    await client
      .from('saas_billing_invoices')
      .update({ status: 'failed' })
      .eq('id', invoice.id);
  }

  return invoice;
}

export function mapSaasBillingInvoiceRow(row: SaasBillingInvoice) {
  return row;
}

export async function loadSaasBillingInvoicePdfBuffer(
  invoice: SaasBillingInvoice,
) {
  return generateSaasInvoicePdfBuffer(toPdfData(invoice));
}
