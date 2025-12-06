# ADSMedia + Capsule CRM Integration

Send emails to contacts from Capsule CRM.

## Setup

### 1. Capsule API + ADSMedia

```javascript
const CAPSULE_API_KEY = process.env.CAPSULE_API_KEY;
const ADSMEDIA_API_KEY = process.env.ADSMEDIA_API_KEY;

async function getCapsuleContacts(tag) {
  const response = await fetch(
    `https://api.capsulecrm.com/api/v2/parties?tag=${encodeURIComponent(tag)}`,
    {
      headers: {
        'Authorization': `Bearer ${CAPSULE_API_KEY}`,
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
      from_name: 'Sales Team',
    }),
  });
}

// Send to contacts with specific tag
async function sendToTaggedContacts(tag, subject, html) {
  const { parties } = await getCapsuleContacts(tag);
  
  for (const party of parties) {
    const email = party.emailAddresses?.[0]?.address;
    const name = party.firstName 
      ? `${party.firstName} ${party.lastName || ''}`
      : party.name;
    
    if (email) {
      await sendEmail(email, name, subject, html.replace('{{name}}', name));
    }
  }
}

// Example
await sendToTaggedContacts(
  'Hot Lead',
  'Special Offer for {{name}}',
  '<h1>Hi {{name}}!</h1><p>We have something special for you.</p>'
);
```

### 2. Webhook Handler

```javascript
const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhook/capsule', async (req, res) => {
  const { payload } = req.body;
  
  if (payload.eventType === 'party/created') {
    const party = payload.party;
    const email = party.emailAddresses?.[0]?.address;
    
    if (email) {
      await sendEmail(
        email,
        party.firstName || party.name,
        'Welcome!',
        '<h1>Thanks for connecting!</h1>'
      );
    }
  }
  
  res.sendStatus(200);
});

app.listen(3000);
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Capsule](https://capsulecrm.com)
- [Capsule API](https://developer.capsulecrm.com)

