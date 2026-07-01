'use client';

import { useRef, useState, useTransition } from 'react';

import { Download, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import { Trans } from '@kit/ui/trans';

import { importLeadsAction } from '~/lib/kinder/crm/server-actions';
import type { LeadRow } from '~/lib/kinder/crm/load-leads';
import { LEAD_STAGES } from '~/lib/kinder/crm/pipeline-stages';
import {
  buildCsv,
  downloadCsv,
  mapCsvRowsByHeader,
  parseCsv,
} from '~/lib/kinder/export/csv';

const LEAD_CSV_HEADERS = {
  'phụ huynh': 'parentName',
  'phu huynh': 'parentName',
  parentname: 'parentName',
  'sđt': 'phone',
  sdt: 'phone',
  phone: 'phone',
  email: 'email',
  'tên bé': 'childName',
  'ten be': 'childName',
  childname: 'childName',
  'ngày sinh bé': 'childDob',
  'ngay sinh be': 'childDob',
  childdob: 'childDob',
  'ghi chú': 'notes',
  'ghi chu': 'notes',
  notes: 'notes',
  stage: 'stage',
};

export function LeadImportExport({
  schoolId,
  leads,
}: {
  schoolId: string;
  leads: LeadRow[];
}) {
  const { t } = useTranslation('kinder');
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleExport = () => {
    const csv = buildCsv(
      [
        'parent_name',
        'phone',
        'email',
        'child_name',
        'child_dob',
        'stage',
        'status',
        'notes',
      ],
      leads.map((lead) => [
        lead.parent_name,
        lead.phone,
        lead.email,
        lead.child_name,
        lead.child_dob,
        lead.stage,
        lead.status,
        lead.notes,
      ]),
    );

    downloadCsv(`leads-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      const text = String(reader.result ?? '');
      const rows = parseCsv(text);
      const mapped = mapCsvRowsByHeader(rows, LEAD_CSV_HEADERS);

      if (mapped.length === 0) {
        toast.error(t('importExport.invalidFile'));
        return;
      }

      startTransition(async () => {
        const result = await importLeadsAction({
          schoolId,
          leads: mapped.map((row) => ({
            parentName: row.parentName ?? '',
            phone: row.phone ?? '',
            email: row.email,
            childName: row.childName,
            childDob: row.childDob,
            notes: row.notes,
            stage: LEAD_STAGES.includes(row.stage as (typeof LEAD_STAGES)[number])
              ? (row.stage as (typeof LEAD_STAGES)[number])
              : undefined,
          })),
        });

        if (result.failed > 0) {
          toast.warning(
            t('importExport.partialSuccess', {
              imported: result.imported,
              failed: result.failed,
            }),
          );
        } else {
          toast.success(
            t('importExport.imported', { count: result.imported }),
          );
        }

        setOpen(false);
        router.refresh();
      });
    };

    reader.readAsText(file);
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleExport} size="sm" type="button" variant="outline">
        <Download className="mr-2 h-4 w-4" />
        <Trans i18nKey="kinder:importExport.export" />
      </Button>

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger asChild>
          <Button size="sm" type="button" variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            <Trans i18nKey="kinder:importExport.import" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <Trans i18nKey="kinder:importExport.importLeads" />
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            <Trans i18nKey="kinder:importExport.leadsHint" />
          </p>
          <input
            accept=".csv,.txt"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                handleImport(file);
              }

              event.target.value = '';
            }}
            ref={fileRef}
            type="file"
          />
          <Button
            disabled={pending}
            onClick={() => fileRef.current?.click()}
            type="button"
          >
            <Trans i18nKey="kinder:importExport.chooseFile" />
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
