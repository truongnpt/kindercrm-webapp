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

const STATUSES = [
  'active',
  'inactive',
  'graduated',
  'transferred',
  'withdrawn',
] as const;

export function StudentFormFields({
  form,
  showStatus = true,
  showCode,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  showStatus?: boolean;
  showCode?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      {showCode ? (
        <p className="text-muted-foreground font-mono text-sm">{showCode}</p>
      ) : null}

      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <Trans i18nKey="kinder:students.fullName" />
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
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:students.dateOfBirth" />
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

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:students.gender" />
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
                  <SelectItem value="male">
                    <Trans i18nKey="kinder:students.genderMale" />
                  </SelectItem>
                  <SelectItem value="female">
                    <Trans i18nKey="kinder:students.genderFemale" />
                  </SelectItem>
                  <SelectItem value="other">
                    <Trans i18nKey="kinder:students.genderOther" />
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="className"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:students.className" />
              </FormLabel>
              <FormControl>
                <Input {...field} value={String(field.value ?? '')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showStatus ? (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:students.status" />
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
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        <Trans
                          i18nKey={`kinder:students.statuses.${status}`}
                        />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
      </div>

      <FormField
        control={form.control}
        name="enrollmentDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <Trans i18nKey="kinder:students.enrollmentDate" />
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

      <FormField
        control={form.control}
        name="photoUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <Trans i18nKey="kinder:students.photoUrl" />
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
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <Trans i18nKey="kinder:students.notes" />
            </FormLabel>
            <FormControl>
              <Textarea rows={4} {...field} value={String(field.value ?? '')} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
