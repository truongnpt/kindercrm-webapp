'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import {
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import { SaveMenuTemplateSchema } from '~/lib/kinder/meal-menu/schemas/meal-menu.schema';
import { saveMenuTemplateAction } from '~/lib/kinder/meal-menu/server-actions';
import type { Menu } from '~/lib/kinder/meal-menu/types';

export function SaveTemplateDialog({
  schoolId,
  menus,
}: {
  schoolId: string;
  menus: Menu[];
}) {
  const { t } = useTranslation('kinder');
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(SaveMenuTemplateSchema),
    defaultValues: {
      schoolId,
      menuId: menus[0]?.id ?? '',
      name: '',
      description: '',
    },
  });

  const saveTemplate = useKinderMutation({
    mutationFn: saveMenuTemplateAction,
    invalidateKeys: [kinderQueryKeys.menu(schoolId)],
    toast: {
      success: t('mealMenu.templateSaved'),
    },
    onSuccess: () => {
      form.reset({
        schoolId,
        menuId: menus[0]?.id ?? '',
        name: '',
        description: '',
      });
      setOpen(false);
    },
  });

  if (menus.length === 0) {
    return null;
  }

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:mealMenu.saveTemplateDescription" />}
      footer={
        <KinderSubmitButton
          loading={saveTemplate.isPending}
          onClick={form.handleSubmit((data) => saveTemplate.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:mealMenu.saveTemplate" />
        </KinderSubmitButton>
      }
      onOpenChange={setOpen}
      open={open}
      title={<Trans i18nKey="kinder:mealMenu.saveTemplate" />}
      trigger={
        <Button className="rounded-lg" size="sm" type="button">
          <Plus className="mr-2 size-4" />
          <Trans i18nKey="kinder:mealMenu.saveTemplate" />
        </Button>
      }
    >
      <Form {...form}>
        <form className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="menuId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:mealMenu.tabs.menus" />
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {menus.map((menu) => (
                      <SelectItem key={menu.id} value={menu.id}>
                        {menu.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:crm.notes" />
                </FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </KinderFormDialog>
  );
}
