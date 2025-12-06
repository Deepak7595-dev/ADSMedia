# ADSMedia + Factorial Integration

Send HR notifications from Factorial.

## Setup

### Factorial Webhook Handler

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
      from_name: 'HR Team',
    }),
  });
}

app.post('/webhook/factorial', async (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'employee.created':
      await sendEmail(
        data.email,
        data.first_name,
        'Welcome to the Company! 🎉',
        `
          <h1>Welcome, ${data.first_name}!</h1>
          <p>We're excited to have you join the team.</p>
          <h2>Your First Day</h2>
          <ul>
            <li>Complete your profile in Factorial</li>
            <li>Review the employee handbook</li>
            <li>Meet your team</li>
          </ul>
        `
      );
      break;
      
    case 'leave.approved':
      await sendEmail(
        data.employee.email,
        data.employee.first_name,
        'Leave Request Approved ✅',
        `
          <h1>Leave Approved!</h1>
          <p>Your leave request has been approved:</p>
          <p><strong>${data.start_date}</strong> to <strong>${data.end_date}</strong></p>
          <p>Type: ${data.leave_type}</p>
          <p>Enjoy your time off!</p>
        `
      );
      break;
      
    case 'leave.rejected':
      await sendEmail(
        data.employee.email,
        data.employee.first_name,
        'Leave Request Update',
        `
          <h1>Leave Request Not Approved</h1>
          <p>Unfortunately, your leave request could not be approved.</p>
          <p>Please contact your manager for more details.</p>
        `
      );
      break;
      
    case 'document.requested':
      await sendEmail(
        data.employee.email,
        data.employee.first_name,
        'Document Required',
        `
          <h1>Document Needed</h1>
          <p>Please upload the following document:</p>
          <p><strong>${data.document_type}</strong></p>
          <p>Due by: ${data.due_date}</p>
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
- [Factorial](https://factorialhr.com)

