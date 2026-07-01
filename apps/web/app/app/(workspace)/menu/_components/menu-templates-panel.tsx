'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import { SaveMenuTemplateSchema } from '~/lib/kinder/meal-menu/schemas/meal-menu.schema';
import { PanelEmpty } from '~/components/kinder-ui';
import {
  applyMenuTemplateAction,
  deleteMenuTemplateAction,
  saveMenuTemplateAction,
} from '~/lib/kinder/meal-menu/server-actions';
import type { MenuTemplate } from '~/lib/kinder/meal-menu/types-templates';
import type { Menu } from '~/lib/kinder/meal-menu/types';

export function MenuTemplatesPanel({
  schoolId,
  templates,
  menus,
}: {
  schoolId: string;
  templates: MenuTemplate[];
  menus: Menu[];
}) {
  const { t } = useTranslation('kinder');

  const form = useForm({
    resolver: zodResolver(SaveMenuTemplateSchema),
    defaultValues: {
      schoolId,
      menuId: menus[0]?.id ?? '',
      name: '',
      description: '',
    },
  });

  return (
    <div className="space-y-6">
      {templates.length === 0 ? (
        <PanelEmpty messageKey="kinder:mealMenu.emptyTemplates" />
      ) : (
        <ul className="kinder-list-panel">
          {templates.map((template) => (
            <li
              className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm"
              key={template.id}
            >
              <div>
                <p className="font-medium">{template.name}</p>
                {template.description ? (
                  <p className="text-muted-foreground text-xs">
                    {template.description}
                  </p>
                ) : null}
                <p className="text-muted-foreground mt-1 text-xs">
                  {(template.items as unknown[]).length}{' '}
                  <Trans i18nKey="kinder:mealMenu.templateItems" />
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {menus
                  .filter((menu) => menu.status === 'draft')
                  .map((menu) => (
                    <Button
                      key={menu.id}
                      onClick={async () => {
                        const promise = applyMenuTemplateAction({
                          schoolId,
                          menuId: menu.id,
                          templateId: template.id,
                        });
                        toast.promise(promise, {
                          loading: t('schoolSettings.saving'),
                          success: t('mealMenu.templateApplied'),
                          error: t('common:genericServerError', { ns: 'common' }),
                        });
                        await promise;
                      }}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      → {menu.title}
                    </Button>
                  ))}
                <Button
                  onClick={async () => {
                    const promise = deleteMenuTemplateAction({
                      schoolId,
                      templateId: template.id,
                    });
                    toast.promise(promise, {
                      loading: t('schoolSettings.saving'),
                      success: t('mealMenu.templateDeleted'),
                      error: t('common:genericServerError', { ns: 'common' }),
                    });
                    await promise;
                  }}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Trans i18nKey="common:delete" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {menus.length > 0 ? (
        <Form {...form}>
          <form
            className="kinder-form-panel max-w-xl grid-cols-1"
            onSubmit={form.handleSubmit(async (data) => {
              const promise = saveMenuTemplateAction(data);
              toast.promise(promise, {
                loading: t('schoolSettings.saving'),
                success: t('mealMenu.templateSaved'),
                error: t('common:genericServerError', { ns: 'common' }),
              });
              await promise;
              form.reset({
                schoolId,
                menuId: menus[0]?.id ?? '',
                name: '',
                description: '',
              });
            })}
          >
            <p className="font-medium">
              <Trans i18nKey="kinder:mealMenu.saveTemplate" />
            </p>
            <FormField
              control={form.control}
              name="menuId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:mealMenu.tabs.menus" />
                  </FormLabel>
                  <FormControl>
                    <select
                      className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                      {...field}
                    >
                      {menus.map((menu) => (
                        <option key={menu.id} value={menu.id}>
                          {menu.title}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:mealMenu.templateName" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">
              <Trans i18nKey="kinder:mealMenu.saveTemplate" />
            </Button>
          </form>
        </Form>
      ) : null}
    </div>
  );
}
