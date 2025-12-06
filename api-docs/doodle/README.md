# ADSMedia + Doodle Integration

Send meeting notifications from Doodle.

## Setup

### Doodle Webhook Handler

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
      from_name: 'Meeting Scheduler',
    }),
  });
}

app.post('/webhook/doodle', async (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'poll.created':
      // Notify participants
      for (const participant of data.invitees || []) {
        await sendEmail(
          participant.email,
          participant.name,
          `Please Vote: ${data.title}`,
          `
            <h1>Meeting Poll</h1>
            <p>${data.initiator.name} wants to schedule a meeting:</p>
            <h2>${data.title}</h2>
            <p>${data.description || ''}</p>
            <p><a href="${data.poll_url}" style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px;">Vote Now →</a></p>
          `
        );
      }
      break;
      
    case 'poll.booked':
      // Final time selected
      for (const participant of data.participants || []) {
        await sendEmail(
          participant.email,
          participant.name,
          `Meeting Scheduled: ${data.title}`,
          `
            <h1>Meeting Confirmed! ✅</h1>
            <h2>${data.title}</h2>
            <p><strong>Date:</strong> ${data.final_date}</p>
            <p><strong>Time:</strong> ${data.final_time}</p>
            <p>${data.location ? `<strong>Location:</strong> ${data.location}` : ''}</p>
            <p><a href="${data.calendar_link}">Add to Calendar →</a></p>
          `
        );
      }
      break;
      
    case 'poll.reminder':
      // Remind to vote
      for (const participant of data.pending_participants || []) {
        await sendEmail(
          participant.email,
          participant.name,
          `Reminder: Vote on "${data.title}"`,
          `
            <h1>Don't Forget to Vote! ⏰</h1>
            <p>The poll for <strong>${data.title}</strong> is waiting for your input.</p>
            <p><a href="${data.poll_url}">Vote Now →</a></p>
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
- [Doodle](https://doodle.com)

