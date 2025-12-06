# ADSMedia Sanity.io Integration

Send emails from Sanity Studio using ADSMedia API.

## Overview

This integration allows you to send emails when content is published or updated in Sanity.

## Setup Methods

### Method 1: Sanity Actions + Webhook

Use Sanity webhooks to trigger email sends.

### Method 2: Custom Studio Tool

Add email functionality to Sanity Studio.

## Method 1: Webhooks

### 1. Deploy Webhook Handler

```javascript
// sanity-webhook-handler.js
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const ADSMEDIA_API_KEY = process.env.ADSMEDIA_API_KEY;
const SANITY_WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;

// Verify Sanity webhook signature
function verifySignature(req) {
  const signature = req.headers['sanity-webhook-signature'];
  const payload = JSON.stringify(req.body);
  const expected = crypto
    .createHmac('sha256', SANITY_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  return signature === expected;
}

async function sendEmail(to, toName, subject, html) {
  const response = await fetch('https://api.adsmedia.live/v1/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ADSMEDIA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to,
      to_name: toName,
      subject,
      html,
      from_name: 'Sanity CMS',
    }),
  });
  return response.json();
}

app.post('/webhook/sanity', async (req, res) => {
  // Verify signature in production
  // if (!verifySignature(req)) return res.status(401).send('Invalid signature');
  
  const { _type, _id, ...document } = req.body;
  
  // Handle different document types
  switch (_type) {
    case 'post':
      // Send notification when post is published
      if (document.published) {
        await sendEmail(
          process.env.ADMIN_EMAIL,
          'Admin',
          `New Post Published: ${document.title}`,
          `
            <h1>New Post Published</h1>
            <p><strong>Title:</strong> ${document.title}</p>
            <p><strong>Author:</strong> ${document.author?.name || 'Unknown'}</p>
            <p><strong>Excerpt:</strong> ${document.excerpt || 'No excerpt'}</p>
            <p><a href="https://your-site.com/blog/${document.slug?.current}">View Post</a></p>
          `
        );
      }
      break;
      
    case 'subscriber':
      // Send welcome email to new subscriber
      if (document.email) {
        await sendEmail(
          document.email,
          document.name,
          'Welcome to Our Newsletter!',
          `
            <h1>Welcome!</h1>
            <p>Hi ${document.name},</p>
            <p>Thank you for subscribing to our newsletter.</p>
            <p>You'll receive updates on our latest content.</p>
          `
        );
      }
      break;
      
    case 'order':
      // Send order confirmation
      if (document.customerEmail) {
        await sendEmail(
          document.customerEmail,
          document.customerName,
          `Order Confirmed: #${document.orderNumber}`,
          `
            <h1>Order Confirmed!</h1>
            <p>Order #${document.orderNumber}</p>
            <p>Total: $${document.total}</p>
          `
        );
      }
      break;
  }
  
  res.sendStatus(200);
});

app.listen(3000);
```

### 2. Configure Sanity Webhook

In `sanity.json` or via Sanity management:

```json
{
  "webhooks": [
    {
      "name": "ADSMedia Email Notifications",
      "url": "https://your-domain.com/webhook/sanity",
      "on": ["create", "update"],
      "filter": "_type in ['post', 'subscriber', 'order']"
    }
  ]
}
```

Or via Sanity dashboard:

1. Go to **API** → **Webhooks**
2. Click **Create webhook**
3. Configure trigger and URL

## Method 2: Studio Tool

### Create Studio Plugin

```javascript
// plugins/adsmedia-email/index.js
import { definePlugin } from 'sanity';
import { EnvelopeIcon } from '@sanity/icons';
import EmailTool from './EmailTool';

export const adsmediaEmail = definePlugin({
  name: 'adsmedia-email',
  tools: [
    {
      name: 'email',
      title: 'Email',
      icon: EnvelopeIcon,
      component: EmailTool,
    },
  ],
});
```

### Email Tool Component

```jsx
// plugins/adsmedia-email/EmailTool.jsx
import React, { useState } from 'react';
import { Card, Stack, TextInput, TextArea, Button, useToast } from '@sanity/ui';

const ADSMEDIA_API_KEY = process.env.SANITY_STUDIO_ADSMEDIA_API_KEY;

export default function EmailTool() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const toast = useToast();

  const sendEmail = async () => {
    if (!to || !subject || !content) {
      toast.push({ status: 'warning', title: 'Please fill all fields' });
      return;
    }

    setSending(true);

    try {
      const response = await fetch('https://api.adsmedia.live/v1/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ADSMEDIA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          html: `<div>${content.replace(/\n/g, '<br>')}</div>`,
          from_name: 'Sanity Studio',
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.push({ status: 'success', title: 'Email sent successfully!' });
        setTo('');
        setSubject('');
        setContent('');
      } else {
        throw new Error(result.error?.message || 'Failed to send');
      }
    } catch (error) {
      toast.push({ status: 'error', title: `Error: ${error.message}` });
    }

    setSending(false);
  };

  return (
    <Card padding={4}>
      <Stack space={4}>
        <h1>Send Email via ADSMedia</h1>
        
        <TextInput
          placeholder="Recipient email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        
        <TextInput
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        
        <TextArea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
        />
        
        <Button
          text={sending ? 'Sending...' : 'Send Email'}
          tone="primary"
          onClick={sendEmail}
          disabled={sending}
        />
      </Stack>
    </Card>
  );
}
```

### Register Plugin

```javascript
// sanity.config.js
import { defineConfig } from 'sanity';
import { adsmediaEmail } from './plugins/adsmedia-email';

export default defineConfig({
  // ...other config
  plugins: [
    adsmediaEmail(),
  ],
});
```

## Document Action

Send email from document edit screen:

```javascript
// documentActions/sendEmail.js
import { useState } from 'react';
import { useDocumentOperation } from '@sanity/react-hooks';

export function sendEmailAction(props) {
  const { draft, published } = props;
  const doc = draft || published;

  return {
    label: 'Send Email',
    onHandle: async () => {
      // Open modal or send directly
      const response = await fetch('https://api.adsmedia.live/v1/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SANITY_STUDIO_ADSMEDIA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: doc.subscriberEmail,
          subject: `Update: ${doc.title}`,
          html: `<h1>${doc.title}</h1><p>${doc.excerpt}</p>`,
        }),
      });
      
      const result = await response.json();
      alert(result.success ? 'Email sent!' : 'Failed to send');
    },
  };
}
```

## GROQ + Batch Send

Send to all subscribers:

```javascript
async function sendToAllSubscribers(subject, html) {
  const client = createClient({ projectId, dataset, token });
  
  // Query all active subscribers
  const subscribers = await client.fetch(`
    *[_type == "subscriber" && active == true] {
      email,
      name
    }
  `);
  
  // Send batch email
  const response = await fetch('https://api.adsmedia.live/v1/send/batch', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ADSMEDIA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipients: subscribers.map(s => ({ email: s.email, name: s.name })),
      subject,
      html,
    }),
  });
  
  return response.json();
}
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Sanity](https://www.sanity.io)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

