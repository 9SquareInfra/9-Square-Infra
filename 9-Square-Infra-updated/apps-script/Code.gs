/**
 * 9 Square Infra — Lead capture Web App
 * Deploy as: Deploy → New deployment → Type: Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * Then paste the Web App URL into app.js as LEAD_CAPTURE_URL (see SETUP.md).
 *
 * Creates/uses a sheet named "Leads" in the bound Spreadsheet.
 * Emails 9squareinfra9@gmail.com on each consultation / newsletter submission.
 */

var NOTIFY_EMAIL = '9squareinfra9@gmail.com';
var SHEET_NAME = 'Leads';

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: '9 Square Infra Lead Capture' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var data = JSON.parse(raw);
    var type = (data.type || 'consultation').toString().toLowerCase();
    var sheet = getOrCreateSheet_();
    var ts = data.timestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    if (type === 'newsletter') {
      sheet.appendRow([
        ts,
        'newsletter',
        '',
        '',
        data.email || '',
        '',
        '',
        '',
        ''
      ]);
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: '9 Square Infra — Newsletter signup',
        body: 'New newsletter signup\n\nEmail: ' + (data.email || '') + '\nTime: ' + ts
      });
    } else {
      sheet.appendRow([
        ts,
        'consultation',
        data.name || '',
        data.phone || '',
        data.email || '',
        data.category || '',
        data.service || '',
        data.requirements || '',
        data.budget || ''
      ]);
      var lines = [
        'New website consultation enquiry',
        '',
        'Name: ' + (data.name || ''),
        'Phone: ' + (data.phone || ''),
        'Email: ' + (data.email || ''),
        'Category: ' + (data.category || ''),
        'Service: ' + (data.service || ''),
        'Requirements: ' + (data.requirements || ''),
        'Time: ' + ts
      ];
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: '9 Square Infra — New consultation enquiry',
        body: lines.join('\n')
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Open this script from a Google Sheet (Extensions → Apps Script), or bind a spreadsheet.');
  }
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Timestamp',
      'Type',
      'Name',
      'Phone',
      'Email',
      'Category',
      'Service',
      'Requirements',
      'Budget'
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}
