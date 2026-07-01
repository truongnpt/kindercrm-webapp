'use client';

import Link from 'next/link';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';
import type { ParentChildSummary } from '~/lib/kinder/parent/types';

export function ParentChildCard({ child }: { child: ParentChildSummary }) {
  return (
    <div className="kinder-card-grid-item">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{child.fullName}</p>
          <p className="text-muted-foreground text-xs">{child.studentCode}</p>
          <p className="text-muted-foreground mt-1 text-sm">{child.schoolName}</p>
        </div>
        {child.isPrimary ? (
          <Badge variant="secondary">
            <Trans i18nKey="kinder:parent.primary" />
          </Badge>
        ) : null}
      </div>

      <p className="text-sm">
        <Trans i18nKey="kinder:students.className" />:{' '}
        {child.className ?? '—'}
      </p>

      <Button asChild className="w-full" size="sm">
        <Link href={`${pathsConfig.parent.child}/${child.studentId}`}>
          <Trans i18nKey="kinder:parent.viewChild" />
        </Link>
      </Button>
    </div>
  );
}
