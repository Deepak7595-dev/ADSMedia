# ADSMedia + Nimble Integration

Send emails to contacts from Nimble CRM.

## Setup

### Nimble API + ADSMedia

```javascript
const NIMBLE_API_KEY = process.env.NIMBLE_API_KEY;
const ADSMEDIA_API_KEY = process.env.ADSMEDIA_API_KEY;

async function getNimbleContacts(tag) {
  const response = await fetch(
    `https://api.nimble.com/api/v1/contacts?tag=${encodeURIComponent(tag)}`,
    {
      headers: {
        'Authorization': `Bearer ${NIMBLE_API_KEY}`,
      },
    }
  );
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
      from_name: 'Sales',
    }),
  });
}

// Send to tagged contacts
async function sendToTaggedContacts(tag, subject, html) {
  const { resources } = await getNimbleContacts(tag);
  
  for (const contact of resources) {
    const email = contact.fields?.email?.[0]?.value;
    const name = contact.fields?.['first name']?.[0]?.value;
    
    if (email) {
      await sendEmail(email, name || '', subject, html.replace('{{name}}', name || 'there'));
    }
  }
}

// Example
await sendToTaggedContacts(
  'Hot Lead',
  'Hello {{name}}!',
  '<h1>Hi {{name}}!</h1><p>Following up on our conversation.</p>'
);
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Nimble](https://nimble.com)
- [Nimble API](https://nimble.readthedocs.io)

