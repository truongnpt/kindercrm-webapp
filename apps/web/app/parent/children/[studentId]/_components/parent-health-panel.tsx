import { HeartPulse } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import { ParentEmptyState, ParentSectionHeader } from '~/components/parent-portal';
import type {
  HealthGrowthRecord,
  HealthIncident,
  HealthMedicalCheckup,
  HealthMedication,
  HealthVaccination,
} from '~/lib/kinder/health/types';

export function ParentHealthPanel({
  allergies,
  medical,
  vaccinations,
  growth,
  medications,
  incidents,
  checkups,
}: {
  allergies: Array<{ allergen: string; severity: string | null }>;
  medical: {
    blood_type: string | null;
    conditions: string | null;
    medications: string | null;
    doctor_name: string | null;
    doctor_phone: string | null;
  } | null;
  vaccinations: HealthVaccination[];
  growth: HealthGrowthRecord[];
  medications: HealthMedication[];
  incidents: HealthIncident[];
  checkups: HealthMedicalCheckup[];
}) {
  const isEmpty =
    allergies.length === 0 &&
    !medical &&
    growth.length === 0 &&
    vaccinations.length === 0 &&
    medications.length === 0 &&
    incidents.length === 0 &&
    checkups.length === 0;

  if (isEmpty) {
    return (
      <ParentEmptyState
        descriptionKey="kinder:parent.health.empty"
        icon={HeartPulse}
        titleKey="kinder:parent.tabs.health"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ParentSectionHeader title={<Trans i18nKey="kinder:parent.tabs.health" />} />

      {medical ? (
        <HealthCard titleKey="kinder:health.profile">
          {medical.blood_type ? (
            <HealthRow
              labelKey="kinder:students.bloodType"
              value={medical.blood_type}
            />
          ) : null}
          {medical.conditions ? (
            <HealthRow
              labelKey="kinder:students.conditions"
              value={medical.conditions}
            />
          ) : null}
          {medical.doctor_name ? (
            <HealthRow
              labelKey="kinder:health.doctorName"
              value={`${medical.doctor_name}${medical.doctor_phone ? ` (${medical.doctor_phone})` : ''}`}
            />
          ) : null}
        </HealthCard>
      ) : null}

      {allergies.length > 0 ? (
        <HealthCard titleKey="kinder:health.allergies">
          <ul className="flex flex-col gap-2">
            {allergies.map((allergy) => (
              <li
                className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
                key={allergy.allergen}
              >
                <span className="font-medium">{allergy.allergen}</span>
                {allergy.severity ? (
                  <span className="text-xs">{allergy.severity}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </HealthCard>
      ) : null}

      {growth.length > 0 ? (
        <HealthCard titleKey="kinder:health.tabs.growth">
          <ul className="flex flex-col gap-2">
            {growth.slice(0, 5).map((record) => (
              <li
                className="rounded-lg bg-muted px-3 py-2 text-sm"
                key={record.id}
              >
                <span className="font-medium text-foreground">
                  {record.record_date}
                </span>
                <span className="text-muted-foreground">
                  {' '}
                  · {record.height_cm ?? '—'} cm · {record.weight_kg ?? '—'} kg
                  {record.bmi ? ` · BMI ${record.bmi}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </HealthCard>
      ) : null}

      {vaccinations.length > 0 ? (
        <HealthCard titleKey="kinder:health.tabs.vaccinations">
          <ul className="flex flex-col gap-2">
            {vaccinations.slice(0, 5).map((row) => (
              <li
                className="rounded-lg bg-muted px-3 py-2 text-sm text-foreground"
                key={row.id}
              >
                {row.vaccine_name} · {row.administered_on}
              </li>
            ))}
          </ul>
        </HealthCard>
      ) : null}

      {medications.length > 0 ? (
        <HealthCard titleKey="kinder:health.tabs.medications">
          <ul className="flex flex-col gap-2">
            {medications.map((med) => (
              <li
                className="rounded-lg bg-muted px-3 py-2 text-sm"
                key={med.id}
              >
                <span className="font-medium text-foreground">{med.name}</span>
                <span className="text-muted-foreground">
                  {' '}
                  · {med.dosage} · {med.frequency}
                </span>
              </li>
            ))}
          </ul>
        </HealthCard>
      ) : null}

      {checkups.length > 0 ? (
        <HealthCard titleKey="kinder:health.tabs.checkups">
          <ul className="flex flex-col gap-2">
            {checkups.slice(0, 5).map((row) => (
              <li
                className="rounded-lg bg-muted px-3 py-2 text-sm text-foreground"
                key={row.id}
              >
                {row.checkup_date} · {row.checkup_type}
                {row.notes ? ` — ${row.notes}` : ''}
              </li>
            ))}
          </ul>
        </HealthCard>
      ) : null}

      {incidents.length > 0 ? (
        <HealthCard titleKey="kinder:health.tabs.incidents">
          <ul className="flex flex-col gap-3">
            {incidents.slice(0, 5).map((incident) => (
              <li
                className="rounded-lg border border-border bg-muted px-3 py-3"
                key={incident.id}
              >
                <p className="text-sm font-semibold text-foreground">
                  {incident.incident_date}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {incident.description}
                </p>
              </li>
            ))}
          </ul>
        </HealthCard>
      ) : null}
    </div>
  );
}

function HealthCard({
  titleKey,
  children,
}: React.PropsWithChildren<{ titleKey: string }>) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 text-sm font-semibold text-foreground">
        <Trans i18nKey={titleKey} />
      </p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function HealthRow({
  labelKey,
  value,
}: {
  labelKey: string;
  value: string;
}) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted-foreground">
        <Trans i18nKey={labelKey} />:
      </span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
