/**
 * Client-side export helpers for the "Export report" action. Downloads the
 * currently displayed dashboard data as JSON or CSV — a stand-in until the
 * backend can generate richer report exports server-side.
 */

function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAsJson(data, filename = 'breaking-bread-report.json') {
  triggerDownload(JSON.stringify(data, null, 2), filename, 'application/json');
}

function flattenForCsv(data, prefix = '') {
  const rows = [];
  Object.entries(data).forEach(([key, value]) => {
    const label = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      rows.push(...flattenForCsv(value, label));
    } else if (Array.isArray(value)) {
      rows.push([label, JSON.stringify(value)]);
    } else {
      rows.push([label, value]);
    }
  });
  return rows;
}

export function exportAsCsv(data, filename = 'breaking-bread-report.csv') {
  const rows = flattenForCsv(data);
  const csv = ['field,value', ...rows.map(([k, v]) => `"${k}","${String(v).replace(/"/g, '""')}"`)].join('\n');
  triggerDownload(csv, filename, 'text/csv');
}
