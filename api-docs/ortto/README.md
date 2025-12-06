# ADSMedia + Ortto Integration

Send transactional emails from Ortto (formerly Autopilot).

## Setup

### 1. Ortto Webhook Handler

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

// Ortto Journey webhook
app.post('/webhook/ortto', async (req, res) => {
  const { person, event } = req.body;
  
  switch (event) {
    case 'person.subscribed':
      await sendEmail(
        person.email,
        person.firstName,
        'Welcome!',
        `<h1>Hi ${person.firstName}!</h1><p>Thanks for subscribing.</p>`
      );
      break;
      
    case 'person.tagged':
      if (req.body.tag === 'VIP') {
        await sendEmail(
          person.email,
          person.firstName,
          'Welcome to VIP!',
          `<h1>You're VIP Now!</h1><p>Enjoy exclusive benefits.</p>`
        );
      }
      break;
      
    case 'activity.purchase':
      await sendEmail(
        person.email,
        person.firstName,
        'Thank You for Your Purchase!',
        `<h1>Order Confirmed!</h1><p>Thanks for your order.</p>`
      );
      break;
  }
  
  res.sendStatus(200);
});

app.listen(3000);
```

### 2. Ortto API Integration

```javascript
const ORTTO_API_KEY = process.env.ORTTO_API_KEY;

async function getOrttoPeople(filter) {
  const response = await fetch('https://api.ap3api.com/v1/person/get', {
    method: 'POST',
    headers: {
      'X-Api-Key': ORTTO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filter }),
  });
  return response.json();
}

// Send to segment
async function sendToSegment(segmentId, subject, html) {
  const { people } = await getOrttoPeople({
    segment_id: segmentId,
  });
  
  for (const person of people) {
    await fetch('https://api.adsmedia.live/v1/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADSMEDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: person.email,
        to_name: person.first_name,
        subject,
        html: html.replace('{{name}}', person.first_name || 'there'),
        from_name: 'Marketing',
      }),
    });
  }
}
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Ortto](https://ortto.com)
- [Ortto API](https://help.ortto.com/a-]250-api-overview)

