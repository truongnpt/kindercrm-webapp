import { PanelEmpty, DataTableShell } from '~/components/kinder-ui';
import type { PlatformAuditLogItem } from '~/lib/kinder/platform/types';

export function AuditLogsTable({ logs }: { logs: PlatformAuditLogItem[] }) {
  if (logs.length === 0) {
    return <PanelEmpty messageKey="kinder:platform.audit.empty" />;
  }

  return (
    <DataTableShell>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Time</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Target</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="text-muted-foreground whitespace-nowrap text-xs">
                {new Date(log.created_at).toLocaleString('vi-VN')}
              </td>
              <td>
                <p className="font-medium">{log.actor_name ?? '—'}</p>
                <p className="text-muted-foreground text-xs">{log.actor_email}</p>
              </td>
              <td className="font-mono text-xs">{log.action}</td>
              <td className="text-muted-foreground text-xs">
                {log.target_type}
                {log.target_id ? ` · ${log.target_id.slice(0, 8)}…` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableShell>
  );
}
