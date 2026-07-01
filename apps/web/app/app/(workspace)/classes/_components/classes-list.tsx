'use client';

import Link from 'next/link';

import { School } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { DataTableCard, EmptyState } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import type { ClassGroup } from '~/lib/kinder/classes/types';

export function ClassesList({ classes }: { classes: ClassGroup[] }) {
  if (classes.length === 0) {
    return (
      <EmptyState
        compact
        descriptionKey="kinder:ui.emptyDefaultDescription"
        icon={School}
        titleKey="kinder:classes.empty"
      />
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <DataTableCard
          description={<Trans i18nKey="kinder:classes.listDescription" />}
          title={<Trans i18nKey="kinder:classes.title" />}
        >
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>
                  <Trans i18nKey="kinder:classes.name" />
                </th>
                <th>
                  <Trans i18nKey="kinder:classes.code" />
                </th>
                <th>
                  <Trans i18nKey="kinder:classes.schoolYear" />
                </th>
                <th>
                  <Trans i18nKey="kinder:classes.capacity" />
                </th>
                <th className="text-right" />
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls.id}>
                  <td>
                    <Link
                      className="font-medium hover:text-primary hover:underline"
                      href={`${pathsConfig.app.classDetail}/${cls.id}`}
                    >
                      {cls.name}
                    </Link>
                  </td>
                  <td className="text-muted-foreground font-mono text-xs">
                    {cls.code}
                  </td>
                  <td className="text-muted-foreground">
                    {cls.school_year?.name ?? '—'}
                  </td>
                  <td>
                    <Badge variant="secondary">
                      {cls.enrollment_count ?? 0}/{cls.capacity}
                    </Badge>
                  </td>
                  <td className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`${pathsConfig.app.classDetail}/${cls.id}`}>
                        <Trans i18nKey="kinder:classes.detail" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableCard>
      </div>

      <div className="grid gap-4 md:hidden">
        {classes.map((cls) => (
          <article className="kinder-mobile-card" key={cls.id}>
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
              <p className="text-muted-foreground text-sm">
                {cls.school_year.name}
              </p>
            ) : null}
            <Button asChild className="mt-auto w-full" size="sm" variant="outline">
              <Link href={`${pathsConfig.app.classDetail}/${cls.id}`}>
                <Trans i18nKey="kinder:classes.detail" />
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </>
  );
}
