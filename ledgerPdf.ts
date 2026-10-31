import { accuratePolymersLogo } from './logoData';

export type LedgerPdfRow = {
  date: string;
  billNo: string | number | null | undefined;
  billAmount: number;
  withoutBill: number;
  totalPurchase: number;
  totalPaid: number;
  runningOutstanding: number;
};

export type LedgerPdfGroup = { party: string; rows: LedgerPdfRow[]; overallRows?: LedgerPdfRow[]; period?: string };

const escapeHtml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const amount = (value: number) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const display = (value: unknown) => value === null || value === undefined || value === '' ? '—' : String(value);
const today = () => { const date = new Date(); return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`; };

export function renderLedgerPdf(workspace: 'Dana' | 'Material', groups: LedgerPdfGroup[]) {
  const sections = groups.map((group, index) => {
    const overallRows = group.overallRows || group.rows;
    const overallPurchase = overallRows.reduce((sum, row) => sum + row.totalPurchase, 0);
    const overallPaid = overallRows.reduce((sum, row) => sum + row.totalPaid, 0);
    const overallClosing = overallRows[overallRows.length - 1]?.runningOutstanding ?? 0;
    const body = group.rows.map((row) => `<tr>
      <td>${escapeHtml(display(row.date))}</td>
      <td>${escapeHtml(display(row.billNo))}</td>
      <td class="number">${escapeHtml(amount(row.billAmount))}</td>
      <td class="number">${escapeHtml(amount(row.withoutBill))}</td>
      <td class="number strong">${escapeHtml(amount(row.totalPurchase))}</td>
      <td class="number">${escapeHtml(amount(row.totalPaid))}</td>
      <td class="number balance">${escapeHtml(amount(row.runningOutstanding))}</td>
    </tr>`).join('');
    return `<section class="statement">
      <div class="brand-row">
        <img class="logo" src="${accuratePolymersLogo}" alt="Accurate Polymers" />
        <div class="brand-copy"><div class="company">ACCURATE POLYMERS</div><div class="brand-sub">PURCHASE ${workspace.toUpperCase()} / PARTY LEDGER</div></div>
        <div class="document-meta"><div class="badge">LEDGER STATEMENT</div><div>Generated ${today()}</div></div>
      </div>
      <div class="accent"></div>
      <div class="statement-head">
        <div><div class="label">STATEMENT FOR</div><h1>${escapeHtml(group.party)}</h1><div class="period">${escapeHtml(group.period || 'All dates')}</div></div>
        <div class="head-balance"><div>OVERALL OUTSTANDING</div><strong>${escapeHtml(amount(overallClosing))}</strong></div>
      </div>
      <div class="metric-group"><div class="metric-title">OVERALL <em>All dates</em></div><div class="metrics"><div><span>TOTAL PURCHASE</span><strong>${escapeHtml(amount(overallPurchase))}</strong></div><div><span>TOTAL PAID</span><strong>${escapeHtml(amount(overallPaid))}</strong></div><div><span>OUTSTANDING</span><strong>${escapeHtml(amount(overallClosing))}</strong></div><div><span>ENTRIES</span><strong>${overallRows.length}</strong></div></div></div>
      <div class="table-label">TRANSACTION DETAILS</div>
      <table><thead><tr><th>Date</th><th>Bill no.</th><th class="number">Bill amount</th><th class="number">Without bill</th><th class="number">Total purchase</th><th class="number">Total paid</th><th class="number">Running outstanding</th></tr></thead>
      <tbody>${body || '<tr><td class="empty" colspan="7">No entries in this statement.</td></tr>'}</tbody></table>
      <div class="footer"><span>Accurate Polymers · ${workspace} party ledger</span><span>Statement ${index + 1} of ${groups.length} · Generated from purchase records</span></div>
    </section>`;
  }).join('');

  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>
    @page{size:A4 landscape;margin:12mm 14mm}*{box-sizing:border-box}
    html,body{margin:0;padding:0;color:#1e214f;font-family:Arial,Helvetica,sans-serif;font-size:10px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .statement{page-break-after:always;break-after:page}.statement:last-child{page-break-after:auto;break-after:auto}
    .brand-row{display:flex;align-items:center;min-height:68px;padding-bottom:7px;gap:12px}.logo{width:84px;height:64px;object-fit:contain}.brand-copy{flex:1}.company{font-size:18px;letter-spacing:1.3px;font-weight:900;color:#211f58}.brand-sub{margin-top:5px;font-size:8px;letter-spacing:1.6px;font-weight:bold;color:#71759a}.document-meta{text-align:right;color:#73788e;line-height:1.7}.badge{border:1px solid #d7d8ac;border-radius:4px;padding:4px 8px;color:#393b64;font-size:8px;letter-spacing:1px;font-weight:bold;margin-bottom:6px}.accent{height:4px;background:#c9c895;margin-bottom:11px}
    .statement-head{display:flex;justify-content:space-between;align-items:center;background:#211f58;color:#fff;padding:13px 18px;border-radius:8px}.label{font-size:8px;letter-spacing:1.6px;font-weight:bold;color:#d4d3b2}h1{font-size:20px;line-height:1.2;margin:4px 0;word-break:break-word}.period{color:#c7c8df;font-size:10px}.head-balance{text-align:right;min-width:180px;padding-left:18px}.head-balance div{font-size:8px;letter-spacing:1px;color:#d4d3b2}.head-balance strong{display:block;font-size:19px;margin-top:5px;color:#fff}
    .metrics{display:flex;margin:10px 0 13px;border:1px solid #e6e6ef;border-radius:7px;background:#f8f8fb}.metrics>div{flex:1;padding:9px 13px;border-right:1px solid #e6e6ef}.metrics>div:last-child{border-right:0}.metrics span{display:block;color:#777b91;font-size:8px;font-weight:bold;letter-spacing:1px}.metrics strong{display:block;font-size:14px;margin-top:4px;color:#242451}.metrics .period-value{font-size:11px}.table-label{font-size:9px;font-weight:bold;letter-spacing:1.3px;margin-bottom:6px;color:#37365c}
    table{width:100%;border-collapse:collapse;table-layout:fixed}thead{display:table-header-group}tr{page-break-inside:avoid;break-inside:avoid}th{background:#eaeaf1;color:#38395d;text-align:left;padding:8px;font-size:8px;line-height:1.3}th:first-child{border-radius:5px 0 0 0}th:last-child{border-radius:0 5px 0 0}td{padding:6px 8px;border-bottom:1px solid #e9eaf0;color:#30334f;vertical-align:top;font-size:9px;overflow-wrap:anywhere}tbody tr:nth-child(even){background:#fafafd}.number{text-align:right;white-space:nowrap}.strong{font-weight:bold}.balance{font-weight:bold;color:#24215c}.empty{text-align:center;padding:20px;color:#777b91}
    .footer{display:flex;justify-content:space-between;border-top:1px solid #e6e6ef;color:#8b8da1;padding-top:7px;margin-top:12px;font-size:8px}
  </style></head><body>${sections}</body></html>`;
}
