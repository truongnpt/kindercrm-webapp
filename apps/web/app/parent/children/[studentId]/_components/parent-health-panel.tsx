import { Trans } from '@kit/ui/trans';

import type {
  HealthGrowthRecord,
  HealthIncident,
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
}) {
  return (
    <div className="space-y-4">
      {medical ? (
        <div className="rounded-lg border p-4 text-sm">
          <p className="font-medium">
            <Trans i18nKey="kinder:health.profile" />
          </p>
          {medical.blood_type ? (
            <p>
              <Trans i18nKey="kinder:students.bloodType" />: {medical.blood_type}
            </p>
          ) : null}
          {medical.conditions ? (
            <p>
              <Trans i18nKey="kinder:students.conditions" />: {medical.conditions}
            </p>
          ) : null}
          {medical.doctor_name ? (
            <p>
              <Trans i18nKey="kinder:health.doctorName" />: {medical.doctor_name}
              {medical.doctor_phone ? ` (${medical.doctor_phone})` : ''}
            </p>
          ) : null}
        </div>
      ) : null}

      {allergies.length > 0 ? (
        <div className="rounded-lg border p-4 text-sm">
          <p className="mb-2 font-medium">
            <Trans i18nKey="kinder:health.allergies" />
          </p>
          <ul className="space-y-1">
            {allergies.map((allergy) => (
              <li key={allergy.allergen}>
                {allergy.allergen}
                {allergy.severity ? ` (${allergy.severity})` : ''}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {growth.length > 0 ? (
        <div className="rounded-lg border p-4 text-sm">
          <p className="mb-2 font-medium">
            <Trans i18nKey="kinder:health.tabs.growth" />
          </p>
          <ul className="space-y-1">
            {growth.slice(0, 5).map((record) => (
              <li key={record.id}>
                {record.record_date}: {record.height_cm ?? '—'} cm ·{' '}
                {record.weight_kg ?? '—'} kg · BMI {record.bmi ?? '—'}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {vaccinations.length > 0 ? (
        <div className="rounded-lg border p-4 text-sm">
          <p className="mb-2 font-medium">
            <Trans i18nKey="kinder:health.tabs.vaccinations" />
          </p>
          <ul className="space-y-1">
            {vaccinations.slice(0, 5).map((row) => (
              <li key={row.id}>
                {row.vaccine_name} · {row.administered_on}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {medications.length > 0 ? (
        <div className="rounded-lg border p-4 text-sm">
          <p className="mb-2 font-medium">
            <Trans i18nKey="kinder:health.tabs.medications" />
          </p>
          <ul className="space-y-1">
            {medications.map((med) => (
              <li key={med.id}>
                {med.name} · {med.dosage} · {med.frequency}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {incidents.length > 0 ? (
        <div className="rounded-lg border p-4 text-sm">
          <p className="mb-2 font-medium">
            <Trans i18nKey="kinder:health.tabs.incidents" />
          </p>
          <ul className="space-y-2">
            {incidents.slice(0, 5).map((incident) => (
              <li key={incident.id}>
                <p className="font-medium">{incident.incident_date}</p>
                <p className="text-muted-foreground">{incident.description}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {allergies.length === 0 &&
      !medical &&
      growth.length === 0 &&
      vaccinations.length === 0 &&
      medications.length === 0 &&
      incidents.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          <Trans i18nKey="kinder:parent.health.empty" />
        </p>
      ) : null}
    </div>
  );
}
