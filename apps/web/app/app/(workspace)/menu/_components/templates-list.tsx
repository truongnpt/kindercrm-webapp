'use client';

import { useState } from 'react';

import { BookCopy } from 'lucide-react';

import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Trans } from '@kit/ui/trans';

import {
  DataTableCard,
  EmptyState,
  KinderConfirmDialog,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import {
  applyMenuTemplateAction,
  deleteMenuTemplateAction,
} from '~/lib/kinder/meal-menu/server-actions';
import type { Menu } from '~/lib/kinder/meal-menu/types';
import type { MenuTemplate } from '~/lib/kinder/meal-menu/types-templates';

export function TemplatesList({
  templates,
  menus,
  schoolId,
}: {
  templates: MenuTemplate[];
  menus: Menu[];
  schoolId: string;
}) {
  const { t } = useTranslation('kinder');
  const [deleteTemplate, setDeleteTemplate] = useState<MenuTemplate | null>(
    null,
  );

  const draftMenus = menus.filter((menu) => menu.status === 'draft');

  const applyMutation = useKinderMutation({
    mutationFn: applyMenuTemplateAction,
    invalidateKeys: [kinderQueryKeys.menu(schoolId)],
    toast: {
      success: t('mealMenu.templateApplied'),
    },
  });

  const deleteMutation = useKinderMutation({
    mutationFn: deleteMenuTemplateAction,
    invalidateKeys: [kinderQueryKeys.menu(schoolId)],
    toast: {
      success: t('mealMenu.templateDeleted'),
    },
    onSuccess: () => setDeleteTemplate(null),
  });

  if (templates.length === 0) {
    return (
      <EmptyState
        compact
        descriptionKey="kinder:mealMenu.emptyTemplatesDescription"
        icon={BookCopy}
        titleKey="kinder:mealMenu.emptyTemplates"
      />
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <DataTableCard
          description={
            <Trans i18nKey="kinder:mealMenu.templatesListDescription" />
          }
          title={<Trans i18nKey="kinder:mealMenu.tabs.templates" />}
        >
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>
                  <Trans i18nKey="kinder:mealMenu.templateName" />
                </th>
                <th>
                  <Trans i18nKey="kinder:crm.notes" />
                </th>
                <th>
                  <Trans i18nKey="kinder:mealMenu.templateItems" />
                </th>
                <th className="text-right">
                  <Trans i18nKey="kinder:mealMenu.actions" />
                </th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => {
                const itemCount = (template.items as unknown[]).length;

                return (
                  <tr key={template.id}>
                    <td className="font-medium">{template.name}</td>
                    <td className="text-muted-foreground max-w-xs truncate">
                      {template.description || '—'}
                    </td>
                    <td className="text-muted-foreground">{itemCount}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {draftMenus.length > 0 ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" type="button" variant="outline">
                                <Trans i18nKey="kinder:mealMenu.applyTemplate" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {draftMenus.map((menu) => (
                                <DropdownMenuItem
                                  key={menu.id}
                                  onClick={() =>
                                    applyMutation.mutate({
                                      schoolId,
                                      menuId: menu.id,
                                      templateId: template.id,
                                    })
                                  }
                                >
                                  {menu.title}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : null}
                        <Button
                          onClick={() => setDeleteTemplate(template)}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          <Trans i18nKey="common:delete" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DataTableCard>
      </div>

      <div className="space-y-3 md:hidden">
        {templates.map((template) => {
          const itemCount = (template.items as unknown[]).length;

          return (
            <article className="kinder-mobile-card" key={template.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{template.name}</p>
                  {template.description ? (
                    <p className="text-muted-foreground mt-1 text-sm">
                      {template.description}
                    </p>
                  ) : null}
                  <p className="text-muted-foreground mt-2 text-xs">
                    {itemCount}{' '}
                    <Trans i18nKey="kinder:mealMenu.templateItems" />
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {draftMenus.map((menu) => (
                  <Button
                    key={menu.id}
                    disabled={applyMutation.isPending}
                    onClick={() =>
                      applyMutation.mutate({
                        schoolId,
                        menuId: menu.id,
                        templateId: template.id,
                      })
                    }
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    → {menu.title}
                  </Button>
                ))}
                <Button
                  onClick={() => setDeleteTemplate(template)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Trans i18nKey="common:delete" />
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <KinderConfirmDialog
        confirmLabel={<Trans i18nKey="common:delete" />}
        description={<Trans i18nKey="kinder:ui.confirmDeleteDescription" />}
        onConfirm={() => {
          if (deleteTemplate) {
            deleteMutation.mutate({
              schoolId,
              templateId: deleteTemplate.id,
            });
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTemplate(null);
          }
        }}
        open={Boolean(deleteTemplate)}
        pending={deleteMutation.isPending}
        title={<Trans i18nKey="kinder:ui.confirmDelete" />}
      />
    </>
  );
}
