import { Badge } from '@kit/ui/badge';
import { Trans } from '@kit/ui/trans';

import { BentoGrid, BentoTile, BentoTileHeader } from '~/components/kinder-ui';
import type { Campus } from '~/lib/kinder/types';

export function CampusesList({ campuses }: { campuses: Campus[] }) {
  return (
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
  );
}
