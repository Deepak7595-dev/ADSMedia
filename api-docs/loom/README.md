# ADSMedia + Loom Integration

Send notifications about Loom video recordings.

## Setup

### Loom Webhook Handler

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
      from_name: 'Loom Notifications',
    }),
  });
}

app.post('/webhook/loom', async (req, res) => {
  const { event, video } = req.body;
  
  if (event === 'video.transcoded') {
    // Notify team about new video
    const teamEmails = await getTeamEmails(); // Your function
    
    for (const member of teamEmails) {
      await sendEmail(
        member.email,
        member.name,
        `New Loom: ${video.title}`,
        `
          <h1>New Video Available</h1>
          <p><strong>${video.owner.name}</strong> recorded a new video:</p>
          <h2>${video.title}</h2>
          <p>Duration: ${Math.round(video.duration / 60)} minutes</p>
          <p>
            <a href="${video.share_url}" style="background: #625df5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px;">
              Watch Video →
            </a>
          </p>
        `
      );
    }
  }
  
  if (event === 'video.comment_created') {
    // Notify video owner
    await sendEmail(
      video.owner.email,
      video.owner.name,
      `New Comment on "${video.title}"`,
      `
        <h1>New Comment</h1>
        <p>Someone commented on your video:</p>
        <blockquote>${req.body.comment.body}</blockquote>
        <p><a href="${video.share_url}">View Video →</a></p>
      `
    );
  }
  
  res.sendStatus(200);
});

app.listen(3000);
```

### Share Video via Email

```javascript
async function shareVideoViaEmail(videoId, recipients, message) {
  const LOOM_API_KEY = process.env.LOOM_API_KEY;
  
  // Get video details from Loom API
  const response = await fetch(`https://www.loom.com/v1/videos/${videoId}`, {
    headers: {
      'Authorization': `Bearer ${LOOM_API_KEY}`,
    },
  });
  const video = await response.json();
  
  for (const recipient of recipients) {
    await fetch('https://api.adsmedia.live/v1/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADSMEDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: recipient.email,
        to_name: recipient.name,
        subject: `Video for You: ${video.title}`,
        html: `
          <h1>${video.title}</h1>
          ${message ? `<p>${message}</p>` : ''}
          <p>
            <a href="${video.share_url}">
              <img src="${video.thumbnail_url}" alt="${video.title}" style="max-width: 100%; border-radius: 8px;">
            </a>
          </p>
          <p>
            <a href="${video.share_url}" style="background: #625df5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px;">
              Watch Video
            </a>
          </p>
        `,
        from_name: 'Video Share',
      }),
    });
  }
}
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Loom](https://loom.com)
- [Loom API](https://dev.loom.com)

