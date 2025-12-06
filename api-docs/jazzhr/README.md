# ADSMedia + JazzHR Integration

Send candidate emails from JazzHR ATS.

## Setup

### JazzHR Webhook Handler

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
      from_name: 'Hiring Team',
    }),
  });
}

app.post('/webhook/jazzhr', async (req, res) => {
  const { event, data } = req.body;
  const candidate = data.candidate;
  
  switch (event) {
    case 'candidate.created':
      await sendEmail(
        candidate.email,
        `${candidate.first_name} ${candidate.last_name}`,
        'Application Received!',
        `
          <h1>Thanks for Applying!</h1>
          <p>Hi ${candidate.first_name},</p>
          <p>We've received your application for <strong>${data.job.title}</strong>.</p>
          <p>Our team will review your application and get back to you soon.</p>
        `
      );
      break;
      
    case 'candidate.stage_changed':
      if (data.new_stage === 'Interview') {
        await sendEmail(
          candidate.email,
          candidate.first_name,
          'Interview Invitation!',
          `
            <h1>Great News! 🎉</h1>
            <p>We'd love to interview you for the ${data.job.title} position.</p>
            <p>Please schedule your interview using the link below.</p>
          `
        );
      }
      break;
      
    case 'candidate.hired':
      await sendEmail(
        candidate.email,
        candidate.first_name,
        'Welcome to the Team! 🎉',
        `
          <h1>Congratulations!</h1>
          <p>We're thrilled to welcome you to our team.</p>
          <p>You'll receive onboarding information shortly.</p>
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
- [JazzHR](https://jazzhr.com)

