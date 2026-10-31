const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
function load(file, imports = {}) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', compiled)((name) => imports[name] || require(name), module, module.exports);
  return module.exports;
}

const logo = load('logoData.ts');
const { renderLedgerPdf } = load('ledgerPdf.ts', { './logoData': logo });
const out = path.join(root, 'tmp', 'pdfs');
fs.mkdirSync(out, { recursive: true });

const sample = (prefix, useSheetBalance) => {
  let balance = 0;
  return Array.from({ length: 12 }, (_, i) => {
    const billAmount = 3500 + i * 160;
    const withoutBill = i % 3 === 0 ? 600 : 0;
    const totalPurchase = billAmount + withoutBill;
    const totalPaid = i % 2 === 0 ? 1800 : 2400;
    balance += totalPurchase - totalPaid;
    return { date: `2026-10-${String(i + 1).padStart(2, '0')}`, billNo: `${prefix}-${100 + i}`, billAmount, withoutBill, totalPurchase, totalPaid, runningOutstanding: useSheetBalance ? balance + 1200 : balance };
  });
};

for (const workspace of ['Dana', 'Material']) {
  const html = renderLedgerPdf(workspace, [{ party: 'Sample Trading Co.', period: '01/10/2026 to 12/10/2026', rows: sample(workspace[0], workspace === 'Material') }])
    .replace('LEDGER STATEMENT</div>', 'DESIGN PREVIEW / SAMPLE DATA</div>');
  fs.writeFileSync(path.join(out, `${workspace.toLowerCase()}-ledger-preview.html`), html);
}

const allHtml = renderLedgerPdf('Dana', [
  { party: 'Sample Trading Co.', rows: sample('A', false) },
  { party: 'Example Industries', rows: sample('B', false).slice(0, 5) },
]).replaceAll('LEDGER STATEMENT</div>', 'DESIGN PREVIEW / SAMPLE DATA</div>');
fs.writeFileSync(path.join(out, 'all-parties-preview.html'), allHtml);
