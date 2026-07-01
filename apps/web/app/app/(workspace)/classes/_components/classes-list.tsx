'use client';

import Link from 'next/link';

import { School } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { EmptyState } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import type { ClassGroup } from '~/lib/kinder/classes/types';

export function ClassesList({ classes }: { classes: ClassGroup[] }) {
  if (classes.length === 0) {
    return (
      <EmptyState
        descriptionKey="kinder:ui.emptyDefaultDescription"
        icon={School}
        titleKey="kinder:classes.empty"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {classes.map((cls) => (
        <article className="kinder-card-grid-item" key={cls.id}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold tracking-tight">{cls.name}</p>
              <p className="text-muted-foreground font-mono text-xs">
                {cls.code}
              </p>
            </div>
            <Badge variant="secondary">
              {cls.enrollment_count ?? 0}/{cls.capacity}
            </Badge>
          </div>

          {cls.school_year?.name ? (
            <p className="text-muted-foreground text-sm">{cls.school_year.name}</p>
          ) : null}

          <Button asChild className="mt-auto w-full" size="sm" variant="outline">
            <Link href={`${pathsConfig.app.classDetail}/${cls.id}`}>
              <Trans i18nKey="kinder:classes.detail" />
            </Link>
          </Button>
        </article>
      ))}
    </div>
  );
}
