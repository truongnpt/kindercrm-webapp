import { Search } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

export async function PlatformSchoolsFilter({
  defaultQuery,
  defaultStatus,
  defaultMissingSubscription,
}: {
  defaultQuery?: string;
  defaultStatus?: string;
  defaultMissingSubscription?: boolean;
}) {
  const i18n = await createI18nServerInstance();

  return (
    <form className="platform-console-toolbar">
      <div className="min-w-0 flex-1">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          <Trans i18nKey="kinder:platform.schools.search" />
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-10 rounded-xl pl-9"
            defaultValue={defaultQuery ?? ''}
            name="q"
            placeholder={i18n.t('kinder:platform.schools.searchPlaceholder')}
            type="search"
          />
        </div>
      </div>

      <div className="w-full sm:w-44">
        <label
          className="mb-1.5 block text-xs font-medium text-muted-foreground"
          htmlFor="platform-school-status"
        >
          <Trans i18nKey="kinder:platform.schools.status" />
        </label>
        <select
          className="border-input bg-background h-10 w-full rounded-xl border px-3 text-sm"
          defaultValue={defaultStatus ?? 'all'}
          id="platform-school-status"
          name="status"
        >
          <option value="all">{i18n.t('kinder:platform.schools.statusAll')}</option>
          <option value="active">
            {i18n.t('kinder:platform.schoolStatus.active')}
          </option>
          <option value="suspended">
            {i18n.t('kinder:platform.schoolStatus.suspended')}
          </option>
          <option value="archived">
            {i18n.t('kinder:platform.schoolStatus.archived')}
          </option>
        </select>
      </div>

      <div className="flex w-full items-center gap-2 sm:w-auto sm:self-end">
        <input
          className="border-input size-4 rounded border"
          defaultChecked={defaultMissingSubscription}
          id="platform-missing-subscription"
          name="missing_subscription"
          type="checkbox"
          value="1"
        />
        <label
          className="text-sm text-foreground"
          htmlFor="platform-missing-subscription"
        >
          <Trans i18nKey="kinder:platform.schools.missingSubscriptionOnly" />
        </label>
      </div>

      <Button className="min-h-10 sm:self-end" type="submit">
        <Trans i18nKey="kinder:platform.schools.filter" />
      </Button>
    </form>
  );
}
