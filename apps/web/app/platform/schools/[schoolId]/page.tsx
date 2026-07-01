import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import {
  KinderPageBody,
  KinderPageHeader,
  SectionCard,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadPlatformSchoolDetail } from '~/lib/kinder/platform/load-platform-schools';
import { loadPlatformPackages } from '~/lib/kinder/platform/load-platform-ops';
import { requirePlatformAdminPage } from '~/lib/kinder/platform/require-platform-admin';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { SchoolStatusActions } from './_components/school-status-actions';
import { SubscriptionOverridePanel } from './_components/subscription-override-panel';

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
      <KinderPageHeader
        actions={<SchoolStatusActions platformRole={platform.role} school={school} />}
        description={
          <span className="inline-flex items-center gap-2">
            <Badge>
              <Trans i18nKey={`kinder:platform.schoolStatus.${school.status}`} />
            </Badge>
            <span className="font-mono text-xs">{school.slug}</span>
          </span>
        }
        title={school.name}
      />

      <KinderPageBody>
        <div className="mb-4">
          <Button asChild size="sm" variant="ghost">
            <Link href={pathsConfig.platform.schools}>
              <Trans i18nKey="kinder:platform.schools.back" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title={<Trans i18nKey="kinder:platform.schools.info" />}>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">
                  <Trans i18nKey="kinder:platform.schools.owner" />
                </dt>
                <dd className="font-medium">
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
                <dd>{school.email ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd>{school.phone ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Address</dt>
                <dd>{school.address ?? '—'}</dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard title={<Trans i18nKey="kinder:platform.schools.subscription" />}>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">
                  <Trans i18nKey="kinder:platform.schools.package" />
                </dt>
                <dd className="font-medium">{school.package_name ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd>{school.subscription_status ?? '—'}</dd>
              </div>
              {school.trial_ends_at ? (
                <div>
                  <dt className="text-muted-foreground">Trial ends</dt>
                  <dd>
                    {new Date(school.trial_ends_at).toLocaleDateString('vi-VN')}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted-foreground">
                  <Trans i18nKey="kinder:platform.schools.usage" />
                </dt>
                <dd>
                  {school.student_count} HS / {school.campus_count} CS
                </dd>
              </div>
            </dl>
          </SectionCard>
        </div>

        {['super_admin', 'support', 'billing'].includes(platform.role) ? (
          <SubscriptionOverridePanel packages={packages} school={school} />
        ) : null}
      </KinderPageBody>
    </>
  );
}

export default withI18n(PlatformSchoolDetailPage);
