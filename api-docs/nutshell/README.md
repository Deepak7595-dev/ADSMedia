# ADSMedia + Nutshell Integration

Send emails to leads from Nutshell CRM.

## Setup

### Nutshell API + ADSMedia

```javascript
const NUTSHELL_API_KEY = process.env.NUTSHELL_API_KEY;
const NUTSHELL_USER = process.env.NUTSHELL_USER;
const ADSMEDIA_API_KEY = process.env.ADSMEDIA_API_KEY;

async function nutshellRequest(method, params = {}) {
  const response = await fetch('https://app.nutshell.com/api/v1/json', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${NUTSHELL_USER}:${NUTSHELL_API_KEY}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: Date.now(),
    }),
  });
  return response.json();
}

async function sendEmail(to, toName, subject, html) {
  return fetch('https://api.adsmedia.live/v1/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ADSMEDIA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to, to_name: toName, subject, html,
      from_name: 'Sales Team',
    }),
  });
}

// Get leads and send campaign
async function sendCampaignToLeads(filter, subject, html) {
  const { result } = await nutshellRequest('searchLeads', {
    query: filter,
  });
  
  for (const lead of result.leads || []) {
    const contact = lead.contacts?.[0];
    const email = contact?.email?.['--primary'];
    
    if (email) {
      await sendEmail(
        email,
        contact.name,
        subject,
        html.replace('{{name}}', contact.name || 'there')
      );
    }
  }
}

// Example: Send to all open leads
await sendCampaignToLeads(
  { status: 'Open' },
  'Special Offer for {{name}}',
  '<h1>Hi {{name}}!</h1><p>We have an exclusive offer for you.</p>'
);
```

### Webhook Handler

```javascript
const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhook/nutshell', async (req, res) => {
  const { event, data } = req.body;
  
  if (event === 'lead.created') {
    const lead = data;
    const contact = lead.contacts?.[0];
    const email = contact?.email?.['--primary'];
    
    if (email) {
      await sendEmail(
        email,
        contact.name,
        'Thanks for Your Interest!',
        '<h1>Hi!</h1><p>Thanks for reaching out. We\'ll be in touch soon.</p>'
      );
    }
  }
  
  res.sendStatus(200);
});

app.listen(3000);
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Nutshell](https://nutshell.com)
- [Nutshell API](https://developers.nutshell.com)

