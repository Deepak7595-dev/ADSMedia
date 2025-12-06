# ADSMedia + Mercury Integration

Send banking notifications from Mercury.

## Setup

### Mercury Webhook Handler

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const ADSMEDIA_API_KEY = process.env.ADSMEDIA_API_KEY;
const MERCURY_WEBHOOK_SECRET = process.env.MERCURY_WEBHOOK_SECRET;

function verifySignature(req) {
  const signature = req.headers['mercury-signature'];
  const expected = crypto
    .createHmac('sha256', MERCURY_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');
  return signature === expected;
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
      from_name: 'Finance Notifications',
    }),
  });
}

app.post('/webhook/mercury', async (req, res) => {
  if (!verifySignature(req)) {
    return res.status(401).send('Invalid signature');
  }

  const { event, data } = req.body;
  const admins = await getFinanceTeam(); // Your function

  switch (event) {
    case 'transaction.created':
      const tx = data;
      const direction = tx.amount > 0 ? 'received' : 'sent';
      const amount = Math.abs(tx.amount);
      
      for (const admin of admins) {
        await sendEmail(
          admin.email,
          admin.name,
          `Transaction: $${amount.toFixed(2)} ${direction}`,
          `
            <h1>New Transaction</h1>
            <p style="font-size: 32px; color: ${tx.amount > 0 ? '#10B981' : '#EF4444'}; text-align: center;">
              ${tx.amount > 0 ? '+' : '-'}$${amount.toFixed(2)}
            </p>
            <p><strong>Description:</strong> ${tx.description}</p>
            <p><strong>Account:</strong> ${tx.account_name}</p>
            <p><strong>Date:</strong> ${tx.date}</p>
          `
        );
      }
      break;
      
    case 'balance.low':
      for (const admin of admins) {
        await sendEmail(
          admin.email,
          admin.name,
          '⚠️ Low Balance Alert',
          `
            <h1 style="color: #F59E0B;">Low Balance Warning</h1>
            <p>Your account balance is low:</p>
            <p style="font-size: 32px; text-align: center;">$${data.balance.toFixed(2)}</p>
            <p><strong>Account:</strong> ${data.account_name}</p>
          `
        );
      }
      break;
      
    case 'transfer.completed':
      for (const admin of admins) {
        await sendEmail(
          admin.email,
          admin.name,
          `Transfer Complete: $${data.amount.toFixed(2)}`,
          `
            <h1>Transfer Completed ✅</h1>
            <p>Amount: <strong>$${data.amount.toFixed(2)}</strong></p>
            <p>To: ${data.recipient}</p>
            <p>Status: Completed</p>
          `
        );
      }
      break;
  }
  
  res.sendStatus(200);
});

app.listen(3000);
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Mercury](https://mercury.com)
- [Mercury API](https://docs.mercury.com)

