# ADSMedia + Taskade Integration

Send notifications from Taskade workspaces.

## Setup

### Taskade Webhook Handler

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
      from_name: 'Taskade Notifications',
    }),
  });
}

app.post('/webhook/taskade', async (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'task.completed':
      // Notify assignee or watchers
      for (const user of data.task.assignees || []) {
        if (user.email) {
          await sendEmail(
            user.email,
            user.name,
            `Task Completed: ${data.task.title}`,
            `
              <h1>Task Completed! ✅</h1>
              <p><strong>${data.task.title}</strong> has been marked as complete.</p>
              <p>Project: ${data.project.name}</p>
            `
          );
        }
      }
      break;
      
    case 'comment.added':
      // Notify task assignees about new comment
      for (const user of data.task.assignees || []) {
        if (user.email && user.id !== data.comment.author.id) {
          await sendEmail(
            user.email,
            user.name,
            `New Comment on ${data.task.title}`,
            `
              <h1>New Comment</h1>
              <p><strong>${data.comment.author.name}</strong> commented:</p>
              <blockquote>${data.comment.content}</blockquote>
              <p><a href="${data.task.url}">View Task →</a></p>
            `
          );
        }
      }
      break;
      
    case 'task.due_soon':
      for (const user of data.task.assignees || []) {
        if (user.email) {
          await sendEmail(
            user.email,
            user.name,
            `Task Due Soon: ${data.task.title}`,
            `
              <h1>Due Date Reminder ⏰</h1>
              <p><strong>${data.task.title}</strong> is due ${data.task.dueDate}.</p>
              <p><a href="${data.task.url}">View Task →</a></p>
            `
          );
        }
      }
      break;
  }
  
  res.sendStatus(200);
});

app.listen(3000);
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Taskade](https://taskade.com)

