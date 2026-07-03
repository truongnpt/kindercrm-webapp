'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
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
import { Trans } from '@kit/ui/trans';

import { UpsertMenuItemSchema } from '~/lib/kinder/meal-menu/schemas/meal-menu.schema';
import {
  deleteMenuItemAction,
  upsertMenuItemAction,
} from '~/lib/kinder/meal-menu/server-actions';
import type { Dish, MenuItem, MenuWithItems } from '~/lib/kinder/meal-menu/types';

const MEAL_SLOTS = ['breakfast', 'lunch', 'snack', 'dinner'] as const;

function eachDateInRange(startDate: string, endDate: string) {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function MenuWeekPlanner({
  schoolId,
  menu,
  dishes,
}: {
  schoolId: string;
  menu: MenuWithItems;
  dishes: Dish[];
}) {
  const dates = eachDateInRange(menu.start_date, menu.end_date);

  const itemsByKey = new Map<string, MenuItem & { dish: Dish | null }>();

  for (const item of menu.items) {
    itemsByKey.set(`${item.menu_date}:${item.meal_slot}`, item);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border text-sm">
        <thead>
          <tr className="bg-muted/50">
            <th className="border px-3 py-2 text-left">
              <Trans i18nKey="kinder:attendance.date" />
            </th>
            {MEAL_SLOTS.map((slot) => (
              <th className="border px-3 py-2 text-left" key={slot}>
                <Trans i18nKey={`kinder:mealMenu.mealSlots.${slot}`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dates.map((date) => (
            <tr key={date}>
              <td className="border px-3 py-2 font-mono text-xs">{date}</td>
              {MEAL_SLOTS.map((slot) => {
                const item = itemsByKey.get(`${date}:${slot}`);

                return (
                  <td className="border px-2 py-2 align-top" key={slot}>
                    <MenuCellEditor
                      date={date}
                      dishes={dishes}
                      item={item ?? null}
                      menuId={menu.id}
                      schoolId={schoolId}
                      slot={slot}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MenuCellEditor({
  schoolId,
  menuId,
  date,
  slot,
  dishes,
  item,
}: {
  schoolId: string;
  menuId: string;
  date: string;
  slot: (typeof MEAL_SLOTS)[number];
  dishes: Dish[];
  item: (MenuItem & { dish: Dish | null }) | null;
}) {
  const { t } = useTranslation('kinder');
  const [open, setOpen] = useState(false);

  const label =
    item?.custom_dish_name || item?.dish?.name || (
      <span className="text-muted-foreground">—</span>
    );

  const form = useForm({
    resolver: zodResolver(UpsertMenuItemSchema),
    defaultValues: {
      schoolId,
      menuId,
      menuDate: date,
      mealSlot: slot,
      dishId: item?.dish_id ?? '',
      customDishName: item?.custom_dish_name ?? '',
      portionNotes: item?.portion_notes ?? '',
      sortOrder: 0,
    },
  });

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <button
          className="hover:bg-muted/50 min-h-12 w-full rounded px-1 py-1 text-left text-xs"
          type="button"
        >
          {label}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {date} · <Trans i18nKey={`kinder:mealMenu.mealSlots.${slot}`} />
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit(async (data) => {
              const promise = upsertMenuItemAction(data);
              toast.promise(promise, {
                loading: t('schoolSettings.saving'),
                success: t('schoolSettings.saved'),
                error: t('common:genericServerError', { ns: 'common' }),
              });
              await promise;
              setOpen(false);
            })}
          >
            <FormField
              control={form.control}
              name="dishId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:mealMenu.dishName" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dishes.map((dish) => (
                        <SelectItem key={dish.id} value={dish.id}>
                          {dish.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customDishName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:mealMenu.customDish" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Tên món tùy chỉnh" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="portionNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:mealMenu.portionNotes" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button type="submit">
                <Trans i18nKey="common:save" defaults="Save" />
              </Button>
              {item ? (
                <Button
 onClick={async () => {
                    const promise = deleteMenuItemAction({
                      schoolId,
                      menuItemId: item.id,
                    });
                    await promise;
                    setOpen(false);
                  }}
                  type="button"
                  variant="destructive"
                >
                  <Trans i18nKey="common:delete" />
                </Button>
              ) : null}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
