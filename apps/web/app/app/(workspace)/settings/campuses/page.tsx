import { Badge } from '@kit/ui/badge';
import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

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
      <PageHeader
        description={<Trans i18nKey="kinder:campuses.description" />}
        title={<Trans i18nKey="kinder:campuses.title" />}
      />

      <PageBody>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            {campuses.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                <Trans i18nKey="kinder:campuses.empty" />
              </p>
            ) : (
              <ul className="divide-y rounded-lg border">
                {campuses.map((campus) => (
                  <li
                    className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between"
                    key={campus.id}
                  >
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
                  </li>
                ))}
              </ul>
            )}
          </div>

          <CreateCampusForm
            campuses={campuses}
            schoolId={context.school.id}
          />
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(CampusesPage);
