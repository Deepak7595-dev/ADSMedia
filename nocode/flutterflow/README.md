# ADSMedia FlutterFlow Integration

Send emails via ADSMedia API from your FlutterFlow apps.

## Setup

### 1. Create API Group

1. Go to **API Calls** in FlutterFlow
2. Click **+ Add API Call**
3. Create API Group named "ADSMedia"

### 2. Add Base Configuration

```
Base URL: https://api.adsmedia.live/v1

Headers (for all calls):
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json
```

## API Calls

### Send Single Email

```yaml
Name: sendEmail
Method: POST
Path: /send
Body (JSON):
{
  "to": "[to]",
  "to_name": "[toName]",
  "subject": "[subject]",
  "html": "[html]",
  "text": "[text]",
  "from_name": "[fromName]"
}

Variables:
  - to (String, required)
  - toName (String, optional)
  - subject (String, required)
  - html (String, required)
  - text (String, optional)
  - fromName (String, optional, default: "My App")
```

### Send Batch Email

```yaml
Name: sendBatch
Method: POST
Path: /send/batch
Body (JSON):
{
  "recipients": [recipients],
  "subject": "[subject]",
  "html": "[html]",
  "from_name": "[fromName]"
}

Variables:
  - recipients (JSON, required) - Array of {email, name}
  - subject (String, required)
  - html (String, required)
  - fromName (String, optional)
```

### Check Suppression

```yaml
Name: checkSuppression
Method: GET
Path: /suppressions/check

Query Parameters:
  email: [email]

Variables:
  - email (String, required)
```

### Ping (Test Connection)

```yaml
Name: ping
Method: GET
Path: /ping
```

### Get Statistics

```yaml
Name: getStats
Method: GET
Path: /stats/overview
```

## Usage in Actions

### Button Action - Send Email

1. Add Button widget
2. Open Action Flow Editor
3. Add **Backend Call** action
4. Select "ADSMedia" → "sendEmail"
5. Set variables:
   - `to`: User's email (from state/Firestore)
   - `subject`: "Welcome!"
   - `html`: Your HTML template

### Form Submission

1. Create form with fields:
   - Email field
   - Subject field
   - Message field
2. On Submit action:
   - Validate fields
   - Call sendEmail API
   - Show success/error snackbar

### After User Registration

```yaml
Action Flow:
  1. Create Account (Firebase Auth)
  2. Backend Call: sendEmail
     - to: [Created User Email]
     - subject: "Welcome to Our App!"
     - html: "<h1>Welcome!</h1><p>Thanks for joining.</p>"
  3. Show Snackbar: "Welcome email sent!"
```

## Custom Functions

### Format Recipients for Batch

Create custom function:

```dart
// Name: formatRecipientsForBatch
// Return type: JSON
// Parameters: users (List<UserStruct>)

List<Map<String, dynamic>> formatRecipientsForBatch(List<UserStruct> users) {
  return users.map((user) => {
    'email': user.email,
    'name': user.displayName ?? '',
  }).toList();
}
```

### Build HTML from Template

```dart
// Name: buildEmailHtml
// Return type: String
// Parameters: templateName (String), userName (String), customData (JSON)

String buildEmailHtml(String templateName, String userName, Map customData) {
  switch (templateName) {
    case 'welcome':
      return '''
        <h1>Welcome, $userName!</h1>
        <p>We're excited to have you on board.</p>
      ''';
    case 'order':
      return '''
        <h1>Order Confirmation</h1>
        <p>Hi $userName, your order #${customData['orderId']} is confirmed.</p>
        <p>Total: \$${customData['total']}</p>
      ''';
    default:
      return '<p>Hello, $userName!</p>';
  }
}
```

## Response Handling

### Success Response

```json
{
  "success": true,
  "data": {
    "message_id": "api-123456789-abcdef",
    "send_id": 123,
    "status": "sent"
  }
}
```

### Action Flow with Response

```yaml
Action Flow:
  1. Backend Call: sendEmail
  2. Conditional:
     If response.success == true:
       - Show Snackbar: "Email sent successfully!"
       - Update local state
     Else:
       - Show Snackbar: "Failed: ${response.error.message}"
```

## State Management

### Email Send State

Create App State:
```
emailSending: bool (default: false)
lastEmailResult: JSON
```

Use in Action Flow:
```yaml
1. Update State: emailSending = true
2. Backend Call: sendEmail
3. Update State: lastEmailResult = API response
4. Update State: emailSending = false
5. Conditional based on result
```

## Templates

Store email templates in Firestore:

```yaml
Collection: email_templates
Document: welcome
Fields:
  - name: "Welcome Email"
  - subject: "Welcome to {{appName}}!"
  - html: "<h1>Hello {{userName}}!</h1>..."
  - variables: ["appName", "userName"]
```

## Best Practices

1. **Secure API Key** - Use FlutterFlow secrets
2. **Validate Inputs** - Check email format
3. **Loading States** - Show spinner while sending
4. **Error Messages** - Display user-friendly errors
5. **Logging** - Store sent emails in Firestore

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [FlutterFlow](https://flutterflow.io)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

