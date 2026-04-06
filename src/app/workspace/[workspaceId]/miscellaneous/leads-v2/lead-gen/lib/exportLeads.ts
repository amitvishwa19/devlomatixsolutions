import type { Lead } from '../data/mockLeads';
import { scoreLead } from '../lib/leadScoring';

const HEADERS = [
  'Business Name', 'Category', 'Phone', 'Email', 'Address', 'City',
  'State', 'Country', 'Pincode', 'Rating', 'Reviews', 'Website',
  'Status', 'Tags', 'Lead Score', 'Lead Grade',
];

function leadToRow(lead: Lead) {
  const score = scoreLead(lead);
  return [
    lead.businessName, lead.category, lead.phone, lead.email,
    lead.address, lead.city, lead.state, lead.country, lead.pincode,
    lead.rating, lead.reviews, lead.website, lead.status,
    (lead.tags || []).join('; '), score.total, score.grade,
  ];
}

function escCsv(v: unknown) {
  return `"${String(v ?? '').replace(/"/g, '""')}"`;
}

export function exportCSV(leads: Lead[], filename = 'leads.csv') {
  const csv = [
    HEADERS.join(','),
    ...leads.map((l) => leadToRow(l).map(escCsv).join(',')),
  ].join('\n');

  download(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }), filename);
}

export function exportExcel(leads: Lead[], filename = 'leads.xlsx') {
  // Build a simple XLSX-compatible XML spreadsheet
  const rows = leads.map(leadToRow);
  const xmlRows = [HEADERS, ...rows]
    .map(
      (row) =>
        '<Row>' +
        row
          .map((cell) => {
            const t = typeof cell === 'number' ? 'Number' : 'String';
            return `<Cell><Data ss:Type="${t}">${escXml(String(cell ?? ''))}</Data></Cell>`;
          })
          .join('') +
        '</Row>'
    )
    .join('\n');

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header"><Font ss:Bold="1"/><Interior ss:Color="#E2E8F0" ss:Pattern="Solid"/></Style>
  </Styles>
  <Worksheet ss:Name="Leads">
    <Table>
      ${xmlRows}
    </Table>
  </Worksheet>
</Workbook>`;

  download(
    new Blob([xml], { type: 'application/vnd.ms-excel' }),
    filename
  );
}

function escXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
