// This must be the deployed Apps Script Web App URL ending in /exec.
// Do not use the Apps Script library URL here; it does not run doGet/doPost.
// Deploy Code.gs and Code.material.gs as two different Apps Script Web Apps.
// Each workspace talks only to its own endpoint.
const DANA_API_URL = 'https://script.google.com/macros/s/AKfycbyiKuylbe9pxvC4WYB0HsWeBRPR8qI9x_NsUFykVh1jTfN90ZATuZKRIYMvpCAREN3NTQ/exec';
const MATERIAL_API_URL = 'https://script.google.com/macros/s/AKfycbzIOg37wzYHxanThc0L5AgJHno3aEnjJytInqVofDzpYLVNV8PAF2YLyaI8N8vqKWzxWQ/exec'; // Paste the separate Purchase Material Apps Script /exec URL here.

export type PurchaseValues = Record<string, any>;
export type PurchaseRecord = { sheetRow: number; values: PurchaseValues };
export type SummaryData = { kpis: { quantity: number; totalPurchase: number; totalPaid: number; balance: number }; suppliers: { party: string; quantity: number; totalPurchase: number; pending: number }[] };
export type DashboardData = { supplierPurchase: { party: string; amount: number }[]; paymentSummary: { billPaid: number; withoutPaid: number } };
export type BootstrapResponse = { records: PurchaseRecord[]; options: { parties: string[]; materials: string[]; paymentTypes: string[] }; summary: SummaryData; dashboard: DashboardData };
export type MaterialValues = { date?: string; supplier?: string; billNo?: string | number; material?: string; billAmount?: number | string; withoutBillAmount?: number | string; billPaid?: number | string; withoutPaid?: number | string; totalPaid?: number | string };
export type MaterialRecord = { sheetRow: number; values: MaterialValues };
export type MaterialSupplierSummary = { supplier: string; purchase: number; paid: number; outstanding: number };
export type MaterialSummary = { totalPurchase: number; totalPaid: number; totalOutstanding: number; suppliers: MaterialSupplierSummary[] };
export type MaterialLedgerRow = { date: string; billNo: string | number; billAmount: number; withoutBill: number; totalPurchase: number; totalPaid: number; runningOutstanding: number };
export type MaterialBootstrapResponse = { records: MaterialRecord[]; options: { suppliers: string[]; materials: string[] }; summary: MaterialSummary; dashboard: MaterialSummary };

async function request<T>(url: string, init: RequestInit, workspace: 'Dana' | 'Material'): Promise<T> {
  if (!url) throw new Error(`${workspace} Apps Script URL has not been configured in api.ts.`);
  const response = await fetch(url, init);
  const text = await response.text();
  let body: any;
  try { body = JSON.parse(text); } catch { throw new Error(`${workspace} Apps Script did not return JSON. Deploy its matching Code.gs file as a Web App.`); }
  if (!response.ok || body.ok === false) throw new Error(body.error || `Request failed (${response.status})`);
  return body.data ?? body;
}

export const api = {
  bootstrap: () => request<BootstrapResponse>(DANA_API_URL, { method: 'GET' }, 'Dana'),
  getLedger: (party: string) => request<PurchaseRecord[]>(DANA_API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'getLedger', party }) }, 'Dana'),
  savePurchase: (sheetRow: number, values: PurchaseValues) => request(DANA_API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'savePurchase', sheetRow, values }) }, 'Dana'),
  addOption: (kind: 'party' | 'material' | 'paymentType', value: string) => request(DANA_API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'addOption', kind, value }) }, 'Dana'),
};

export const materialApi = {
  bootstrap: () => request<MaterialBootstrapResponse>(MATERIAL_API_URL, { method: 'GET' }, 'Material'),
  getLedger: (supplier: string) => request<MaterialLedgerRow[]>(MATERIAL_API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'getLedger', supplier }) }, 'Material'),
  getAllLedgers: () => request<{ supplier: string; rows: MaterialLedgerRow[] }[]>(MATERIAL_API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'getAllLedgers' }) }, 'Material'),
  savePurchase: (sheetRow: number, values: MaterialValues) => request<{ sheetRow: number }>(MATERIAL_API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'savePurchase', sheetRow, values }) }, 'Material'),
  addOption: (kind: 'supplier' | 'material', value: string) => request(MATERIAL_API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'addOption', kind, value }) }, 'Material'),
};
