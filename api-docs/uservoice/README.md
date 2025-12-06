# ADSMedia + UserVoice Integration

Send feedback notifications from UserVoice.

## Setup

### UserVoice Webhook Handler

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
      from_name: 'Product Team',
    }),
  });
}

app.post('/webhook/uservoice', async (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'suggestion.status_update':
      if (data.status === 'completed') {
        // Notify all supporters
        for (const supporter of data.supporters || []) {
          await sendEmail(
            supporter.email,
            supporter.name,
            `Your Idea is Live: ${data.title}`,
            `
              <h1>Great News! 🎉</h1>
              <p>The feature you requested has been shipped:</p>
              <h2>${data.title}</h2>
              <p>${data.response || 'It\'s now available in the product!'}</p>
              <p><a href="${data.url}">Learn More →</a></p>
            `
          );
        }
      }
      break;
      
    case 'suggestion.created':
      // Confirm receipt to submitter
      await sendEmail(
        data.creator.email,
        data.creator.name,
        'Thanks for Your Feedback!',
        `
          <h1>Idea Received!</h1>
          <p>Thanks for submitting your idea:</p>
          <h2>${data.title}</h2>
          <p>We review all feedback and will update you on progress.</p>
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
- [UserVoice](https://uservoice.com)

