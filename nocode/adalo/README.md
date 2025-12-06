# ADSMedia Adalo Integration

Send emails via ADSMedia API from your Adalo apps.

## Overview

Adalo supports API integrations through:
1. **Custom Actions** (External Collections)
2. **Zapier/Make** integrations
3. **Custom Components** (advanced)

## Method 1: External Collection

### Create External Collection

1. Go to your Adalo app **Database**
2. Click **+ Add Collection** → **External Collection**
3. Configure the API

### Base Configuration

```
API Base URL: https://api.adsmedia.live/v1

Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json
```

### Send Email Endpoint

```yaml
Endpoint Name: Send Email
Endpoint Path: /send
Method: POST

Request Body Template:
{
  "to": "{{to}}",
  "to_name": "{{to_name}}",
  "subject": "{{subject}}",
  "html": "{{html}}",
  "from_name": "{{from_name}}"
}

Properties:
  - to (Text, Input)
  - to_name (Text, Input, Optional)
  - subject (Text, Input)
  - html (Text, Input)
  - from_name (Text, Input, Optional)
```

### Check Suppression Endpoint

```yaml
Endpoint Name: Check Suppression
Endpoint Path: /suppressions/check
Method: GET

Query Parameters:
  email: {{email}}

Properties:
  - email (Text, Input)
  - suppressed (True/False, Output)
```

### Ping Endpoint

```yaml
Endpoint Name: Ping
Endpoint Path: /ping
Method: GET

Properties:
  - message (Text, Output)
```

## Usage in Actions

### Button Click - Send Email

1. Add a **Button** component
2. Open **Actions**
3. Add action: **Create** → Select "Send Email" collection
4. Map fields:
   - `to`: Logged In User's Email
   - `subject`: Form input or static text
   - `html`: Form input or template
   - `from_name`: "My App"

### Form Submission

1. Create a Form with fields:
   - Email Input
   - Subject Input
   - Message Input
2. On Submit:
   - Create record in "Send Email" collection
   - Show success notification
   - Navigate or clear form

### After User Signup

1. Edit Signup action flow
2. Add action after user creation:
   - Create → Send Email
   - `to`: New User's Email
   - `subject`: "Welcome to Our App!"
   - `html`: Welcome message HTML

## Screens Setup

### Email Sending Screen

```yaml
Screen: Send Email

Components:
  - Text Input: recipientEmail
    Placeholder: "Recipient Email"
  
  - Text Input: recipientName
    Placeholder: "Recipient Name"
  
  - Text Input: emailSubject
    Placeholder: "Subject"
  
  - Text Area: emailContent
    Placeholder: "Message"
  
  - Button: Send
    Actions:
      1. Create → Send Email
         to: recipientEmail
         to_name: recipientName
         subject: emailSubject
         html: "<p>" & emailContent & "</p>"
         from_name: "My App"
      2. Show Notification: "Email sent!"
      3. Clear Inputs
```

### Email Templates Screen

```yaml
Screen: Email Templates

Components:
  - List of templates (from collection)
  - Click action: Navigate to Compose with template
```

## Custom Logic

### Conditional Send

```yaml
Actions:
  1. If condition: Logged In User's Verified is True
     Then:
       - Create → Send Email
       - Show: "Email sent!"
     Else:
       - Show: "Please verify your email first"
```

### Batch Send from List

```yaml
Actions (on list item):
  1. Create → Send Email
     to: Current Item's Email
     to_name: Current Item's Name
     subject: Form's Subject
     html: Form's Content
```

## Method 2: Via Zapier

### Create Zap

1. Trigger: Webhooks → Catch Hook
2. Action: Webhooks → POST

### POST Configuration

```
URL: https://api.adsmedia.live/v1/send
Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json
Body:
  {
    "to": "email from trigger",
    "subject": "subject from trigger",
    "html": "content from trigger"
  }
```

### Adalo Webhook Action

1. Install Zapier integration
2. Add "Zapier" action
3. Select your Zap
4. Map data fields

## Method 3: Via Make (Integromat)

### Create Scenario

1. Webhook trigger
2. HTTP POST module to ADSMedia API

### Connect from Adalo

Similar to Zapier - use webhook action.

## Data Structure

### Email Log Collection

Create collection to track sent emails:

```yaml
Collection: Email Log
Properties:
  - to (Email)
  - subject (Text)
  - sent_at (Date & Time)
  - status (Text)
  - message_id (Text)
  - user (Relationship to Users)
```

## Best Practices

1. **API Key Security** - Use Adalo's secure storage
2. **Validation** - Check email format
3. **Rate Limiting** - Don't send too fast
4. **Logging** - Track sent emails
5. **Templates** - Store in collection

## Troubleshooting

### Not Sending?

1. Check API key is correct
2. Verify endpoint URL
3. Check field mappings
4. Test with Adalo's API tester

### Wrong Data?

1. Verify property bindings
2. Check for null values
3. Test with hardcoded values first

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Adalo](https://www.adalo.com)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

