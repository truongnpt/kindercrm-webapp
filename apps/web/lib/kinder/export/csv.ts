export function escapeCsvCell(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return '';
  }

  const text = String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export function buildCsv(headers: string[], rows: Array<Array<string | number | null | undefined>>) {
  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ];

  return lines.join('\n');
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob(['\uFEFF' + content], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(cell.trim());
      cell = '';
    } else if (char === '\n' || (char === '\r' && next === '\n')) {
      row.push(cell.trim());
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      row = [];
      cell = '';
      if (char === '\r') {
        i += 1;
      }
    } else if (char !== '\r') {
      cell += char;
    }
  }

  row.push(cell.trim());

  if (row.some((value) => value.length > 0)) {
    rows.push(row);
  }

  return rows;
}

export function mapCsvRowsByHeader(
  rows: string[][],
  headerMap: Record<string, string>,
): Array<Record<string, string>> {
  if (rows.length < 2) {
    return [];
  }

  const headerRow = rows[0];

  if (!headerRow) {
    return [];
  }

  const [, ...dataRows] = rows;
  const normalizedHeaders = headerRow.map((header) =>
    header.trim().toLowerCase(),
  );

  const columnIndexByField = new Map<string, number>();

  for (const [header, field] of Object.entries(headerMap)) {
    const index = normalizedHeaders.indexOf(header.toLowerCase());

    if (index >= 0) {
      columnIndexByField.set(field, index);
    }
  }

  return dataRows.map((row) => {
    const record: Record<string, string> = {};

    for (const [field, index] of columnIndexByField.entries()) {
      record[field] = row[index]?.trim() ?? '';
    }

    return record;
  });
}
