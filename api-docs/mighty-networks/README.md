# ADSMedia + Mighty Networks Integration

Send emails to community members.

## Setup

### Mighty Networks Webhook Handler

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
      from_name: 'Community',
    }),
  });
}

app.post('/webhook/mighty', async (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'member.joined':
      await sendEmail(
        data.member.email,
        data.member.name,
        'Welcome to the Community! 🎉',
        `
          <h1>Welcome, ${data.member.name}!</h1>
          <p>We're so excited to have you join our community.</p>
          <h2>Getting Started</h2>
          <ul>
            <li>Introduce yourself to the community</li>
            <li>Explore our courses and content</li>
            <li>Connect with other members</li>
          </ul>
          <p><a href="${data.community.url}" style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px;">Enter Community →</a></p>
        `
      );
      break;
      
    case 'member.upgraded':
      await sendEmail(
        data.member.email,
        data.member.name,
        'Welcome to Premium! ⭐',
        `
          <h1>You're Premium Now!</h1>
          <p>Thank you for upgrading, ${data.member.name}!</p>
          <p>You now have access to:</p>
          <ul>
            <li>All premium courses</li>
            <li>Exclusive live events</li>
            <li>Direct access to hosts</li>
          </ul>
        `
      );
      break;
      
    case 'course.completed':
      await sendEmail(
        data.member.email,
        data.member.name,
        `Course Completed: ${data.course.name} 🎓`,
        `
          <h1>Congratulations!</h1>
          <p>You've completed <strong>${data.course.name}</strong>!</p>
          <p>Keep up the amazing work!</p>
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
- [Mighty Networks](https://mightynetworks.com)

