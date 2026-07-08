'use client';

import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { ArrowRight, ArrowRightIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { useUpdateUser } from '@kit/supabase/hooks/use-update-user-mutation';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { If } from '@kit/ui/if';
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import { PasswordResetSchema } from '../schemas/password-reset.schema';

export function UpdatePasswordForm(params: { redirectTo: string }) {
  const updateUser = useUpdateUser();

  const form = useForm<z.infer<typeof PasswordResetSchema>>({
    resolver: zodResolver(PasswordResetSchema),
    defaultValues: {
      password: '',
      repeatPassword: '',
    },
  });

  if (updateUser.error) {
    return <ErrorState onRetry={() => updateUser.reset()} />;
  }

  if (updateUser.data && !updateUser.isPending) {
    return <SuccessState redirectTo={params.redirectTo} />;
  }

  return (
    <Form {...form}>
      <form
        className="w-full space-y-2.5"
        onSubmit={form.handleSubmit(({ password }) => {
          return updateUser.mutateAsync({
            password,
            redirectTo: params.redirectTo,
          });
        })}
      >
        <FormField
          name={'password'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey={'common:password'} />
              </FormLabel>

              <FormControl>
                <Input
                  required
                  data-test="password-input"
                  type="password"
                  placeholder=""
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name={'repeatPassword'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey={'common:repeatPassword'} />
              </FormLabel>

              <FormControl>
                <Input
                  required
                  data-test="repeat-password-input"
                  type="password"
                  placeholder=""
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={updateUser.isPending}
          type="submit"
          className="group w-full"
        >
          <If
            condition={updateUser.isPending}
            fallback={
              <>
                <Trans i18nKey={'auth:updatePassword'} />

                <ArrowRight
                  className={
                    'zoom-in animate-in slide-in-from-left-2 fill-mode-both h-4 delay-500 duration-500'
                  }
                />
              </>
            }
          >
            <Trans i18nKey={'auth:updatingPassword'} />
          </If>
        </Button>
      </form>
    </Form>
  );
}

function SuccessState(props: { redirectTo: string }) {
  return (
    <div className={'flex flex-col space-y-4'}>
      <Alert variant={'success'}>
        <CheckIcon className={'s-6'} />

        <AlertTitle>
          <Trans i18nKey={'account:updatePasswordSuccess'} />
        </AlertTitle>

        <AlertDescription>
          <Trans i18nKey={'account:updatePasswordSuccessMessage'} />
        </AlertDescription>
      </Alert>

      <Link href={props.redirectTo}>
        <Button variant={'outline'} className={'w-full'}>
          <span>
            <Trans i18nKey={'common:backToHomePage'} />
          </span>

          <ArrowRightIcon className={'ml-2 h-4'} />
        </Button>
      </Link>
    </div>
  );
}

function ErrorState(props: { onRetry: () => void }) {
  return (
    <div className={'flex flex-col space-y-4'}>
      <Alert variant={'destructive'}>
        <ExclamationTriangleIcon className={'s-6'} />

        <AlertTitle>
          <Trans i18nKey={'common:genericError'} />
        </AlertTitle>

        <AlertDescription>
          <Trans i18nKey={'auth:resetPasswordError'} />
        </AlertDescription>
      </Alert>

      <Button onClick={props.onRetry} variant={'outline'}>
        <Trans i18nKey={'common:retry'} />
      </Button>
    </div>
  );
}
