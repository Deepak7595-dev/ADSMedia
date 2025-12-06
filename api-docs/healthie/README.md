# ADSMedia + Healthie Integration

Send healthcare notifications from Healthie.

## Setup

### Healthie Webhook Handler

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
      from_name: 'Health Practice',
    }),
  });
}

app.post('/webhook/healthie', async (req, res) => {
  const { event, data } = req.body;
  const client = data.client;
  
  switch (event) {
    case 'appointment.booked':
      await sendEmail(
        client.email,
        client.name,
        'Appointment Confirmed ✅',
        `
          <h1>Appointment Scheduled</h1>
          <p>Hi ${client.name},</p>
          <p>Your appointment has been confirmed:</p>
          <div style="background: #D1FAE5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Provider:</strong> ${data.provider.name}</p>
            <p><strong>Date:</strong> ${data.appointment.date}</p>
            <p><strong>Time:</strong> ${data.appointment.time}</p>
            <p><strong>Type:</strong> ${data.appointment.type}</p>
          </div>
        `
      );
      break;
      
    case 'appointment.reminder':
      await sendEmail(
        client.email,
        client.name,
        'Appointment Reminder ⏰',
        `
          <h1>Upcoming Appointment</h1>
          <p>Hi ${client.name},</p>
          <p>This is a reminder of your upcoming appointment:</p>
          <p><strong>${data.appointment.date}</strong> at <strong>${data.appointment.time}</strong></p>
          <p>with ${data.provider.name}</p>
        `
      );
      break;
      
    case 'document.shared':
      await sendEmail(
        client.email,
        client.name,
        'New Document Available',
        `
          <h1>Document Shared</h1>
          <p>Hi ${client.name},</p>
          <p>A new document has been shared with you:</p>
          <p><strong>${data.document.name}</strong></p>
          <p><a href="${data.document.url}">View Document →</a></p>
        `
      );
      break;
      
    case 'form.assigned':
      await sendEmail(
        client.email,
        client.name,
        'Please Complete: ${data.form.name}',
        `
          <h1>Form Required</h1>
          <p>Hi ${client.name},</p>
          <p>Please complete the following form:</p>
          <p><strong>${data.form.name}</strong></p>
          <p><a href="${data.form.url}" style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px;">Complete Form →</a></p>
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
- [Healthie](https://gethealthie.com)

