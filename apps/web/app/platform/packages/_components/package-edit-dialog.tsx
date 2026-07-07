'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
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
import { Form } from '@kit/ui/form';
import { Trans } from '@kit/ui/trans';

import {
  PACKAGE_FEATURE_KEYS,
  type PackageFeature,
} from '~/lib/kinder/subscription/package-features';
import { UpdatePackageSchema } from '~/lib/kinder/platform/schemas/package.schema';
import { platformUpdatePackageAction } from '~/lib/kinder/platform/platform-ops-actions';
import type { Package } from '~/lib/kinder/types';

import { PackageFormFields } from './package-create-dialog';

function featuresFromPackage(pkg: Package) {
  const features = pkg.features as Record<string, boolean>;

  return {
    featuresAll: Boolean(features.all),
    features: PACKAGE_FEATURE_KEYS.reduce(
      (acc, key) => {
        acc[key] = Boolean(features[key]);
        return acc;
      },
      {} as Record<PackageFeature, boolean>,
    ),
  };
}

export function PackageEditDialog({ pkg }: { pkg: Package }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(UpdatePackageSchema),
    defaultValues: {
      packageId: pkg.id,
      name: pkg.name,
      description: pkg.description ?? '',
      maxStudents: pkg.max_students,
      maxCampuses: pkg.max_campuses,
      maxStorageMb: pkg.max_storage_mb,
      aiCreditsMonthly: pkg.ai_credits_monthly,
      priceMonthly: pkg.price_monthly,
      sortOrder: pkg.sort_order,
      isActive: pkg.is_active,
      stripePriceId: pkg.stripe_price_id ?? '',
      stripePriceYearlyId: pkg.stripe_price_yearly_id ?? '',
      priceYearly: pkg.price_yearly ?? 0,
      ...featuresFromPackage(pkg),
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        packageId: pkg.id,
        name: pkg.name,
        description: pkg.description ?? '',
        maxStudents: pkg.max_students,
        maxCampuses: pkg.max_campuses,
        maxStorageMb: pkg.max_storage_mb,
        aiCreditsMonthly: pkg.ai_credits_monthly,
        priceMonthly: pkg.price_monthly,
        sortOrder: pkg.sort_order,
        isActive: pkg.is_active,
        stripePriceId: pkg.stripe_price_id ?? '',
        stripePriceYearlyId: pkg.stripe_price_yearly_id ?? '',
        priceYearly: pkg.price_yearly ?? 0,
        ...featuresFromPackage(pkg),
      });
    }
  }, [open, pkg, form]);

  const featuresAll = form.watch('featuresAll');

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" type="button" variant="ghost">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey="kinder:platform.packages.editTitle" />
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              await platformUpdatePackageAction(values);
              setOpen(false);
              router.refresh();
            })}
          >
            <PackageFormFields control={form.control} featuresAll={Boolean(featuresAll)} />
            <Button className="mt-4 w-full" disabled={form.formState.isSubmitting} type="submit">
              <Trans i18nKey="kinder:platform.packages.save" />
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
