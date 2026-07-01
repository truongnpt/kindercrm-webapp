'use client';

import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
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

import { CreateMenuSchema } from '~/lib/kinder/meal-menu/schemas/meal-menu.schema';
import {
  createMenuAction,
  publishMenuAction,
} from '~/lib/kinder/meal-menu/server-actions';
import type { Menu } from '~/lib/kinder/meal-menu/types';
import pathsConfig from '~/config/paths.config';

export function MenusPanel({
  schoolId,
  menus,
}: {
  schoolId: string;
  menus: Menu[];
}) {
  const { t } = useTranslation('kinder');

  const form = useForm({
    resolver: zodResolver(CreateMenuSchema),
    defaultValues: {
      schoolId,
      title: '',
      periodType: 'weekly' as const,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10),
      notes: '',
    },
  });

  return (
    <div className="space-y-6">
      {menus.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          <Trans i18nKey="kinder:mealMenu.emptyMenus" />
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {menus.map((menu) => (
            <li
              className="flex items-center justify-between gap-3 p-4 text-sm"
              key={menu.id}
            >
              <div>
                <p className="font-medium">{menu.title}</p>
                <p className="text-muted-foreground text-xs">
                  {menu.start_date} → {menu.end_date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`${pathsConfig.app.menuDetail}/${menu.id}`}>
                    <Trans i18nKey="kinder:mealMenu.weekPlanner" />
                  </Link>
                </Button>
                <Badge
                  variant={menu.status === 'published' ? 'default' : 'secondary'}
                >
                  <Trans
                    i18nKey={
                      menu.status === 'published'
                        ? 'kinder:mealMenu.published'
                        : 'kinder:mealMenu.draft'
                    }
                  />
                </Badge>
                {menu.status === 'draft' ? (
                  <Button
                    onClick={async () => {
                      const promise = publishMenuAction({
                        schoolId,
                        menuId: menu.id,
                      });
                      toast.promise(promise, {
                        loading: t('schoolSettings.saving'),
                        success: t('mealMenu.published'),
                        error: t('common:genericServerError', { ns: 'common' }),
                      });
                      await promise;
                    }}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Trans i18nKey="kinder:mealMenu.publish" />
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Form {...form}>
        <form
          className="grid max-w-xl gap-3 rounded-lg border p-4"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = createMenuAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('schoolSettings.saved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
            form.reset({
              schoolId,
              title: '',
              periodType: 'weekly',
              startDate: new Date().toISOString().slice(0, 10),
              endDate: new Date(Date.now() + 6 * 86400000)
                .toISOString()
                .slice(0, 10),
              notes: '',
            });
          })}
        >
          <p className="font-medium">
            <Trans i18nKey="kinder:mealMenu.createMenu" />
          </p>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:mealMenu.menuTitle" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:mealMenu.startDate" />
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:mealMenu.endDate" />
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <Button type="submit">
            <Trans i18nKey="kinder:mealMenu.createMenu" />
          </Button>
        </form>
      </Form>
    </div>
  );
}
