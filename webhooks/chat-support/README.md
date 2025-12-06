# Chat & Support Platform Webhooks

Send follow-up emails after chat conversations.

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
      from_name: 'Support Team',
    }),
  });
}

// Olark Webhook
app.post('/webhook/olark', async (req, res) => {
  const { kind, visitor, operators, messages } = req.body;
  
  if (kind === 'chat.ended' && visitor?.emailAddress) {
    const transcript = messages.map(m => 
      `<p><strong>${m.nickname}:</strong> ${m.body}</p>`
    ).join('');
    
    await sendEmail(
      visitor.emailAddress,
      visitor.fullName || '',
      'Your Chat Transcript',
      `
        <h1>Chat Summary</h1>
        <p>Thanks for chatting with us!</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
          ${transcript}
        </div>
        <p>Feel free to reply to this email if you have more questions.</p>
      `
    );
  }
  
  res.sendStatus(200);
});

// Tawk.to Webhook
app.post('/webhook/tawkto', async (req, res) => {
  const { event, visitor, chat } = req.body;
  
  if (event === 'chat:end' && visitor?.email) {
    const transcript = chat.messages.map(m => 
      `<p><strong>${m.sender?.name || 'Agent'}:</strong> ${m.text}</p>`
    ).join('');
    
    await sendEmail(
      visitor.email,
      visitor.name || '',
      'Chat Transcript - Thank You!',
      `
        <h1>Thanks for Chatting!</h1>
        <p>Here's a summary of our conversation:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
          ${transcript}
        </div>
      `
    );
  }
  
  res.sendStatus(200);
});

// Hotjar Feedback
app.post('/webhook/hotjar', async (req, res) => {
  const { feedback } = req.body;
  
  if (feedback?.email) {
    await sendEmail(
      feedback.email,
      '',
      'Thanks for Your Feedback!',
      `
        <h1>Thank You!</h1>
        <p>We received your feedback and appreciate you taking the time.</p>
        <p>Your input helps us improve!</p>
      `
    );
  }
  
  res.sendStatus(200);
});

// Survicate
app.post('/webhook/survicate', async (req, res) => {
  const { respondent, survey, answers } = req.body;
  
  if (respondent?.email) {
    // Thank for NPS/CSAT response
    await sendEmail(
      respondent.email,
      respondent.name || '',
      'Thanks for Your Feedback!',
      `
        <h1>Feedback Received!</h1>
        <p>Thanks for completing our survey.</p>
        <p>Your feedback helps us improve our service.</p>
      `
    );
  }
  
  res.sendStatus(200);
});

// Delighted NPS
app.post('/webhook/delighted', async (req, res) => {
  const { person, score, comment } = req.body;
  
  if (person?.email) {
    let thankYouMessage = 'Thanks for your feedback!';
    
    if (score >= 9) {
      thankYouMessage = 'We\'re thrilled you love us! Thanks for the great rating!';
    } else if (score >= 7) {
      thankYouMessage = 'Thanks for the feedback! We\'re always working to improve.';
    } else {
      thankYouMessage = 'We\'re sorry to hear about your experience. We\'ll work to do better.';
    }
    
    await sendEmail(
      person.email,
      person.name || '',
      'Thanks for Your Feedback',
      `
        <h1>Thank You!</h1>
        <p>${thankYouMessage}</p>
        ${comment ? `<p>We noted your comment and will review it.</p>` : ''}
      `
    );
  }
  
  res.sendStatus(200);
});

// Canny Feature Requests
app.post('/webhook/canny', async (req, res) => {
  const { type, object } = req.body;
  
  if (type === 'post.status_changed' && object.status === 'complete') {
    // Notify all voters
    for (const voter of object.voters || []) {
      await sendEmail(
        voter.email,
        voter.name,
        `Feature Shipped: ${object.title} 🚀`,
        `
          <h1>Your Request is Live!</h1>
          <p>The feature you voted for is now available:</p>
          <h2>${object.title}</h2>
          <p>${object.details || ''}</p>
          <p><a href="${object.url}">Learn More →</a></p>
        `
      );
    }
  }
  
  res.sendStatus(200);
});

app.listen(3000);
```

## Supported Platforms

| Platform | Events |
|----------|--------|
| Olark | Chat ended |
| Tawk.to | Chat ended |
| Hotjar | Feedback submitted |
| Survicate | Survey completed |
| Delighted | NPS response |
| Canny | Feature status changed |

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Olark](https://olark.com)
- [Tawk.to](https://tawk.to)
- [Hotjar](https://hotjar.com)

