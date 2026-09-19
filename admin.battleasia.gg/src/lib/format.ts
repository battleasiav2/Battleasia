export function cell(value: unknown) {
  if (value == null) return '—';
  if (typeof value === 'boolean') return value ? 'yes' : 'no';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map((v) => (typeof v === 'string' ? v : JSON.stringify(v))).join(', ');
  if (typeof value === 'object') {
    const rec = value as Record<string, unknown>;
    if (rec.username) return String(rec.username);
    if (rec.name) return String(rec.name);
    if (rec.email) return String(rec.email);
    try {
      return JSON.stringify(value);
    } catch {
      return '—';
    }
  }
  return String(value);
}

export function rowId(row: Record<string, unknown>) {
  return String(row._id || row.id || '');
}

export function pick(row: Record<string, unknown>, key: string) {
  if (key.includes('.')) {
    return key.split('.').reduce<unknown>((acc, part) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined), row);
  }
  return row[key];
}

export function rangeFor(chip: string, custom?: { from?: string; to?: string }) {
  if (chip === 'custom' && custom?.from && custom?.to) {
    const start = new Date(`${custom.from}T00:00:00`);
    const end = new Date(`${custom.to}T23:59:59.999`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return {};
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }
  const now = new Date();
  const start = new Date(now);
  if (chip === 'today') start.setHours(0, 0, 0, 0);
  else if (chip === 'yesterday') {
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  } else if (chip === '7d') start.setDate(start.getDate() - 7);
  else if (chip === 'month') start.setDate(1);
  else return {};
  return { startDate: start.toISOString(), endDate: now.toISOString() };
}

export function toCsv(rows: Array<Record<string, unknown>>, columns: string[]) {
  const head = columns.join(',');
  const body = rows
    .map((row) =>
      columns
        .map((col) => `"${String(cell(pick(row, col))).replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');
  return `${head}\n${body}`;
}

export function downloadCsv(name: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function toExcelHtml(rows: Array<Record<string, unknown>>, columns: string[]) {
  const head = columns.map((c) => `<th>${escapeHtml(c)}</th>`).join('');
  const body = rows
    .map((row) => `<tr>${columns.map((col) => `<td>${escapeHtml(cell(pick(row, col)))}</td>`).join('')}</tr>`)
    .join('');
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8" /></head><body><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function downloadExcel(name: string, rows: Array<Record<string, unknown>>, columns: string[]) {
  const blob = new Blob([toExcelHtml(rows, columns)], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name.endsWith('.xls') ? name : `${name.replace(/\.csv$/i, '')}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}
