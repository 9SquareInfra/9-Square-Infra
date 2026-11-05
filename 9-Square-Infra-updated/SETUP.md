# 9 Square Infra website — setup

Upload the contents of this folder (or the zip root) to your GitHub Pages repo  
`9squareinfra/9-Square-Infra` so `index.html` sits at the repo root.

Lead capture (consultation form + newsletter) needs a one-time Google Apps Script deploy.

## 1. Create the spreadsheet + script

1. Open [Google Sheets](https://sheets.google.com) and create a blank spreadsheet (e.g. **9 Square Infra Leads**).
2. Menu: **Extensions → Apps Script**.
3. Delete any default code in `Code.gs`.
4. Copy the full contents of `apps-script/Code.gs` from this package and paste into the Apps Script editor. Save.

## 2. Deploy as a web app

1. In Apps Script: **Deploy → New deployment**.
2. Click the gear / type selector → choose **Web app**.
3. Settings:
   - **Description:** `9 Square Infra lead capture`
   - **Execute as:** **Me**
   - **Who has access:** **Anyone**
4. Click **Deploy**. Authorize with your Google account when asked (allow Sheets + Gmail if prompted).
5. Copy the **Web app URL** (looks like `https://script.google.com/macros/s/……/exec`).

## 3. Paste the URL into `app.js`

Open `app.js` and find this line near the consultation form logic:

```js
const LEAD_CAPTURE_URL = ""; // <-- PASTE APPS SCRIPT WEB APP URL HERE
```

Paste your Web App URL between the quotes, for example:

```js
const LEAD_CAPTURE_URL = "https://script.google.com/macros/s/XXXX/exec";
```

Save and push/upload `app.js` to GitHub Pages.

That single constant is used for:

- Consultation form submissions (`type: "consultation"`) — also still opens WhatsApp
- Newsletter signups (`type: "newsletter"`)

If you leave `LEAD_CAPTURE_URL` as `""`, the site still works: WhatsApp handoff and thank-you UI run; nothing is posted to Google.

## 4. What you get

- Rows appended to a sheet tab named **Leads**
- Email notification to **9squareinfra9@gmail.com** on each submission

## 5. After updating the script later

Use **Deploy → Manage deployments → Edit (pencil) → New version** so the same URL keeps working.
