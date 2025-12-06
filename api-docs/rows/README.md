# ADSMedia + Rows Integration

Send emails from Rows spreadsheet data.

## Setup

### Rows Automation

```javascript
// Rows automation script
const ADSMEDIA_API_KEY = 'your_api_key';

async function sendEmailsFromRows() {
  // Get data from current spreadsheet
  const rows = getRange('A2:D100'); // Email, Name, Subject, Body columns
  
  for (const row of rows) {
    const [email, name, subject, body] = row;
    
    if (!email) continue;
    
    await fetch('https://api.adsmedia.live/v1/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADSMEDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        to_name: name || '',
        subject: subject || 'Hello',
        html: `<p>${body || 'Hello!'}</p>`,
        from_name: 'Your Team',
      }),
    });
  }
}
```

### API Integration

```javascript
const ROWS_API_KEY = process.env.ROWS_API_KEY;
const ADSMEDIA_API_KEY = process.env.ADSMEDIA_API_KEY;

async function getRowsData(spreadsheetId, range) {
  const response = await fetch(
    `https://api.rows.com/v1/spreadsheets/${spreadsheetId}/values/${range}`,
    {
      headers: {
        'Authorization': `Bearer ${ROWS_API_KEY}`,
      },
    }
  );
  return response.json();
}

async function sendMailMerge(spreadsheetId, templateHtml) {
  const { values } = await getRowsData(spreadsheetId, 'Sheet1!A1:Z1000');
  const headers = values[0];
  const rows = values.slice(1);
  
  for (const row of rows) {
    const data = {};
    headers.forEach((h, i) => data[h] = row[i]);
    
    if (!data.email) continue;
    
    let html = templateHtml;
    for (const [key, value] of Object.entries(data)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
    }
    
    await fetch('https://api.adsmedia.live/v1/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADSMEDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: data.email,
        to_name: data.name || '',
        subject: data.subject || 'Hello',
        html,
        from_name: 'Team',
      }),
    });
  }
}

// Example usage
await sendMailMerge(
  'spreadsheet_123',
  '<h1>Hi {{name}}!</h1><p>{{message}}</p>'
);
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Rows](https://rows.com)

