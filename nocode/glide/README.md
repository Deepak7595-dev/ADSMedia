# ADSMedia Glide Integration

Send emails via ADSMedia API from your Glide apps.

## Overview

Glide supports API integrations through:
1. **Glide API** (Business/Enterprise plans)
2. **Integromat/Make** webhook integration
3. **Zapier** integration

## Method 1: Glide API Integration

### Setup

1. Go to your Glide app **Data** section
2. Click **+ Add integration**
3. Select **API**
4. Configure the API call

### Send Email API Call

```
Name: Send Email via ADSMedia
Method: POST
URL: https://api.adsmedia.live/v1/send

Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json

Body:
{
  "to": {{Email Column}},
  "to_name": {{Name Column}},
  "subject": {{Subject}},
  "html": {{HTML Content}},
  "from_name": "My Glide App"
}
```

### Usage in Actions

1. Add a **Button** component
2. Set action: **Call API → Send Email via ADSMedia**
3. Map columns to API parameters

## Method 2: Via Make (Integromat)

### Create Make Scenario

1. Create new scenario in Make
2. Add **Webhooks** → **Custom webhook** as trigger
3. Add **HTTP** → **Make a request** module

### HTTP Module Configuration

```
URL: https://api.adsmedia.live/v1/send
Method: POST

Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json

Body type: Raw
Content type: JSON (application/json)

Request content:
{
  "to": "{{1.email}}",
  "to_name": "{{1.name}}",
  "subject": "{{1.subject}}",
  "html": "{{1.html}}",
  "from_name": "My App"
}
```

### Connect to Glide

1. Copy webhook URL from Make
2. In Glide, add **Webhook** action
3. Paste webhook URL
4. Map data columns

## Method 3: Via Zapier

### Create Zap

1. Trigger: **Webhooks by Zapier** → **Catch Hook**
2. Action: **Webhooks by Zapier** → **POST**

### POST Action Configuration

```
URL: https://api.adsmedia.live/v1/send
Payload Type: json

Data:
  to: Email from Step 1
  to_name: Name from Step 1
  subject: Subject from Step 1
  html: Content from Step 1
  from_name: My App

Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json
```

### Connect to Glide

1. Copy Zapier webhook URL
2. In Glide, add **Webhook** action
3. Configure payload mapping

## Use Cases

### Welcome Email

When user signs up:
1. Trigger: New row in Users table
2. Send welcome email with user's name
3. Update "Welcome Sent" column

### Order Confirmation

When order is placed:
1. Trigger: New row in Orders table
2. Send order details to customer
3. Include order items and total

### Appointment Reminder

Before scheduled appointment:
1. Trigger: Scheduled time check
2. Send reminder with details
3. Include reschedule link

## Data Structure

### Users Table

| Email | Name | Welcome Sent |
|-------|------|--------------|
| john@example.com | John Doe | ✓ |
| jane@example.com | Jane Smith | ✓ |

### Email Templates Table

| Template Name | Subject | HTML Content |
|--------------|---------|--------------|
| Welcome | Welcome to {App}! | `<h1>Hello {Name}!</h1>` |
| Order | Your Order #{ID} | `<h1>Order Confirmed</h1>` |

## Dynamic Content

Use Glide column values in email:

```html
<h1>Hello {{Name}}!</h1>
<p>Your order #{{Order ID}} has been confirmed.</p>
<p>Total: ${{Total}}</p>
```

## Best Practices

1. **Template Emails** - Store templates in a table
2. **Logging** - Create email log table
3. **Error Handling** - Check webhook responses
4. **Testing** - Test with your own email first
5. **Rate Limits** - Don't send too many at once

## Troubleshooting

### Email not sending?

1. Check API key is correct
2. Verify column mappings
3. Check Make/Zapier scenario is active
4. Review error logs

### Wrong content?

1. Verify column references
2. Check for null values
3. Test with static content first

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Glide](https://www.glideapps.com)
- [Make](https://www.make.com)
- [Zapier](https://zapier.com)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

