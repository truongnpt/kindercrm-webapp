'use client';

import type { UseFormReturn } from 'react-hook-form';

import {
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

import {
  LEAD_STAGE_I18N_KEYS,
  LEAD_STAGES,
} from '~/lib/kinder/crm/pipeline-stages';

export function LeadFormFields({
  form,
  sources,
  showStage = false,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  sources: Array<{ id: string; name: string }>;
  showStage?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <FormField
        control={form.control}
        name="parentName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <Trans i18nKey="kinder:crm.parentName" />
            </FormLabel>
            <FormControl>
              <Input {...field} required value={String(field.value ?? '')} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:crm.phone" />
              </FormLabel>
              <FormControl>
                <Input {...field} required value={String(field.value ?? '')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:crm.email" />
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  {...field}
                  value={String(field.value ?? '')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="childName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:crm.childName" />
              </FormLabel>
              <FormControl>
                <Input {...field} value={String(field.value ?? '')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="childDob"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:crm.childDob" />
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={String(field.value ?? '')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="sourceId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <Trans i18nKey="kinder:crm.source" />
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              value={String(field.value ?? '')}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {sources.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {showStage ? (
        <FormField
          control={form.control}
          name="stage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:crm.stage" />
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={String(field.value ?? '')}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LEAD_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      <Trans i18nKey={LEAD_STAGE_I18N_KEYS[stage]} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <Trans i18nKey="kinder:crm.notes" />
            </FormLabel>
            <FormControl>
              <Textarea rows={3} {...field} value={String(field.value ?? '')} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
