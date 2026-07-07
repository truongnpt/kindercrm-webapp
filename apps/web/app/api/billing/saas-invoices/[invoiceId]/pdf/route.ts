import { NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  loadSaasBillingInvoicePdfBuffer,
  type SaasBillingInvoice,
} from '~/lib/kinder/subscription/issue-saas-invoice';
import { buildSaasInvoicePdfFilename } from '~/lib/kinder/subscription/generate-saas-invoice-pdf';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  context: { params: Promise<{ invoiceId: string }> },
) {
  const { invoiceId } = await context.params;
  const user = await requireUserInServerComponent();
  const client = getSupabaseServerClient();

  const { data: invoice, error } = await client
    .from('saas_billing_invoices')
    .select('*')
    .eq('id', invoiceId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  const { data: member } = await client
    .from('school_members')
    .select('id')
    .eq('school_id', invoice.school_id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .maybeSingle();

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const pdfBuffer = await loadSaasBillingInvoicePdfBuffer(
    invoice as SaasBillingInvoice,
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${buildSaasInvoicePdfFilename(invoice.invoice_number)}"`,
      'Cache-Control': 'private, max-age=60',
    },
  });
}
