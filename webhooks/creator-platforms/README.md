# Creator Platform Webhooks

Send notifications from creator monetization platforms.

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
      from_name: 'Creator Support',
    }),
  });
}

// Ko-fi Webhook
app.post('/webhook/kofi', async (req, res) => {
  const { type, from_name, email, amount, message } = req.body;
  
  if (type === 'Donation' || type === 'Coffee') {
    await sendEmail(
      email,
      from_name,
      'Thank You for Your Support! ☕',
      `
        <h1>Thank You, ${from_name}! 💖</h1>
        <p>Your support of <strong>$${amount}</strong> means the world!</p>
        ${message ? `<p>Your message: "${message}"</p>` : ''}
        <p>You're helping us create more content!</p>
      `
    );
  }
  
  if (type === 'Subscription') {
    await sendEmail(
      email,
      from_name,
      'Welcome to the Membership! 🎉',
      `
        <h1>Welcome, ${from_name}!</h1>
        <p>You're now a member! Enjoy exclusive perks:</p>
        <ul>
          <li>Exclusive content</li>
          <li>Behind-the-scenes access</li>
          <li>Member-only updates</li>
        </ul>
      `
    );
  }
  
  res.sendStatus(200);
});

// Buy Me a Coffee Webhook
app.post('/webhook/buymeacoffee', async (req, res) => {
  const { supporter_email, supporter_name, total_amount, support_note, type } = req.body;
  
  if (type === 'coffee' || type === 'extra') {
    await sendEmail(
      supporter_email,
      supporter_name,
      'Thanks for the Coffee! ☕',
      `
        <h1>Thank You, ${supporter_name}! ☕</h1>
        <p>Your support of <strong>$${total_amount}</strong> is amazing!</p>
        ${support_note ? `<p>"${support_note}"</p>` : ''}
      `
    );
  }
  
  if (type === 'membership') {
    await sendEmail(
      supporter_email,
      supporter_name,
      'Welcome to Membership! 🎉',
      `
        <h1>You're a Member Now!</h1>
        <p>Thanks for becoming a member, ${supporter_name}!</p>
        <p>Enjoy all the exclusive benefits!</p>
      `
    );
  }
  
  res.sendStatus(200);
});

// Skool Webhook
app.post('/webhook/skool', async (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'member.joined':
      await sendEmail(
        data.member.email,
        data.member.name,
        `Welcome to ${data.community.name}! 🎉`,
        `
          <h1>Welcome, ${data.member.name}!</h1>
          <p>You're now part of <strong>${data.community.name}</strong>!</p>
          <h2>Getting Started</h2>
          <ul>
            <li>Introduce yourself to the community</li>
            <li>Check out the classroom</li>
            <li>Join the conversation</li>
          </ul>
          <p><a href="${data.community.url}">Enter Community →</a></p>
        `
      );
      break;
      
    case 'course.completed':
      await sendEmail(
        data.member.email,
        data.member.name,
        `Course Completed: ${data.course.name} 🎓`,
        `
          <h1>Congratulations! 🎓</h1>
          <p>You've completed <strong>${data.course.name}</strong>!</p>
          <p>Keep up the amazing work!</p>
        `
      );
      break;
  }
  
  res.sendStatus(200);
});

// Rewardful (Affiliate)
app.post('/webhook/rewardful', async (req, res) => {
  const { event, affiliate } = req.body;
  
  switch (event) {
    case 'affiliate.created':
      await sendEmail(
        affiliate.email,
        affiliate.first_name,
        'Welcome to Our Affiliate Program!',
        `
          <h1>You're In! 🎉</h1>
          <p>Welcome to our affiliate program, ${affiliate.first_name}!</p>
          <h2>Your Referral Link</h2>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 4px;">
            <code>${affiliate.link}</code>
          </div>
          <p>Start sharing and earning!</p>
        `
      );
      break;
      
    case 'referral.conversion':
      await sendEmail(
        affiliate.email,
        affiliate.first_name,
        'New Commission! 💰',
        `
          <h1>Cha-ching! 💰</h1>
          <p>You earned a new commission:</p>
          <p style="font-size: 32px; color: #10B981; text-align: center;">+$${req.body.commission.amount}</p>
        `
      );
      break;
  }
  
  res.sendStatus(200);
});

// FirstPromoter (Affiliate)
app.post('/webhook/firstpromoter', async (req, res) => {
  const { event, data } = req.body;
  
  if (event === 'promoter_accepted') {
    await sendEmail(
      data.promoter.email,
      data.promoter.name,
      'Affiliate Application Approved! ✅',
      `
        <h1>You're Approved!</h1>
        <p>Welcome to the affiliate program, ${data.promoter.name}!</p>
        <p>Your referral link: <code>${data.promoter.ref_link}</code></p>
      `
    );
  }
  
  if (event === 'reward_created') {
    await sendEmail(
      data.promoter.email,
      data.promoter.name,
      'New Reward Earned! 💰',
      `<h1>+$${data.reward.amount}</h1><p>New commission earned!</p>`
    );
  }
  
  res.sendStatus(200);
});

// Tapfiliate (Affiliate)
app.post('/webhook/tapfiliate', async (req, res) => {
  const { type, data } = req.body;
  
  if (type === 'affiliate-signup') {
    await sendEmail(
      data.affiliate.email,
      data.affiliate.firstname,
      'Welcome to Our Affiliate Program!',
      `<h1>Welcome!</h1><p>Start referring and earning today!</p>`
    );
  }
  
  if (type === 'conversion-created') {
    await sendEmail(
      data.affiliate.email,
      data.affiliate.firstname,
      'New Conversion! 💰',
      `<h1>+$${data.commission.amount}</h1><p>You earned a commission!</p>`
    );
  }
  
  res.sendStatus(200);
});

app.listen(3000);
```

## Supported Platforms

| Platform | Events |
|----------|--------|
| Ko-fi | Donations, Subscriptions, Shop purchases |
| Buy Me a Coffee | Coffees, Extras, Memberships |
| Skool | Member joined, Course completed |
| Rewardful | Affiliate signup, Conversions |
| FirstPromoter | Promoter accepted, Rewards |
| Tapfiliate | Affiliate signup, Conversions |

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Ko-fi](https://ko-fi.com)
- [Buy Me a Coffee](https://buymeacoffee.com)
- [Skool](https://skool.com)

