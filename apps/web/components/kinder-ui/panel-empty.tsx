import { Trans } from '@kit/ui/trans';

export function PanelEmpty({ messageKey }: { messageKey: string }) {
  return (
    <div className="kinder-panel-empty">
      <p className="text-muted-foreground text-sm">
        <Trans i18nKey={messageKey} />
      </p>
    </div>
  );
}
