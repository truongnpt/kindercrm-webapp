import type { SubscriptionStatus } from '~/lib/kinder/types';

export type SubscriptionHistoryEntry = {
  id: string;
  package_id: string;
  previous_package_id: string | null;
  status: SubscriptionStatus;
  created_at: string;
  note: string | null;
  changed_by: string | null;
  changed_by_name: string | null;
  stripe_invoice_id: string | null;
  stripe_invoice_url: string | null;
};

export function resolveSubscriptionHistoryActorLabel(entry: {
  changed_by: string | null;
  changed_by_name: string | null;
  note: string | null;
}): 'user' | 'stripe' | 'system' {
  if (entry.changed_by && entry.changed_by_name) {
    return 'user';
  }

  if (
    entry.note?.toLowerCase().includes('stripe') ||
    entry.note?.toLowerCase().includes('checkout')
  ) {
    return 'stripe';
  }

  return 'system';
}
