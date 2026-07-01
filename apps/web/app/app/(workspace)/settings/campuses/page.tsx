import { Building2 } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Trans } from '@kit/ui/trans';

import {
  BentoGrid,
  BentoTile,
  BentoTileHeader,
  EmptyState,
  KinderPageBody,
  KinderPageHeader,
} from '~/components/kinder-ui';
import {
  getSchoolContext,
  loadCampuses,
} from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { CreateCampusDialog } from './_components/create-campus-dialog';

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
        actions={
          <CreateCampusDialog
            campuses={campuses}
            schoolId={context.school.id}
          />
        }
        description={<Trans i18nKey="kinder:campuses.description" />}
        title={<Trans i18nKey="kinder:campuses.title" />}
      />

      <KinderPageBody>
        {campuses.length === 0 ? (
          <EmptyState
            descriptionKey="kinder:ui.emptyDefaultDescription"
            icon={Building2}
            titleKey="kinder:campuses.empty"
          />
        ) : (
          <BentoGrid columns={3}>
            {campuses.map((campus) => (
              <BentoTile key={campus.id}>
                <BentoTileHeader title={campus.name} />
                {campus.address ? (
                  <p className="text-muted-foreground text-sm">{campus.address}</p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
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
              </BentoTile>
            ))}
          </BentoGrid>
        )}
      </KinderPageBody>
    </>
  );
}

export default withI18n(CampusesPage);
