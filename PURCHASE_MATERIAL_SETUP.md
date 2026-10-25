# Configure two separate Apps Script APIs

Purchase Dana and Purchase Material use separate Apps Script projects and separate `/exec` URLs. Neither script opens, reads, or updates the other workbook.

## 1. Dana API

Keep the existing Dana Apps Script project bound to the Purchase Dana spreadsheet. Its source is [apps-script/Code.gs](./apps-script/Code.gs), and its deployed URL remains `DANA_API_URL` in [api.ts](./api.ts).

## 2. Material API

1. Open the Purchase Material Google Sheet.
2. Select **Extensions → Apps Script**. This creates a script bound only to the Material workbook.
3. Replace its default code with [apps-script/Code.material.gs](./apps-script/Code.material.gs).
4. Deploy it as a **Web app** with access for the people who will use the app.
5. Copy the deployed URL ending in `/exec`.
6. Paste it into `MATERIAL_API_URL` in [api.ts](./api.ts).

```ts
const MATERIAL_API_URL = 'PASTE_MATERIAL_WEB_APP_EXEC_URL_HERE';
```

The Material script uses only its bound spreadsheet, `MATERIAL APP OPTIONS`, and the four Material sheets. Formula values for the summary, dashboard, and running ledger are always read from that workbook; the app does not recalculate them.
