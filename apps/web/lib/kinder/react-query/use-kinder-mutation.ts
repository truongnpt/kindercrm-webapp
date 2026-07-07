'use client';

import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { useKinderToast } from '~/components/kinder-ui/use-kinder-toast';

import { getRedirectUrlFromError } from './redirect-error';

type ToastMessages = {
  loading?: string;
  success?: string;
  error?: string | ((error: unknown) => string);
};

export type UseKinderMutationOptions<TData, TVariables, TContext = unknown> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Query keys to invalidate after success */
  invalidateKeys?: QueryKey[];
  /** Call router.refresh() after success (default: true). Set false for redirect-only actions. */
  refresh?: boolean;
  /** Show toast.promise feedback (default: true) */
  toast?: boolean | ToastMessages;
} & Pick<
  UseMutationOptions<TData, Error, TVariables, TContext>,
  'onSuccess' | 'onError' | 'onSettled' | 'mutationKey'
>;

/**
 * Standard mutation hook for Kinder server actions.
 * Combines React Query with toast feedback, cache invalidation, and RSC refresh.
 */
export function useKinderMutation<TData, TVariables, TContext = unknown>(
  options: UseKinderMutationOptions<TData, TVariables, TContext>,
) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const kinderToast = useKinderToast();

  const {
    mutationFn,
    invalidateKeys,
    refresh = true,
    toast = true,
    onSuccess,
    onError,
    onSettled,
    mutationKey,
  } = options;

  return useMutation({
    mutationKey,
    mutationFn: async (variables: TVariables) => {
      const promise = mutationFn(variables).catch((error: unknown) => {
        const redirectUrl = getRedirectUrlFromError(error);

        if (redirectUrl) {
          router.push(redirectUrl);
          return undefined as TData;
        }

        throw error;
      });

      if (toast !== false) {
        const messages = typeof toast === 'object' ? toast : undefined;
        void kinderToast.promise(promise, messages);
      }

      return promise;
    },
    onSuccess: async (data, variables, onMutateResult, mutationContext) => {
      if (invalidateKeys?.length) {
        await Promise.all(
          invalidateKeys.map((queryKey) =>
            queryClient.invalidateQueries({ queryKey }),
          ),
        );
      }

      if (refresh) {
        router.refresh();
      }

      await onSuccess?.(data, variables, onMutateResult, mutationContext);
    },
    onError,
    onSettled,
  });
}
