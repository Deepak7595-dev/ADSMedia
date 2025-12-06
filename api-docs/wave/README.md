# ADSMedia + Wave Integration

Send invoice emails from Wave accounting.

## Setup

### Wave GraphQL + ADSMedia

```javascript
const WAVE_API_KEY = process.env.WAVE_API_KEY;
const WAVE_BUSINESS_ID = process.env.WAVE_BUSINESS_ID;
const ADSMEDIA_API_KEY = process.env.ADSMEDIA_API_KEY;

async function waveQuery(query, variables = {}) {
  const response = await fetch('https://gql.waveapps.com/graphql/public', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WAVE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

// Send invoice via ADSMedia
async function sendInvoiceEmail(invoiceId) {
  const { data } = await waveQuery(`
    query GetInvoice($id: ID!) {
      invoice(id: $id) {
        invoiceNumber
        total { value currency { code } }
        dueDate
        customer {
          name
          email
        }
        items {
          description
          quantity
          unitPrice { value }
          subtotal { value }
        }
        viewUrl
      }
    }
  `, { id: invoiceId });
  
  const invoice = data.invoice;
  
  const itemsHtml = invoice.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.description}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.unitPrice.value}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.subtotal.value}</td>
    </tr>
  `).join('');
  
  const html = `
    <h1>Invoice #${invoice.invoiceNumber}</h1>
    <p>Hi ${invoice.customer.name},</p>
    <p>Please find your invoice below.</p>
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="background: #f5f5f5;">
        <th style="padding: 10px; text-align: left;">Description</th>
        <th style="padding: 10px;">Qty</th>
        <th style="padding: 10px; text-align: right;">Price</th>
        <th style="padding: 10px; text-align: right;">Subtotal</th>
      </tr>
      ${itemsHtml}
    </table>
    
    <p style="font-size: 18px; text-align: right; margin-top: 20px;">
      <strong>Total: ${invoice.total.currency.code} ${invoice.total.value}</strong>
    </p>
    <p>Due Date: ${invoice.dueDate}</p>
    
    <p style="text-align: center; margin-top: 30px;">
      <a href="${invoice.viewUrl}" style="background: #4F46E5; color: white; padding: 15px 40px; text-decoration: none; border-radius: 4px;">View & Pay Invoice</a>
    </p>
  `;
  
  await fetch('https://api.adsmedia.live/v1/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ADSMEDIA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: invoice.customer.email,
      to_name: invoice.customer.name,
      subject: `Invoice #${invoice.invoiceNumber} from Your Company`,
      html,
      from_name: 'Billing',
    }),
  });
}
```

### Webhook Handler

```javascript
const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhook/wave', async (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'invoice.created':
      await sendInvoiceEmail(data.invoice.id);
      break;
      
    case 'payment.received':
      await sendPaymentConfirmation(data);
      break;
  }
  
  res.sendStatus(200);
});

async function sendPaymentConfirmation(payment) {
  await fetch('https://api.adsmedia.live/v1/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ADSMEDIA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: payment.customer.email,
      to_name: payment.customer.name,
      subject: 'Payment Received - Thank You!',
      html: `
        <h1>Payment Confirmed! ✓</h1>
        <p>We've received your payment of ${payment.amount}.</p>
        <p>Thank you for your business!</p>
      `,
      from_name: 'Billing',
    }),
  });
}

app.listen(3000);
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Wave](https://waveapps.com)
- [Wave API](https://developer.waveapps.com)

