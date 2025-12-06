# ADSMedia Softr Integration

Send emails via ADSMedia API from your Softr applications.

## Overview

Softr supports email integration through:
1. **Custom Code Blocks** (JavaScript)
2. **Zapier/Make** automations
3. **Airtable Automations** (for Airtable-connected apps)

## Method 1: Custom Code Block

### Add Custom Code Block

1. Add a **Custom Code** block to your page
2. Select **JavaScript** as the code type
3. Add the following code:

```html
<div id="email-form">
  <input type="email" id="recipient-email" placeholder="Recipient Email" required>
  <input type="text" id="recipient-name" placeholder="Recipient Name">
  <input type="text" id="email-subject" placeholder="Subject" required>
  <textarea id="email-content" placeholder="Message" required></textarea>
  <button onclick="sendEmail()">Send Email</button>
  <div id="status"></div>
</div>

<style>
  #email-form { max-width: 500px; margin: 0 auto; }
  #email-form input, #email-form textarea { 
    width: 100%; padding: 10px; margin: 10px 0; 
    border: 1px solid #ddd; border-radius: 4px;
  }
  #email-form button { 
    background: #007bff; color: white; padding: 12px 24px;
    border: none; border-radius: 4px; cursor: pointer;
  }
  #email-form button:hover { background: #0056b3; }
  #status { margin-top: 10px; padding: 10px; }
  .success { background: #d4edda; color: #155724; }
  .error { background: #f8d7da; color: #721c24; }
</style>

<script>
async function sendEmail() {
  const statusDiv = document.getElementById('status');
  const btn = document.querySelector('#email-form button');
  
  const data = {
    to: document.getElementById('recipient-email').value,
    to_name: document.getElementById('recipient-name').value,
    subject: document.getElementById('email-subject').value,
    html: `<p>${document.getElementById('email-content').value}</p>`,
    from_name: 'My Softr App'
  };
  
  if (!data.to || !data.subject || !data.html) {
    statusDiv.className = 'error';
    statusDiv.textContent = 'Please fill all required fields';
    return;
  }
  
  btn.disabled = true;
  btn.textContent = 'Sending...';
  
  try {
    const response = await fetch('https://api.adsmedia.live/v1/send', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      statusDiv.className = 'success';
      statusDiv.textContent = 'Email sent successfully!';
      // Clear form
      document.getElementById('recipient-email').value = '';
      document.getElementById('recipient-name').value = '';
      document.getElementById('email-subject').value = '';
      document.getElementById('email-content').value = '';
    } else {
      statusDiv.className = 'error';
      statusDiv.textContent = result.error?.message || 'Failed to send email';
    }
  } catch (error) {
    statusDiv.className = 'error';
    statusDiv.textContent = 'Network error. Please try again.';
  }
  
  btn.disabled = false;
  btn.textContent = 'Send Email';
}
</script>
```

### Secure API Key

For production, use a serverless function:

```javascript
// Deploy to Vercel/Netlify and call this instead
const response = await fetch('https://your-function.vercel.app/api/send-email', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

## Method 2: Via Zapier

### Setup Zapier Integration

1. **Trigger**: Webhooks by Zapier → Catch Hook
2. **Action**: Webhooks by Zapier → POST

### Action Configuration

```
URL: https://api.adsmedia.live/v1/send
Payload Type: json
Data:
  to: {{email}}
  to_name: {{name}}
  subject: {{subject}}
  html: {{content}}
  from_name: My Softr App

Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json
```

### Connect from Softr

Use Custom Code to send to webhook:

```javascript
fetch('https://hooks.zapier.com/hooks/catch/YOUR_HOOK_ID', {
  method: 'POST',
  body: JSON.stringify({
    email: recipientEmail,
    name: recipientName,
    subject: emailSubject,
    content: emailContent
  })
});
```

## Method 3: Airtable Automations

For apps connected to Airtable:

### Create Automation

1. Go to Airtable → Automations
2. Trigger: "When record created" or "When record matches conditions"
3. Action: "Run script"

### Script

```javascript
const apiKey = 'YOUR_API_KEY';
const record = input.config();

const response = await fetch('https://api.adsmedia.live/v1/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: record.email,
    to_name: record.name,
    subject: record.subject,
    html: record.html_content,
    from_name: 'My App'
  })
});

const result = await response.json();
output.set('result', result);
```

## Use Cases

### Contact Form Notification

When contact form is submitted:
1. Save to Airtable
2. Send notification email to admin
3. Send confirmation to visitor

### User Welcome Email

When new user signs up:
1. Trigger on Airtable record creation
2. Send personalized welcome email
3. Update user record with "welcomed" flag

### Newsletter Sign-up

```javascript
async function subscribeNewsletter(email, name) {
  // Add to Airtable
  await addToAirtable(email, name);
  
  // Send confirmation
  await fetch('https://api.adsmedia.live/v1/send', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: email,
      to_name: name,
      subject: 'Welcome to Our Newsletter!',
      html: '<h1>Thanks for subscribing!</h1><p>You\'ll receive updates soon.</p>',
      from_name: 'Newsletter Team'
    })
  });
}
```

## Best Practices

1. **API Key Security** - Use serverless functions
2. **Validation** - Validate email format
3. **Rate Limiting** - Don't spam the API
4. **User Feedback** - Show clear status messages
5. **Logging** - Track sent emails

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Softr](https://www.softr.io)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

