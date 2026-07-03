'use client';

import Link from 'next/link';

import { CalendarRange, ClipboardList } from 'lucide-react';

import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import {
  DataTableCard,
  EmptyState,
  kinderQueryKeys,
  StatusBadge,
  useKinderMutation,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { publishMenuAction } from '~/lib/kinder/meal-menu/server-actions';
import type { Menu } from '~/lib/kinder/meal-menu/types';

function formatDateRange(start: string, end: string) {
  return `${start} → ${end}`;
}

export function MenusList({
  menus,
  schoolId,
}: {
  menus: Menu[];
  schoolId: string;
}) {
  const { t } = useTranslation('kinder');

  const publishMutation = useKinderMutation({
    mutationFn: publishMenuAction,
    invalidateKeys: [kinderQueryKeys.menu(schoolId)],
    toast: {
      success: t('mealMenu.published'),
    },
  });

  if (menus.length === 0) {
    return (
      <EmptyState
        compact
        descriptionKey="kinder:mealMenu.emptyMenusDescription"
        icon={ClipboardList}
        titleKey="kinder:mealMenu.emptyMenus"
      />
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <DataTableCard
          description={<Trans i18nKey="kinder:mealMenu.menusListDescription" />}
          title={<Trans i18nKey="kinder:mealMenu.tabs.menus" />}
        >
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>
                  <Trans i18nKey="kinder:mealMenu.menuTitle" />
                </th>
                <th>
                  <Trans i18nKey="kinder:mealMenu.periodType" />
                </th>
                <th>
                  <Trans i18nKey="kinder:mealMenu.dateRange" />
                </th>
                <th>
                  <Trans i18nKey="kinder:mealMenu.status" />
                </th>
                <th className="text-right">
                  <Trans i18nKey="kinder:mealMenu.actions" />
                </th>
              </tr>
            </thead>
            <tbody>
              {menus.map((menu) => (
                <tr key={menu.id}>
                  <td>
                    <Link
                      className="font-medium hover:text-primary hover:underline"
                      href={`${pathsConfig.app.menuDetail}/${menu.id}`}
                    >
                      {menu.title}
                    </Link>
                  </td>
                  <td className="text-muted-foreground capitalize">
                    <Trans
                      i18nKey={`kinder:mealMenu.periodTypes.${menu.period_type}`}
                    />
                  </td>
                  <td className="text-muted-foreground">
                    {formatDateRange(menu.start_date, menu.end_date)}
                  </td>
                  <td>
                    <StatusBadge
                      tone={menu.status === 'published' ? 'success' : 'muted'}
                    >
                      <Trans
                        i18nKey={
                          menu.status === 'published' ?
                            'kinder:mealMenu.published'
                          : 'kinder:mealMenu.draft'
                        }
                      />
                    </StatusBadge>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`${pathsConfig.app.menuDetail}/${menu.id}`}>
                          <Trans i18nKey="kinder:mealMenu.weekPlanner" />
                        </Link>
                      </Button>
                      {menu.status === 'draft' ? (
                        <Button
 disabled={publishMutation.isPending}
 onClick={() =>
                            publishMutation.mutate({
                              schoolId,
                              menuId: menu.id,
                            })
                          }
                          size="sm"
                          type="button"
                        >
                          <Trans i18nKey="kinder:mealMenu.publish" />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableCard>
      </div>

      <div className="space-y-3 md:hidden">
        {menus.map((menu) => (
          <article className="kinder-mobile-card" key={menu.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  className="text-foreground font-medium hover:text-primary hover:underline"
                  href={`${pathsConfig.app.menuDetail}/${menu.id}`}
                >
                  {menu.title}
                </Link>
                <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                  <CalendarRange className="size-3.5 shrink-0" />
                  {formatDateRange(menu.start_date, menu.end_date)}
                </p>
              </div>
              <StatusBadge
                tone={menu.status === 'published' ? 'success' : 'muted'}
              >
                <Trans
                  i18nKey={
                    menu.status === 'published' ?
                      'kinder:mealMenu.published'
                    : 'kinder:mealMenu.draft'
                  }
                />
              </StatusBadge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="flex-1" size="sm" variant="outline">
                <Link href={`${pathsConfig.app.menuDetail}/${menu.id}`}>
                  <Trans i18nKey="kinder:mealMenu.weekPlanner" />
                </Link>
              </Button>
              {menu.status === 'draft' ? (
                <Button className="flex-1"
 disabled={publishMutation.isPending}
 onClick={() =>
                    publishMutation.mutate({ schoolId, menuId: menu.id })
                  }
                  size="sm"
                  type="button"
                >
                  <Trans i18nKey="kinder:mealMenu.publish" />
                </Button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
