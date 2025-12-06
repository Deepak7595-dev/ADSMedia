# ADSMedia + Everflow Integration

Send partner emails from Everflow affiliate platform.

## Setup

### Everflow Webhook Handler

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
      from_name: 'Partner Program',
    }),
  });
}

app.post('/webhook/everflow', async (req, res) => {
  const { type, data } = req.body;
  
  switch (type) {
    case 'affiliate_signup':
      await sendEmail(
        data.email,
        data.first_name,
        'Welcome to Our Partner Program!',
        `
          <h1>Welcome, ${data.first_name}!</h1>
          <p>Your affiliate account has been created.</p>
          <p>Login to your dashboard to get your tracking links.</p>
          <p><a href="${data.dashboard_url}" style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px;">Go to Dashboard →</a></p>
        `
      );
      break;
      
    case 'conversion':
      await sendEmail(
        data.affiliate.email,
        data.affiliate.name,
        'New Conversion! 💰',
        `
          <h1>Nice Work!</h1>
          <p>You earned a new commission:</p>
          <p style="font-size: 32px; color: #10B981; text-align: center;">+$${data.payout}</p>
          <p>Offer: ${data.offer.name}</p>
        `
      );
      break;
      
    case 'payout_approved':
      await sendEmail(
        data.affiliate.email,
        data.affiliate.name,
        'Payout Approved!',
        `
          <h1>Payout Coming!</h1>
          <p>Your payout of <strong>$${data.amount}</strong> has been approved.</p>
        `
      );
      break;
  }
  
  res.sendStatus(200);
});

app.listen(3000);
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Everflow](https://everflow.io)
- [Everflow API](https://developers.everflow.io)

