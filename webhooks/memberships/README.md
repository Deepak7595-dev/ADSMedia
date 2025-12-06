# ADSMedia Membership Platform Webhooks

Handle membership events from various platforms and send transactional emails via ADSMedia.

## Supported Platforms

- Memberful
- Memberstack
- Circle
- Mighty Networks
- Teachable
- Thinkific
- Kajabi
- Podia
- Skool

## Universal Webhook Handler

```javascript
// membership-webhook-handler.js
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const ADSMEDIA_API_KEY = process.env.ADSMEDIA_API_KEY;

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
      from_name: 'Membership',
    }),
  });
  return response.json();
}

// --- MEMBERFUL ---
app.post('/webhook/memberful', async (req, res) => {
  const { event, member, subscription } = req.body;
  
  switch (event) {
    case 'member_signup':
      await sendEmail(
        member.email,
        member.full_name,
        'Welcome to Our Community!',
        `
          <h1>Welcome, ${member.full_name}!</h1>
          <p>Your membership is now active.</p>
          <p><a href="https://your-site.com/members">Access Member Area</a></p>
        `
      );
      break;
      
    case 'subscription_activated':
      await sendEmail(
        member.email,
        member.full_name,
        'Subscription Activated!',
        `
          <h1>Your subscription is now active!</h1>
          <p>Plan: ${subscription.plan?.name}</p>
          <p>Thanks for subscribing!</p>
        `
      );
      break;
      
    case 'subscription_deactivated':
      await sendEmail(
        member.email,
        member.full_name,
        'Your subscription has ended',
        `
          <h1>We're sorry to see you go</h1>
          <p>Your subscription has been deactivated.</p>
          <p><a href="https://your-site.com/subscribe">Resubscribe</a></p>
        `
      );
      break;
      
    case 'order_completed':
      await sendEmail(
        member.email,
        member.full_name,
        'Order Confirmed!',
        `
          <h1>Thank you for your purchase!</h1>
          <p>Your order has been confirmed.</p>
        `
      );
      break;
  }
  
  res.sendStatus(200);
});

// --- MEMBERSTACK ---
app.post('/webhook/memberstack', async (req, res) => {
  const { event, payload } = req.body;
  
  switch (event) {
    case 'member.created':
      await sendEmail(
        payload.email,
        payload.customFields?.name || 'Member',
        'Welcome!',
        `
          <h1>Welcome to our community!</h1>
          <p>Your account has been created successfully.</p>
        `
      );
      break;
      
    case 'plan.purchased':
      await sendEmail(
        payload.member.email,
        payload.member.customFields?.name,
        'Plan Activated!',
        `
          <h1>Your plan is now active!</h1>
          <p>Plan: ${payload.plan.name}</p>
          <p>Enjoy your membership benefits!</p>
        `
      );
      break;
      
    case 'plan.canceled':
      await sendEmail(
        payload.member.email,
        payload.member.customFields?.name,
        'Plan Cancelled',
        `
          <h1>Your plan has been cancelled</h1>
          <p>We're sorry to see you go.</p>
        `
      );
      break;
  }
  
  res.sendStatus(200);
});

// --- CIRCLE ---
app.post('/webhook/circle', async (req, res) => {
  const { event_type, data } = req.body;
  
  switch (event_type) {
    case 'member.joined':
      await sendEmail(
        data.member.email,
        data.member.name,
        'Welcome to the Community!',
        `
          <h1>Welcome, ${data.member.name}!</h1>
          <p>You've joined our community.</p>
          <p><a href="${data.community.url}">Visit Community</a></p>
        `
      );
      break;
      
    case 'member.left':
      await sendEmail(
        data.member.email,
        data.member.name,
        "We'll miss you!",
        `
          <h1>Goodbye, ${data.member.name}</h1>
          <p>You're always welcome back!</p>
        `
      );
      break;
  }
  
  res.sendStatus(200);
});

// --- TEACHABLE ---
app.post('/webhook/teachable', async (req, res) => {
  const { event, object } = req.body;
  
  switch (event) {
    case 'student.created':
      await sendEmail(
        object.email,
        object.name,
        'Welcome to Our School!',
        `
          <h1>Welcome!</h1>
          <p>Your student account has been created.</p>
        `
      );
      break;
      
    case 'enrollment.created':
      await sendEmail(
        object.user.email,
        object.user.name,
        `Enrolled: ${object.course.name}`,
        `
          <h1>You're enrolled!</h1>
          <p>You now have access to: ${object.course.name}</p>
          <p><a href="${object.course.url}">Start Learning</a></p>
        `
      );
      break;
      
    case 'enrollment.completed':
      await sendEmail(
        object.user.email,
        object.user.name,
        `🎉 Congratulations! You completed ${object.course.name}`,
        `
          <h1>Congratulations!</h1>
          <p>You've completed ${object.course.name}!</p>
          <p>Certificate: <a href="${object.certificate_url}">Download</a></p>
        `
      );
      break;
  }
  
  res.sendStatus(200);
});

// --- THINKIFIC ---
app.post('/webhook/thinkific', async (req, res) => {
  const { event, payload } = req.body;
  
  switch (event) {
    case 'user.created':
      await sendEmail(
        payload.email,
        `${payload.first_name} ${payload.last_name}`,
        'Welcome to Our Learning Platform!',
        `
          <h1>Welcome, ${payload.first_name}!</h1>
          <p>Your account is ready.</p>
        `
      );
      break;
      
    case 'enrollment.created':
      await sendEmail(
        payload.user.email,
        payload.user.first_name,
        `You're enrolled in ${payload.course.name}`,
        `
          <h1>Enrollment Confirmed!</h1>
          <p>Course: ${payload.course.name}</p>
          <p><a href="${payload.course.landing_page_url}">Start Now</a></p>
        `
      );
      break;
      
    case 'order.completed':
      await sendEmail(
        payload.user.email,
        payload.user.first_name,
        'Order Confirmed!',
        `
          <h1>Thank you for your purchase!</h1>
          <p>Order #${payload.order_number}</p>
          <p>Total: ${payload.total}</p>
        `
      );
      break;
  }
  
  res.sendStatus(200);
});

// --- KAJABI ---
app.post('/webhook/kajabi', async (req, res) => {
  const { event_type, contact, offer, ...data } = req.body;
  
  switch (event_type) {
    case 'contact.created':
      await sendEmail(
        contact.email,
        contact.name,
        'Welcome!',
        `
          <h1>Welcome!</h1>
          <p>Thanks for joining us.</p>
        `
      );
      break;
      
    case 'offer.purchased':
      await sendEmail(
        contact.email,
        contact.name,
        `You purchased: ${offer.title}`,
        `
          <h1>Purchase Confirmed!</h1>
          <p>You now have access to: ${offer.title}</p>
        `
      );
      break;
      
    case 'offer.granted':
      await sendEmail(
        contact.email,
        contact.name,
        `Access Granted: ${offer.title}`,
        `
          <h1>You have access!</h1>
          <p>${offer.title} is now available in your account.</p>
        `
      );
      break;
  }
  
  res.sendStatus(200);
});

// --- PODIA ---
app.post('/webhook/podia', async (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'sale.completed':
      await sendEmail(
        data.email,
        data.name,
        `Purchase Confirmed: ${data.product_name}`,
        `
          <h1>Thank you for your purchase!</h1>
          <p>Product: ${data.product_name}</p>
          <p>Amount: ${data.sale_price}</p>
        `
      );
      break;
      
    case 'subscription.created':
      await sendEmail(
        data.email,
        data.name,
        'Subscription Started!',
        `
          <h1>Your subscription is active!</h1>
          <p>Plan: ${data.product_name}</p>
        `
      );
      break;
      
    case 'subscription.canceled':
      await sendEmail(
        data.email,
        data.name,
        'Subscription Cancelled',
        `
          <h1>Your subscription has been cancelled</h1>
          <p>We hope to see you again!</p>
        `
      );
      break;
  }
  
  res.sendStatus(200);
});

// --- SKOOL ---
app.post('/webhook/skool', async (req, res) => {
  const { event, member, community } = req.body;
  
  switch (event) {
    case 'member.joined':
      await sendEmail(
        member.email,
        member.name,
        `Welcome to ${community.name}!`,
        `
          <h1>Welcome to ${community.name}!</h1>
          <p>Hi ${member.name},</p>
          <p>You're now a member of our community.</p>
          <p><a href="${community.url}">Enter Community</a></p>
        `
      );
      break;
      
    case 'member.upgraded':
      await sendEmail(
        member.email,
        member.name,
        'Membership Upgraded!',
        `
          <h1>Your membership has been upgraded!</h1>
          <p>You now have access to premium features.</p>
        `
      );
      break;
  }
  
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Membership webhook handler running on port ${PORT}`));
```

## Email Templates

### Welcome Email

```html
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
    <h1 style="color: white; margin: 0;">Welcome to the Community! 🎉</h1>
  </div>
  <div style="padding: 30px;">
    <p>Hi {{name}},</p>
    <p>We're thrilled to have you join our community!</p>
    <p>Here's what you can do:</p>
    <ul>
      <li>Access exclusive content</li>
      <li>Connect with other members</li>
      <li>Participate in discussions</li>
    </ul>
    <p style="text-align: center;">
      <a href="{{login_url}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">Access Your Account</a>
    </p>
  </div>
</body>
</html>
```

### Course Completion

```html
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="text-align: center; padding: 40px;">
    <h1>🏆 Congratulations!</h1>
    <p style="font-size: 24px;">You completed <strong>{{course_name}}</strong></p>
    <div style="background: #f5f5f5; padding: 30px; border-radius: 10px; margin: 20px 0;">
      <p>Certificate ID: {{certificate_id}}</p>
      <a href="{{certificate_url}}" style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Download Certificate</a>
    </div>
    <p>Share your achievement!</p>
    <p>
      <a href="{{twitter_share}}">Twitter</a> |
      <a href="{{linkedin_share}}">LinkedIn</a>
    </p>
  </div>
</body>
</html>
```

## Platform Setup

### Memberful

1. Go to **Settings** → **Webhooks**
2. Add endpoint URL
3. Select events

### Memberstack

1. Go to **Settings** → **Webhooks**
2. Add webhook URL
3. Configure events

### Teachable/Thinkific

1. Go to **Settings** → **Webhooks** or **Integrations**
2. Add your webhook URL

### Kajabi

1. Go to **Settings** → **Integrations** → **Webhooks**
2. Create new webhook

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

