# ADSMedia Budibase Integration

Send emails via ADSMedia API from your Budibase applications.

## Setup

### 1. Create REST Datasource

1. Go to **Data** → **Add source**
2. Select **REST API**
3. Configure:

```
Name: ADSMedia
URL: https://api.adsmedia.live/v1

Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json
```

### 2. Create Queries

#### Send Email Query

```yaml
Query Name: sendEmail
Method: POST
URL: {{URL}}/send

Body:
{
  "to": "{{to}}",
  "to_name": "{{toName}}",
  "subject": "{{subject}}",
  "html": "{{html}}",
  "from_name": "{{fromName}}"
}

Bindings:
  - to (string)
  - toName (string)
  - subject (string)
  - html (string)
  - fromName (string, default: "My App")
```

#### Send Batch Query

```yaml
Query Name: sendBatch
Method: POST
URL: {{URL}}/send/batch

Body:
{
  "recipients": {{recipients}},
  "subject": "{{subject}}",
  "html": "{{html}}",
  "from_name": "{{fromName}}"
}

Bindings:
  - recipients (array)
  - subject (string)
  - html (string)
  - fromName (string)
```

#### Check Suppression Query

```yaml
Query Name: checkSuppression
Method: GET
URL: {{URL}}/suppressions/check?email={{email}}

Bindings:
  - email (string)
```

#### Get Stats Query

```yaml
Query Name: getStats
Method: GET
URL: {{URL}}/stats/overview
```

#### Ping Query

```yaml
Query Name: ping
Method: GET
URL: {{URL}}/ping
```

## Screen Components

### Email Form

1. Add Form component
2. Configure fields:

```yaml
Form Fields:
  - Email Input: recipientEmail
    Type: Email
    Required: true
  
  - Text Input: recipientName
    Label: "Recipient Name"
  
  - Text Input: subject
    Label: "Subject"
    Required: true
  
  - Long Form Text: content
    Label: "Email Content"
    Required: true
```

3. Add Button with action:

```javascript
// On Click - Execute Query
const result = await ADSMedia.sendEmail({
  to: $("form.recipientEmail"),
  toName: $("form.recipientName"),
  subject: $("form.subject"),
  html: `<p>${$("form.content")}</p>`,
  fromName: "My Budibase App"
});

if (result.success) {
  Notification.show("Email sent successfully!");
} else {
  Notification.show("Error: " + result.error?.message);
}
```

### Stats Dashboard

```yaml
Components:
  - Card: Total Sent
    Data: {{ Query.getStats.data.data.total_sent }}
  
  - Card: Open Rate
    Data: {{ (Query.getStats.data.data.opens / Query.getStats.data.data.total_sent * 100).toFixed(1) }}%
  
  - Card: Click Rate
    Data: {{ (Query.getStats.data.data.clicks / Query.getStats.data.data.total_sent * 100).toFixed(1) }}%
```

### User Table with Batch Send

```yaml
Components:
  - Table: usersTable
    Data: {{ Query.getUsers.data }}
    Row Selection: Multi
  
  - Button: Send to Selected
    On Click: |
      const selectedUsers = $("usersTable").selectedRows;
      const recipients = selectedUsers.map(u => ({
        email: u.email,
        name: u.name
      }));
      
      await ADSMedia.sendBatch({
        recipients: recipients,
        subject: $("form.subject"),
        html: $("form.content")
      });
```

## Automations

### On User Created

1. Create Automation
2. Trigger: Row Created (Users table)
3. Action: Execute Query

```javascript
// Query: sendEmail
{
  to: {{ trigger.row.email }},
  toName: {{ trigger.row.name }},
  subject: "Welcome to Our App!",
  html: "<h1>Hello {{ trigger.row.name }}!</h1><p>Welcome aboard.</p>",
  fromName: "My App"
}
```

### Scheduled Newsletter

1. Create Automation
2. Trigger: CRON (e.g., every Monday)
3. Actions:
   - Query all active users
   - Loop and send emails
   - Log results

## JavaScript Actions

### Send Welcome Email

```javascript
// In automation or button action
const user = context.trigger.row;

const response = await ADSMedia.sendEmail({
  to: user.email,
  toName: user.first_name + " " + user.last_name,
  subject: "Welcome!",
  html: `
    <h1>Welcome, ${user.first_name}!</h1>
    <p>We're excited to have you.</p>
  `,
  fromName: "My App Team"
});

return response;
```

### Batch Send with Progress

```javascript
const users = await Query.getAllUsers();
const results = [];

for (const user of users.data) {
  const result = await ADSMedia.sendEmail({
    to: user.email,
    toName: user.name,
    subject: "Newsletter",
    html: newsletterContent,
    fromName: "Newsletter Team"
  });
  results.push({ email: user.email, success: result.success });
}

return results;
```

## Bindings Reference

### Query Results

```javascript
// Access query data
{{ Query.sendEmail.data.data.message_id }}
{{ Query.getStats.data.data.total_sent }}
{{ Query.checkSuppression.data.data.suppressed }}
```

### Form Values

```javascript
// Access form inputs
$("form.fieldName")
{{ State.formValues.email }}
```

### Table Selection

```javascript
// Access selected rows
$("tableName").selectedRows
$("tableName").selectedRows[0].email
```

## Error Handling

```javascript
try {
  const result = await ADSMedia.sendEmail({...});
  
  if (result.success) {
    return { status: "sent", messageId: result.data.message_id };
  } else {
    return { status: "failed", error: result.error.message };
  }
} catch (error) {
  return { status: "error", error: error.message };
}
```

## Best Practices

1. **Environment Variables** - Store API key securely
2. **Validation** - Validate inputs before sending
3. **Logging** - Create sent email log table
4. **Templates** - Store HTML templates in a table
5. **Rate Limiting** - Add delays for bulk operations

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Budibase](https://budibase.com)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

