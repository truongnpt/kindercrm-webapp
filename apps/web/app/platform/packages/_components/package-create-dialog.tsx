'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm, type Control } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { Button } from '@kit/ui/button';
import { Checkbox } from '@kit/ui/checkbox';
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
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import {
  PACKAGE_FEATURE_KEYS,
  type PackageFeature,
} from '~/lib/kinder/subscription/package-features';
import { CreatePackageSchema } from '~/lib/kinder/platform/schemas/package.schema';
import { platformCreatePackageAction } from '~/lib/kinder/platform/platform-ops-actions';

const defaultFeatures = PACKAGE_FEATURE_KEYS.reduce(
  (acc, key) => {
    acc[key] = false;
    return acc;
  },
  {} as Record<PackageFeature, boolean>,
);

export function PackageCreateDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(CreatePackageSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      maxStudents: 50,
      maxCampuses: 1,
      maxStorageMb: 512,
      aiCreditsMonthly: 0,
      priceMonthly: 0,
      priceYearly: 0,
      sortOrder: 0,
      isActive: true,
      stripePriceId: '',
      stripePriceYearlyId: '',
      featuresAll: false,
      features: defaultFeatures,
    },
  });

  const featuresAll = form.watch('featuresAll');

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="mr-2 size-4" />
          <Trans i18nKey="kinder:platform.packages.create" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey="kinder:platform.packages.createTitle" />
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              await platformCreatePackageAction(values);
              setOpen(false);
              form.reset();
              router.refresh();
            })}
          >
            <PackageFormFields control={form.control} featuresAll={Boolean(featuresAll)} showCode />
            <Button className="mt-4 w-full" disabled={form.formState.isSubmitting} type="submit">
              <Trans i18nKey="kinder:platform.packages.save" />
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function PackageFormFields({
  control,
  featuresAll,
  showCode = false,
}: {
  control: Control<any>;
  featuresAll: boolean;
  showCode?: boolean;
}) {
  return (
    <div className="space-y-4">
      {showCode ? (
        <FormField
          control={control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input {...field} placeholder="starter" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}

      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea {...field} rows={2} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        {(
          [
            ['maxStudents', 'Max students'],
            ['maxCampuses', 'Max campuses'],
            ['maxStorageMb', 'Storage (MB)'],
            ['aiCreditsMonthly', 'AI credits/mo'],
            ['priceMonthly', 'Price monthly (VND)'],
            ['priceYearly', 'Price yearly (VND)'],
            ['sortOrder', 'Sort order'],
          ] as const
        ).map(([name, label]) => (
          <FormField
            control={control}
            key={name}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>

      <FormField
        control={control}
        name="stripePriceId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <Trans i18nKey="kinder:platform.packages.stripePriceId" />
            </FormLabel>
            <FormControl>
              <Input {...field} className="font-mono text-sm" placeholder="price_..." />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="stripePriceYearlyId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <Trans i18nKey="kinder:platform.packages.stripePriceYearlyId" />
            </FormLabel>
            <FormControl>
              <Input {...field} className="font-mono text-sm" placeholder="price_..." />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="featuresAll"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="font-normal">All features</FormLabel>
          </FormItem>
        )}
      />

      {!featuresAll ? (
        <div className="grid grid-cols-2 gap-2">
          {PACKAGE_FEATURE_KEYS.map((feature) => (
            <FormField
              control={control}
              key={feature}
              name={`features.${feature}`}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={Boolean(field.value)}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal text-xs">{feature}</FormLabel>
                </FormItem>
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
