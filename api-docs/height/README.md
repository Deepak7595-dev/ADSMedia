# ADSMedia + Height Integration

Send task notifications from Height project management.

## Setup

### Height Webhook Handler

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
      from_name: 'Height Notifications',
    }),
  });
}

app.post('/webhook/height', async (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'task.created':
      for (const assignee of data.task.assignees || []) {
        await sendEmail(
          assignee.email,
          assignee.name,
          `New Task: ${data.task.name}`,
          `
            <h1>New Task Assigned</h1>
            <p><strong>${data.task.name}</strong></p>
            <p>${data.task.description || 'No description'}</p>
            <p><a href="${data.task.url}">View Task →</a></p>
          `
        );
      }
      break;
      
    case 'task.status_changed':
      if (data.newStatus === 'Done') {
        // Notify creator
        if (data.task.creator?.email) {
          await sendEmail(
            data.task.creator.email,
            data.task.creator.name,
            `Task Completed: ${data.task.name}`,
            `
              <h1>Task Done! ✅</h1>
              <p><strong>${data.task.name}</strong> has been completed.</p>
            `
          );
        }
      }
      break;
      
    case 'comment.created':
      // Notify task participants
      const participants = new Set([
        data.task.creator,
        ...(data.task.assignees || []),
      ].filter(p => p?.email && p.id !== data.comment.author.id));
      
      for (const user of participants) {
        await sendEmail(
          user.email,
          user.name,
          `New Comment on ${data.task.name}`,
          `
            <h1>New Comment</h1>
            <p><strong>${data.comment.author.name}</strong>:</p>
            <blockquote>${data.comment.message}</blockquote>
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
- [Height](https://height.app)

