# ADSMedia ToolJet Integration

Send emails via ADSMedia API from your ToolJet applications.

## Setup

### 1. Create REST API Data Source

1. Go to **Data Sources** → **Add new**
2. Select **REST API**
3. Configure:

```yaml
Name: ADSMedia
Base URL: https://api.adsmedia.live/v1

Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json
```

### 2. Create Queries

#### Send Email

```yaml
Query Name: sendEmail
Resource: ADSMedia
Operation: POST
URL path: /send

Body:
{
  "to": "{{components.emailInput.value}}",
  "to_name": "{{components.nameInput.value}}",
  "subject": "{{components.subjectInput.value}}",
  "html": "{{components.contentEditor.value}}",
  "from_name": "{{components.fromNameInput.value || 'My App'}}"
}
```

#### Send Batch

```yaml
Query Name: sendBatch
Resource: ADSMedia
Operation: POST
URL path: /send/batch

Body:
{
  "recipients": {{queries.getSelectedUsers.data.map(u => ({email: u.email, name: u.name}))}},
  "subject": "{{components.subjectInput.value}}",
  "html": "{{components.contentEditor.value}}",
  "from_name": "{{components.fromNameInput.value || 'My App'}}"
}
```

#### Check Suppression

```yaml
Query Name: checkSuppression
Resource: ADSMedia
Operation: GET
URL path: /suppressions/check
URL params:
  email: {{components.checkEmailInput.value}}
```

#### Get Statistics

```yaml
Query Name: getStats
Resource: ADSMedia
Operation: GET
URL path: /stats/overview
```

#### Ping

```yaml
Query Name: ping
Resource: ADSMedia
Operation: GET
URL path: /ping
```

## UI Components

### Email Form

```yaml
Container:
  layout: column
  
  Children:
    - TextInput:
        name: emailInput
        label: "To Email"
        placeholder: "recipient@example.com"
        validation:
          required: true
          pattern: email
    
    - TextInput:
        name: nameInput
        label: "Recipient Name"
        placeholder: "John Doe"
    
    - TextInput:
        name: subjectInput
        label: "Subject"
        placeholder: "Email Subject"
        validation:
          required: true
    
    - RichTextEditor:
        name: contentEditor
        label: "Content"
    
    - Button:
        name: sendButton
        text: "Send Email"
        loading: "{{queries.sendEmail.isLoading}}"
        onClick: |
          await queries.sendEmail.run();
          if (queries.sendEmail.data.success) {
            await actions.showAlert('success', 'Email sent!');
            actions.setComponentValue('emailInput', '');
            actions.setComponentValue('subjectInput', '');
            actions.setComponentValue('contentEditor', '');
          } else {
            await actions.showAlert('error', queries.sendEmail.data.error?.message || 'Failed');
          }
```

### Statistics Dashboard

```yaml
Container:
  layout: row
  
  Children:
    - StatBox:
        name: totalSentStat
        title: "Total Sent"
        value: "{{queries.getStats.data?.data?.total_sent || 0}}"
        onLoad: queries.getStats.run()
    
    - StatBox:
        name: openRateStat
        title: "Open Rate"
        value: "{{((queries.getStats.data?.data?.opens / queries.getStats.data?.data?.total_sent) * 100 || 0).toFixed(1)}}%"
    
    - StatBox:
        name: clickRateStat
        title: "Click Rate"
        value: "{{((queries.getStats.data?.data?.clicks / queries.getStats.data?.data?.total_sent) * 100 || 0).toFixed(1)}}%"
```

### Users Table with Batch Send

```yaml
Table:
  name: usersTable
  data: "{{queries.getUsers.data}}"
  columns:
    - name
    - email
    - status
  enableSelection: true
  selectionMode: multiple

Button:
  name: batchSendButton
  text: "Send to {{components.usersTable.selectedRows.length}} Selected"
  disabled: "{{components.usersTable.selectedRows.length === 0}}"
  onClick: |
    const recipients = components.usersTable.selectedRows.map(u => ({
      email: u.email,
      name: u.name
    }));
    await queries.sendBatch.run({ recipients });
    if (queries.sendBatch.data.success) {
      await actions.showAlert('success', 'Batch sent!');
    }
```

## JavaScript Queries

### Transform Recipients

```javascript
// Query: transformRecipients
const users = queries.getUsers.data;
return users.map(user => ({
  email: user.email,
  name: `${user.first_name} ${user.last_name}`
}));
```

### Send with Retry

```javascript
// Query: sendWithRetry
const maxRetries = 3;
let attempts = 0;

while (attempts < maxRetries) {
  try {
    const result = await queries.sendEmail.run();
    if (result.success) {
      return result;
    }
    attempts++;
  } catch (error) {
    attempts++;
    if (attempts === maxRetries) throw error;
    await new Promise(r => setTimeout(r, 1000 * attempts));
  }
}
```

### Build HTML Template

```javascript
// Query: buildHtmlTemplate
const templateName = components.templateSelect.value;
const userData = components.usersTable.selectedRow;

const templates = {
  welcome: `
    <h1>Welcome, ${userData.name}!</h1>
    <p>We're excited to have you on board.</p>
  `,
  newsletter: `
    <h1>Weekly Newsletter</h1>
    <p>Hi ${userData.name}, here are the latest updates...</p>
  `,
  notification: `
    <h1>Important Notice</h1>
    <p>Hello ${userData.name}, we have an update for you.</p>
  `
};

return templates[templateName] || '<p>No template selected</p>';
```

## Event Handlers

### On Query Success

```javascript
// In query settings > Run JavaScript code on query success
if (data.success) {
  await actions.showAlert('success', `Email sent! ID: ${data.data.message_id}`);
  await actions.runQuery('getStats'); // Refresh stats
} else {
  await actions.showAlert('error', data.error?.message || 'Send failed');
}
```

### On Form Submit

```javascript
// Button onClick
async function handleSubmit() {
  // Validate
  if (!components.emailInput.value || !components.subjectInput.value) {
    await actions.showAlert('warning', 'Please fill required fields');
    return;
  }
  
  // Send
  await queries.sendEmail.run();
}
```

## Workflows

### Welcome Email Workflow

```javascript
// Trigger: On user creation in database
async function onUserCreated(userData) {
  await queries.sendEmail.run({
    to: userData.email,
    toName: userData.name,
    subject: 'Welcome!',
    html: `<h1>Hello ${userData.name}!</h1><p>Welcome to our platform.</p>`,
    fromName: 'My App'
  });
  
  // Update user record
  await queries.updateUser.run({
    id: userData.id,
    welcomeEmailSent: true
  });
}
```

## Best Practices

1. **API Key Security** - Use ToolJet's environment variables
2. **Error Handling** - Check response.success
3. **Loading States** - Use isLoading for buttons
4. **Validation** - Validate before sending
5. **Logging** - Track sent emails

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [ToolJet](https://tooljet.com)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

