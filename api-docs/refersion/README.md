# ADSMedia + Refersion Integration

Send affiliate emails from Refersion.

## Setup

### Refersion Webhook Handler

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
      from_name: 'Affiliate Program',
    }),
  });
}

app.post('/webhook/refersion', async (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'affiliate.created':
      await sendEmail(
        data.affiliate.email,
        data.affiliate.first_name,
        'Welcome to Our Affiliate Program! 🎉',
        `
          <h1>Welcome, ${data.affiliate.first_name}!</h1>
          <p>You're now an official affiliate partner.</p>
          <h2>Your Affiliate Link</h2>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 4px;">
            <code>${data.affiliate.link}</code>
          </div>
          <h2>Commission Rate: ${data.affiliate.commission_rate}%</h2>
          <p>Start sharing and earning!</p>
        `
      );
      break;
      
    case 'conversion.created':
      await sendEmail(
        data.affiliate.email,
        data.affiliate.first_name,
        'New Conversion! 💰',
        `
          <h1>Cha-ching! 💰</h1>
          <p>You just earned a new commission!</p>
          <div style="background: #D1FAE5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="font-size: 36px; margin: 0; color: #10B981;">+$${data.conversion.commission}</p>
          </div>
          <p>Order Total: $${data.conversion.total}</p>
        `
      );
      break;
      
    case 'payout.sent':
      await sendEmail(
        data.affiliate.email,
        data.affiliate.first_name,
        'Payout Sent! 🎉',
        `
          <h1>Money's on the Way!</h1>
          <p>We've sent your payout of <strong>$${data.payout.amount}</strong>.</p>
          <p>It should arrive within 1-3 business days.</p>
          <p>Thank you for being an amazing affiliate!</p>
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
- [Refersion](https://refersion.com)

