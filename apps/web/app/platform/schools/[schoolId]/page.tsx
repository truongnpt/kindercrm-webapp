import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ArrowLeft } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import {
  PlatformPageBody,
  PlatformPageHeader,
  PlatformSectionCard,
} from '~/components/platform-console';
import { SubscriptionStatusBadge } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadPlatformSchoolDetail } from '~/lib/kinder/platform/load-platform-schools';
import { loadPlatformPackages } from '~/lib/kinder/platform/load-platform-ops';
import { requirePlatformAdminPage } from '~/lib/kinder/platform/require-platform-admin';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { SchoolStatusActions } from './_components/school-status-actions';
import { SubscriptionOverridePanel } from './_components/subscription-override-panel';
import { SubscriptionRepairPanel } from './_components/subscription-repair-panel';

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) => {
  const { schoolId } = await params;
  const i18n = await createI18nServerInstance();
  const school = await loadPlatformSchoolDetail(schoolId);

  return {
    title: school?.name ?? i18n.t('kinder:platform.schools.detail'),
  };
};

async function PlatformSchoolDetailPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = await params;
  const user = await requireUserInServerComponent();
  const platform = await requirePlatformAdminPage(user.id, [
    'super_admin',
    'support',
  ]);
  const [school, packages] = await Promise.all([
    loadPlatformSchoolDetail(schoolId),
    loadPlatformPackages(),
  ]);

  if (!school) {
    notFound();
  }

  return (
    <>
      <div className="mb-4">
        <Button asChild size="sm" variant="ghost">
          <Link href={pathsConfig.platform.schools}>
            <ArrowLeft data-icon="inline-start" />
            <Trans i18nKey="kinder:platform.schools.back" />
          </Link>
        </Button>
      </div>

      <PlatformPageHeader
        actions={<SchoolStatusActions platformRole={platform.role} school={school} />}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Badge className="rounded-full">
              <Trans i18nKey={`kinder:platform.schoolStatus.${school.status}`} />
            </Badge>
            <span className="font-mono text-xs">{school.slug}</span>
          </span>
        }
        title={school.name}
      />

      <PlatformPageBody>
        <div className="grid gap-4 lg:grid-cols-2">
          <PlatformSectionCard title={<Trans i18nKey="kinder:platform.schools.info" />}>
            <dl className="flex flex-col gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">
                  <Trans i18nKey="kinder:platform.schools.owner" />
                </dt>
                <dd className="mt-1 font-medium text-foreground">
                  {school.owner_name ?? '—'}
                  {school.owner_email ? (
                    <span className="text-muted-foreground block text-xs">
                      {school.owner_email}
                    </span>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="mt-1 text-foreground">{school.email ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="mt-1 text-foreground">{school.phone ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Address</dt>
                <dd className="mt-1 text-foreground">{school.address ?? '—'}</dd>
              </div>
            </dl>
          </PlatformSectionCard>

          <PlatformSectionCard
            title={<Trans i18nKey="kinder:platform.schools.subscription" />}
          >
            <dl className="flex flex-col gap-4 text-sm">
              {!school.has_subscription ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-amber-800 dark:text-amber-200">
                  <Trans i18nKey="kinder:platform.subscription.missingBadge" />
                </div>
              ) : null}
              <div>
                <dt className="text-muted-foreground">
                  <Trans i18nKey="kinder:platform.schools.package" />
                </dt>
                <dd className="mt-1 font-medium text-foreground">
                  {school.package_name ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="mt-1">
                  {school.subscription_status ? (
                    <SubscriptionStatusBadge status={school.subscription_status} />
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              {school.trial_ends_at ? (
                <div>
                  <dt className="text-muted-foreground">Trial ends</dt>
                  <dd className="mt-1 text-foreground">
                    {new Date(school.trial_ends_at).toLocaleDateString('vi-VN')}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted-foreground">
                  <Trans i18nKey="kinder:platform.schools.usage" />
                </dt>
                <dd className="mt-1 text-foreground">
                  {school.student_count} HS / {school.campus_count} CS
                </dd>
              </div>
            </dl>
          </PlatformSectionCard>
        </div>

        {['super_admin', 'support', 'billing'].includes(platform.role) ? (
          <>
            {!school.has_subscription ? (
              <SubscriptionRepairPanel school={school} />
            ) : (
              <SubscriptionOverridePanel packages={packages} school={school} />
            )}
          </>
        ) : null}
      </PlatformPageBody>
    </>
  );
}

export default withI18n(PlatformSchoolDetailPage);
