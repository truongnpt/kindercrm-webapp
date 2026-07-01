export const LEAD_STAGES = [
  'new',
  'contacted',
  'appointment',
  'visited',
  'deposit',
  'enrolled',
  'lost',
] as const;

export type LeadStage = (typeof LEAD_STAGES)[number];

export const ACTIVE_PIPELINE_STAGES: LeadStage[] = [
  'new',
  'contacted',
  'appointment',
  'visited',
  'deposit',
  'enrolled',
];

export const LEAD_STAGE_I18N_KEYS: Record<LeadStage, string> = {
  new: 'kinder:crm.stages.new',
  contacted: 'kinder:crm.stages.contacted',
  appointment: 'kinder:crm.stages.appointment',
  visited: 'kinder:crm.stages.visited',
  deposit: 'kinder:crm.stages.deposit',
  enrolled: 'kinder:crm.stages.enrolled',
  lost: 'kinder:crm.stages.lost',
};
