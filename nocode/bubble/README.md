# ADSMedia Bubble.io Plugin

Send emails via ADSMedia API from your Bubble.io applications.

## Installation

1. Go to your Bubble app **Plugins** section
2. Click **Add plugins** → **Install new plugin**
3. Search for "ADSMedia" or install manually

## Manual Installation

### 1. Create API Connector

1. Install the **API Connector** plugin
2. Click **Add another API**
3. Configure:

```
API Name: ADSMedia
Authentication: Private key in header
Key name: Authorization
Key value: Bearer YOUR_API_KEY
```

### 2. Add Calls

#### Send Email

```
Name: send_email
Method: POST
URL: https://api.adsmedia.live/v1/send
Use as: Action

Headers:
  Content-Type: application/json

Body type: JSON
Body:
{
  "to": "<to>",
  "to_name": "<to_name>",
  "subject": "<subject>",
  "html": "<html>",
  "text": "<text>",
  "from_name": "<from_name>",
  "reply_to": "<reply_to>"
}
```

Parameters (uncheck private for all):
- `to` (required)
- `subject` (required)
- `html` (required)
- `to_name` (optional)
- `text` (optional)
- `from_name` (optional)
- `reply_to` (optional)

#### Send Batch

```
Name: send_batch
Method: POST
URL: https://api.adsmedia.live/v1/send/batch
Use as: Action

Body:
{
  "recipients": <recipients>,
  "subject": "<subject>",
  "html": "<html>",
  "text": "<text>",
  "from_name": "<from_name>"
}
```

#### Check Suppression

```
Name: check_suppression
Method: GET
URL: https://api.adsmedia.live/v1/suppressions/check
Use as: Data

Parameters:
  email: <email>
```

#### Ping (Test Connection)

```
Name: ping
Method: GET
URL: https://api.adsmedia.live/v1/ping
Use as: Data
```

## Usage in Workflows

### Send Welcome Email

1. Create workflow trigger (e.g., "User is logged in" first time)
2. Add action: **Plugins → ADSMedia - send_email**
3. Set parameters:
   - `to`: Current User's email
   - `to_name`: Current User's name
   - `subject`: "Welcome to [Your App]!"
   - `html`: Your welcome email HTML

### Batch Newsletter

1. Create "Send Newsletter" button
2. Add workflow:
   - Search for Users (filter as needed)
   - ADSMedia - send_batch
   - `recipients`: Format list with email and name fields
   - `subject`: Newsletter subject
   - `html`: Newsletter content

## Response Handling

### Successful Response

```json
{
  "success": true,
  "data": {
    "message_id": "api-123456789-abcdef",
    "send_id": 123,
    "to": "user@example.com",
    "status": "sent"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "invalid_recipient",
    "message": "Invalid email address"
  }
}
```

## Personalization

Use Bubble's dynamic data to personalize:

```html
<h1>Hello, [Current User's First Name]!</h1>
<p>Welcome to our platform.</p>
```

## Best Practices

1. **Test in Development** - Always test emails in dev mode first
2. **Error Handling** - Add conditional logic for API errors
3. **Rate Limiting** - Avoid sending too many emails at once
4. **Unsubscribe** - Include unsubscribe links using `%%unsubscribelink%%`

## Placeholders

Available in batch emails:
- `%%First Name%%` - Recipient's first name
- `%%Last Name%%` - Recipient's last name
- `%%emailaddress%%` - Recipient's email
- `%%unsubscribelink%%` - Unsubscribe URL
- `%%webversion%%` - Web version URL

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Bubble.io](https://bubble.io)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

