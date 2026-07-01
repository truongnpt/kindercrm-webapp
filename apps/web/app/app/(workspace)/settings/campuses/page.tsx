import { Building2 } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Trans } from '@kit/ui/trans';

import {
  EmptyState,
  KinderPageBody,
  KinderPageHeader,
  SectionCard,
} from '~/components/kinder-ui';
import {
  getSchoolContext,
  loadCampuses,
} from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { CreateCampusForm } from './_components/create-campus-form';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:campuses.title'),
  };
};

async function CampusesPage() {
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  const campuses = await loadCampuses(context.school.id);

  return (
    <>
      <KinderPageHeader
        description={<Trans i18nKey="kinder:campuses.description" />}
        title={<Trans i18nKey="kinder:campuses.title" />}
      />

      <KinderPageBody>
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title={<Trans i18nKey="kinder:campuses.title" />}>
            {campuses.length === 0 ? (
              <EmptyState
                compact
                descriptionKey="kinder:ui.emptyDefaultDescription"
                icon={Building2}
                titleKey="kinder:campuses.empty"
              />
            ) : (
              <ul className="flex flex-col gap-3">
                {campuses.map((campus) => (
                  <li className="kinder-mobile-card" key={campus.id}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{campus.name}</p>
                        {campus.address ? (
                          <p className="text-muted-foreground text-sm">
                            {campus.address}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          <Trans
                            i18nKey={
                              campus.campus_type === 'branch'
                                ? 'kinder:campuses.typeBranch'
                                : 'kinder:campuses.typeCampus'
                            }
                          />
                        </Badge>
                        {campus.is_main ? (
                          <Badge>
                            <Trans i18nKey="kinder:campuses.main" />
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title={<Trans i18nKey="kinder:campuses.addCampus" />}>
            <CreateCampusForm
              campuses={campuses}
              schoolId={context.school.id}
            />
          </SectionCard>
        </div>
      </KinderPageBody>
    </>
  );
}

export default withI18n(CampusesPage);
