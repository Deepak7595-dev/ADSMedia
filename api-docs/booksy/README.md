# ADSMedia + Booksy Integration

Send booking notifications from Booksy.

## Setup

### Booksy Webhook Handler

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
      from_name: 'Booking Notifications',
    }),
  });
}

app.post('/webhook/booksy', async (req, res) => {
  const { event, data } = req.body;
  const booking = data.booking;
  const client = data.client;
  
  switch (event) {
    case 'booking.created':
      await sendEmail(
        client.email,
        client.name,
        'Booking Confirmed! ✅',
        `
          <h1>Booking Confirmed!</h1>
          <p>Hi ${client.name},</p>
          <p>Your appointment has been scheduled:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Service:</strong> ${booking.service_name}</p>
            <p><strong>Date:</strong> ${booking.date}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
            <p><strong>Duration:</strong> ${booking.duration} minutes</p>
            <p><strong>Location:</strong> ${booking.location}</p>
          </div>
          <p>See you soon!</p>
        `
      );
      break;
      
    case 'booking.reminder':
      await sendEmail(
        client.email,
        client.name,
        'Appointment Reminder ⏰',
        `
          <h1>Reminder: Appointment Tomorrow</h1>
          <p>Hi ${client.name},</p>
          <p>Just a reminder about your upcoming appointment:</p>
          <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>${booking.service_name}</strong></p>
            <p>${booking.date} at ${booking.time}</p>
          </div>
        `
      );
      break;
      
    case 'booking.cancelled':
      await sendEmail(
        client.email,
        client.name,
        'Booking Cancelled',
        `
          <h1>Booking Cancelled</h1>
          <p>Hi ${client.name},</p>
          <p>Your appointment for <strong>${booking.service_name}</strong> on ${booking.date} has been cancelled.</p>
          <p>We hope to see you soon!</p>
        `
      );
      break;
      
    case 'booking.rescheduled':
      await sendEmail(
        client.email,
        client.name,
        'Booking Rescheduled',
        `
          <h1>Appointment Rescheduled</h1>
          <p>Hi ${client.name},</p>
          <p>Your appointment has been rescheduled to:</p>
          <div style="background: #D1FAE5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>New Date:</strong> ${booking.new_date}</p>
            <p><strong>New Time:</strong> ${booking.new_time}</p>
          </div>
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
- [Booksy](https://booksy.com)

