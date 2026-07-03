import { Trans } from '@kit/ui/trans';

export function ComingSoonPanel({ moduleKey }: { moduleKey: string }) {
  return (
    <div className="kinder-surface kinder-empty-glow max-w-lg p-8">
      <h2 className="kinder-section-title">
        <Trans i18nKey="kinder:comingSoon.title" />
      </h2>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        <Trans i18nKey="kinder:comingSoon.description" />
      </p>
      <p className="text-muted-foreground mt-2 text-xs">{moduleKey}</p>
    </div>
  );
}
