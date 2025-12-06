# ADSMedia + Ontraport Integration

Send transactional emails from Ontraport CRM.

## Setup

### Ontraport Webhook Handler

```javascript
const express = require('express');
const app = express();
app.use(express.json());

const ADSMEDIA_API_KEY = process.env.ADSMEDIA_API_KEY;

async function sendEmail(to, toName, subject, html) {
  return fetch('https://api.adsmedia.live/v1/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ADSMEDIA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to, to_name: toName, subject, html,
      from_name: 'Marketing',
    }),
  });
}

app.post('/webhook/ontraport', async (req, res) => {
  const { data } = req.body;
  const contact = data.contact;
  
  // Triggered by Ontraport automation
  await sendEmail(
    contact.email,
    contact.firstname,
    req.body.subject || 'Message for You',
    req.body.html || `<p>Hi ${contact.firstname}!</p>`
  );
  
  res.sendStatus(200);
});

app.listen(3000);
```

### Ontraport API Integration

```javascript
const ONTRAPORT_API_KEY = process.env.ONTRAPORT_API_KEY;
const ONTRAPORT_APP_ID = process.env.ONTRAPORT_APP_ID;

async function getOntraportContacts(tagId) {
  const response = await fetch(
    `https://api.ontraport.com/1/Contacts?condition=[{"field":{"field":"tag_id"},"op":"=","value":"${tagId}"}]`,
    {
      headers: {
        'Api-Key': ONTRAPORT_API_KEY,
        'Api-Appid': ONTRAPORT_APP_ID,
      },
    }
  );
  return response.json();
}

async function sendToTag(tagId, subject, html) {
  const { data } = await getOntraportContacts(tagId);
  
  for (const contact of data) {
    await fetch('https://api.adsmedia.live/v1/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADSMEDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: contact.email,
        to_name: contact.firstname,
        subject,
        html: html.replace('{{firstname}}', contact.firstname || 'there'),
        from_name: 'Marketing',
      }),
    });
  }
}
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Ontraport](https://ontraport.com)
- [Ontraport API](https://api.ontraport.com)

