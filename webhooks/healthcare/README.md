# Healthcare Platform Webhooks

Send appointment and practice notifications.

## Setup

### Universal Handler

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
      from_name: 'Practice Notifications',
    }),
  });
}

// Jane App Webhook
app.post('/webhook/jane', async (req, res) => {
  const { event, data } = req.body;
  const patient = data.patient;
  
  switch (event) {
    case 'appointment.booked':
      await sendEmail(
        patient.email,
        patient.name,
        'Appointment Confirmed ✅',
        `
          <h1>Appointment Scheduled</h1>
          <p>Hi ${patient.name},</p>
          <div style="background: #D1FAE5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Service:</strong> ${data.appointment.service}</p>
            <p><strong>Date:</strong> ${data.appointment.date}</p>
            <p><strong>Time:</strong> ${data.appointment.time}</p>
            <p><strong>Practitioner:</strong> ${data.practitioner.name}</p>
          </div>
        `
      );
      break;
      
    case 'appointment.reminder':
      await sendEmail(
        patient.email,
        patient.name,
        'Appointment Reminder ⏰',
        `
          <h1>Reminder: Upcoming Appointment</h1>
          <p>Hi ${patient.name},</p>
          <p>Your appointment is scheduled for:</p>
          <p><strong>${data.appointment.date}</strong> at <strong>${data.appointment.time}</strong></p>
        `
      );
      break;
  }
  
  res.sendStatus(200);
});

// SimplePractice Webhook
app.post('/webhook/simplepractice', async (req, res) => {
  const { event_type, data } = req.body;
  const client = data.client;
  
  switch (event_type) {
    case 'appointment.created':
      await sendEmail(
        client.email,
        client.name,
        'Appointment Scheduled',
        `
          <h1>Session Confirmed</h1>
          <p>Hi ${client.name},</p>
          <p>Your appointment has been scheduled:</p>
          <p><strong>${data.appointment.date_time}</strong></p>
        `
      );
      break;
      
    case 'document.shared':
      await sendEmail(
        client.email,
        client.name,
        'Document Available',
        `
          <h1>New Document</h1>
          <p>A document has been shared with you in your client portal.</p>
          <p><a href="${data.portal_url}">View Document →</a></p>
        `
      );
      break;
  }
  
  res.sendStatus(200);
});

// Cliniko Webhook
app.post('/webhook/cliniko', async (req, res) => {
  const { type, patient, appointment } = req.body;
  
  switch (type) {
    case 'appointment.created':
      await sendEmail(
        patient.email,
        `${patient.first_name} ${patient.last_name}`,
        'Appointment Booked',
        `
          <h1>Appointment Confirmed</h1>
          <p>Hi ${patient.first_name},</p>
          <p><strong>Date:</strong> ${appointment.date}</p>
          <p><strong>Time:</strong> ${appointment.time}</p>
          <p><strong>Type:</strong> ${appointment.type_name}</p>
        `
      );
      break;
      
    case 'appointment.cancelled':
      await sendEmail(
        patient.email,
        patient.first_name,
        'Appointment Cancelled',
        `
          <h1>Cancellation Confirmed</h1>
          <p>Your appointment on ${appointment.date} has been cancelled.</p>
        `
      );
      break;
  }
  
  res.sendStatus(200);
});

// Practice Better Webhook
app.post('/webhook/practicebetter', async (req, res) => {
  const { event, data } = req.body;
  const client = data.client;
  
  switch (event) {
    case 'appointment.booked':
      await sendEmail(
        client.email,
        client.first_name,
        'Appointment Confirmed',
        `
          <h1>You're Booked!</h1>
          <p>Hi ${client.first_name},</p>
          <p>Your session is scheduled for <strong>${data.appointment.datetime}</strong>.</p>
        `
      );
      break;
      
    case 'protocol.assigned':
      await sendEmail(
        client.email,
        client.first_name,
        'New Protocol Assigned',
        `
          <h1>New Protocol</h1>
          <p>A new protocol has been assigned to you:</p>
          <p><strong>${data.protocol.name}</strong></p>
          <p><a href="${data.portal_url}">View in Portal →</a></p>
        `
      );
      break;
  }
  
  res.sendStatus(200);
});

app.listen(3000);
```

## Supported Platforms

| Platform | Events |
|----------|--------|
| Jane App | Appointments, Reminders |
| SimplePractice | Appointments, Documents |
| Cliniko | Appointments, Cancellations |
| Practice Better | Appointments, Protocols |

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Jane App](https://jane.app)
- [SimplePractice](https://simplepractice.com)
- [Cliniko](https://cliniko.com)
- [Practice Better](https://practicebetter.io)

