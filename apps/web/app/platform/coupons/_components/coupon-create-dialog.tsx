'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

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
  FormMessage,
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

import { useKinderMutation } from '~/components/kinder-ui';
import { platformCreateSubscriptionCouponAction } from '~/lib/kinder/subscription/coupon-actions';
import { CreateSubscriptionCouponSchema } from '~/lib/kinder/subscription/schemas/coupon.schema';

export function CouponCreateDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(CreateSubscriptionCouponSchema),
    defaultValues: {
      code: '',
      description: '',
      discountType: 'percent_off' as const,
      discountValue: 10,
      maxRedemptions: null as number | null,
      expiresAt: '',
      applicablePackageCodes: [] as string[],
    },
  });

  const createCoupon = useKinderMutation({
    mutationFn: platformCreateSubscriptionCouponAction,
    onSuccess: () => {
      setOpen(false);
      form.reset();
      router.refresh();
    },
  });

  const discountType = form.watch('discountType');

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="mr-2 size-4" />
          <Trans i18nKey="kinder:platform.coupons.create" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey="kinder:platform.coupons.createTitle" />
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => createCoupon.mutate(values))}
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:platform.coupons.code" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="uppercase" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:platform.coupons.descriptionField" />
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:platform.coupons.discountType" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="percent_off">
                        <Trans i18nKey="kinder:platform.coupons.typePercent" />
                      </SelectItem>
                      <SelectItem value="free_months">
                        <Trans i18nKey="kinder:platform.coupons.typeFreeMonths" />
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discountValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {discountType === 'percent_off' ? (
                      <Trans i18nKey="kinder:platform.coupons.percentValue" />
                    ) : (
                      <Trans i18nKey="kinder:platform.coupons.monthsValue" />
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
                      }
                      type="number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxRedemptions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:platform.coupons.maxRedemptions" />
                  </FormLabel>
                  <FormControl>
                    <Input
                      onChange={(event) =>
                        field.onChange(
                          event.target.value ? Number(event.target.value) : null,
                        )
                      }
                      type="number"
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="w-full"
              disabled={createCoupon.isPending}
              type="submit"
            >
              <Trans i18nKey="kinder:platform.coupons.save" />
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
