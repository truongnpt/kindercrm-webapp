import { Bot, Sparkles, Zap } from 'lucide-react';

import { BentoGrid, StatCard } from '~/components/kinder-ui';

export function AiOverview({
  creditStatus,
  isConfigured,
}: {
  creditStatus: {
    creditsUsed: number;
    creditsRemaining: number;
  };
  isConfigured: boolean;
}) {
  return (
    <BentoGrid className="mb-2" columns={3}>
      <StatCard
        icon={Zap}
        labelKey="kinder:ai.creditsLabel"
        tone="default"
        value={String(creditStatus.creditsRemaining)}
      />
      <StatCard
        icon={Sparkles}
        labelKey="kinder:ai.creditsUsed"
        tone="info"
        value={String(creditStatus.creditsUsed)}
      />
      <StatCard
        icon={Bot}
        labelKey="kinder:ai.providerStatus"
        tone={isConfigured ? 'success' : 'warning'}
        value={isConfigured ? 'OpenAI' : 'Basic'}
      />
    </BentoGrid>
  );
}
