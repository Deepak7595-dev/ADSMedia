# ADSMedia + Canvas LMS Integration

Send educational notifications from Canvas LMS.

## Setup

### Canvas Webhook Handler

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
      from_name: 'Course Notifications',
    }),
  });
}

app.post('/webhook/canvas', async (req, res) => {
  const event = req.body;
  
  switch (event.type) {
    case 'submission_created':
      // Notify instructor
      await sendEmail(
        event.body.instructor.email,
        event.body.instructor.name,
        `New Submission: ${event.body.assignment.name}`,
        `
          <h1>New Submission</h1>
          <p><strong>${event.body.student.name}</strong> submitted:</p>
          <p>${event.body.assignment.name}</p>
          <p><a href="${event.body.submission.url}">View Submission →</a></p>
        `
      );
      break;
      
    case 'grade_changed':
      // Notify student
      await sendEmail(
        event.body.student.email,
        event.body.student.name,
        `Grade Posted: ${event.body.assignment.name}`,
        `
          <h1>Grade Posted! 📊</h1>
          <p>Your grade for <strong>${event.body.assignment.name}</strong>:</p>
          <p style="font-size: 48px; text-align: center; color: #4F46E5;">${event.body.grade.score}/${event.body.grade.max}</p>
          <p><a href="${event.body.gradebook_url}">View Details →</a></p>
        `
      );
      break;
      
    case 'announcement_created':
      // Notify all enrolled students
      for (const student of event.body.enrolled_students) {
        await sendEmail(
          student.email,
          student.name,
          `New Announcement: ${event.body.course.name}`,
          `
            <h1>📢 Announcement</h1>
            <h2>${event.body.announcement.title}</h2>
            <p>${event.body.announcement.message}</p>
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
- [Canvas LMS](https://www.instructure.com/canvas)
- [Canvas API](https://canvas.instructure.com/doc/api/)

