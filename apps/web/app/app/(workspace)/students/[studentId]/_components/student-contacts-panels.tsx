'use client';

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
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import {
  CreateAllergySchema,
  CreateEmergencyContactSchema,
  CreateParentSchema,
  CreatePickupPersonSchema,
  UpsertMedicalRecordSchema,
} from '~/lib/kinder/students/schemas/student.schema';
import {
  createAllergyAction,
  createEmergencyContactAction,
  createParentAction,
  createPickupPersonAction,
  upsertMedicalRecordAction,
} from '~/lib/kinder/students/server-actions';
import type {
  StudentAllergy,
  StudentEmergencyContact,
  StudentMedicalRecord,
  StudentParent,
  StudentPickupPerson,
} from '~/lib/kinder/students/types';

export function StudentContactsPanels({
  studentId,
  schoolId,
  parents,
  emergencyContacts,
  medical,
  allergies,
  pickupPersons,
}: {
  studentId: string;
  schoolId: string;
  parents: StudentParent[];
  emergencyContacts: StudentEmergencyContact[];
  medical: StudentMedicalRecord | null;
  allergies: StudentAllergy[];
  pickupPersons: StudentPickupPerson[];
}) {
  return (
    <div className="space-y-8">
      <ParentsSection
        parents={parents}
        schoolId={schoolId}
        studentId={studentId}
      />
      <EmergencySection
        contacts={emergencyContacts}
        schoolId={schoolId}
        studentId={studentId}
      />
      <MedicalSection
        medical={medical}
        schoolId={schoolId}
        studentId={studentId}
      />
      <AllergiesSection
        allergies={allergies}
        schoolId={schoolId}
        studentId={studentId}
      />
      <PickupSection
        persons={pickupPersons}
        schoolId={schoolId}
        studentId={studentId}
      />
    </div>
  );
}

function ParentsSection({
  studentId,
  schoolId,
  parents,
}: {
  studentId: string;
  schoolId: string;
  parents: StudentParent[];
}) {
  const { t } = useTranslation('kinder');
  const form = useForm({
    resolver: zodResolver(CreateParentSchema),
    defaultValues: {
      studentId,
      schoolId,
      fullName: '',
      phone: '',
      email: '',
      relationship: 'guardian',
      isPrimary: false,
      address: '',
    },
  });

  return (
    <section className="space-y-3">
      <h3 className="font-semibold">
        <Trans i18nKey="kinder:students.parents" />
      </h3>
      <ul className="kinder-list-panel">
        {parents.map((p) => (
          <li className="space-y-1 p-3 text-sm" key={p.id}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{p.full_name}</span>
              {p.is_primary ? <Badge>Primary</Badge> : null}
            </div>
            <p className="text-muted-foreground">
              {p.phone} {p.email ? `· ${p.email}` : ''}
            </p>
          </li>
        ))}
      </ul>
      <Form {...form}>
        <form
          className="kinder-form-panel sm:grid-cols-2"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = createParentAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('schoolSettings.saved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
            form.reset({
              studentId,
              schoolId,
              fullName: '',
              phone: '',
              email: '',
              relationship: 'guardian',
              isPrimary: false,
              address: '',
            });
          })}
        >
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:students.fullName" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:crm.phone" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="sm:col-span-2">
            <Button type="submit">
              <Trans i18nKey="kinder:students.addParent" />
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}

function EmergencySection({
  studentId,
  schoolId,
  contacts,
}: {
  studentId: string;
  schoolId: string;
  contacts: StudentEmergencyContact[];
}) {
  const { t } = useTranslation('kinder');
  const form = useForm({
    resolver: zodResolver(CreateEmergencyContactSchema),
    defaultValues: { studentId, schoolId, fullName: '', phone: '', relationship: '' },
  });

  return (
    <section className="space-y-3">
      <h3 className="font-semibold">
        <Trans i18nKey="kinder:students.emergency" />
      </h3>
      <ul className="kinder-list-panel">
        {contacts.map((c) => (
          <li className="p-3 text-sm" key={c.id}>
            <p className="font-medium">{c.full_name}</p>
            <p className="text-muted-foreground">{c.phone}</p>
          </li>
        ))}
      </ul>
      <Form {...form}>
        <form
          className="kinder-form-panel sm:grid-cols-2"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = createEmergencyContactAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('schoolSettings.saved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
            form.reset({ studentId, schoolId, fullName: '', phone: '', relationship: '' });
          })}
        >
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:students.fullName" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:crm.phone" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="sm:col-span-2">
            <Button type="submit">
              <Trans i18nKey="kinder:students.addEmergency" />
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}

function MedicalSection({
  studentId,
  schoolId,
  medical,
}: {
  studentId: string;
  schoolId: string;
  medical: StudentMedicalRecord | null;
}) {
  const { t } = useTranslation('kinder');
  const form = useForm({
    resolver: zodResolver(UpsertMedicalRecordSchema),
    defaultValues: {
      studentId,
      schoolId,
      bloodType: medical?.blood_type ?? '',
      conditions: medical?.conditions ?? '',
      medications: medical?.medications ?? '',
      doctorName: medical?.doctor_name ?? '',
      doctorPhone: medical?.doctor_phone ?? '',
      notes: medical?.notes ?? '',
    },
  });

  return (
    <section className="space-y-3">
      <h3 className="font-semibold">
        <Trans i18nKey="kinder:students.medical" />
      </h3>
      <Form {...form}>
        <form
          className="kinder-form-panel sm:grid-cols-2"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = upsertMedicalRecordAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('schoolSettings.saved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
          })}
        >
          <FormField
            control={form.control}
            name="bloodType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:students.bloodType" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="conditions"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>
                  <Trans i18nKey="kinder:students.conditions" />
                </FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="medications"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>
                  <Trans i18nKey="kinder:students.medications" />
                </FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="sm:col-span-2">
            <Button type="submit">
              <Trans i18nKey="kinder:students.save" />
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}

function AllergiesSection({
  studentId,
  schoolId,
  allergies,
}: {
  studentId: string;
  schoolId: string;
  allergies: StudentAllergy[];
}) {
  const { t } = useTranslation('kinder');
  const form = useForm({
    resolver: zodResolver(CreateAllergySchema),
    defaultValues: { studentId, schoolId, allergen: '', severity: '', notes: '' },
  });

  return (
    <section className="space-y-3">
      <h3 className="font-semibold">
        <Trans i18nKey="kinder:students.allergies" />
      </h3>
      <ul className="kinder-list-panel">
        {allergies.map((a) => (
          <li className="p-3 text-sm" key={a.id}>
            <p className="font-medium">{a.allergen}</p>
            {a.severity ? (
              <p className="text-muted-foreground">{a.severity}</p>
            ) : null}
          </li>
        ))}
      </ul>
      <Form {...form}>
        <form
          className="kinder-form-panel sm:grid-cols-2"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = createAllergyAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('schoolSettings.saved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
            form.reset({ studentId, schoolId, allergen: '', severity: '', notes: '' });
          })}
        >
          <FormField
            control={form.control}
            name="allergen"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:students.allergen" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:students.severity" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="sm:col-span-2">
            <Button type="submit">
              <Trans i18nKey="kinder:students.addAllergy" />
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}

function PickupSection({
  studentId,
  schoolId,
  persons,
}: {
  studentId: string;
  schoolId: string;
  persons: StudentPickupPerson[];
}) {
  const { t } = useTranslation('kinder');
  const form = useForm({
    resolver: zodResolver(CreatePickupPersonSchema),
    defaultValues: {
      studentId,
      schoolId,
      fullName: '',
      phone: '',
      idNumber: '',
      relationship: '',
    },
  });

  return (
    <section className="space-y-3">
      <h3 className="font-semibold">
        <Trans i18nKey="kinder:students.pickup" />
      </h3>
      <ul className="kinder-list-panel">
        {persons.map((p) => (
          <li className="p-3 text-sm" key={p.id}>
            <p className="font-medium">{p.full_name}</p>
            <p className="text-muted-foreground">
              {p.phone} {p.id_number ? `· ${p.id_number}` : ''}
            </p>
          </li>
        ))}
      </ul>
      <Form {...form}>
        <form
          className="kinder-form-panel sm:grid-cols-2"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = createPickupPersonAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('schoolSettings.saved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
            form.reset({
              studentId,
              schoolId,
              fullName: '',
              phone: '',
              idNumber: '',
              relationship: '',
            });
          })}
        >
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:students.fullName" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:crm.phone" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="sm:col-span-2">
            <Button type="submit">
              <Trans i18nKey="kinder:students.addPickup" />
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
