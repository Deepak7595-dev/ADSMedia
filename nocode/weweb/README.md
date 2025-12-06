# ADSMedia WeWeb Integration

Send emails via ADSMedia API from your WeWeb applications.

## Setup

### 1. Create REST API Collection

1. Go to **Data** → **Collections**
2. Click **+ Add** → **REST API**
3. Configure the collection

### Base Configuration

```
Name: ADSMedia
Base URL: https://api.adsmedia.live/v1

Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json
```

## API Endpoints

### Send Email

```yaml
Endpoint: sendEmail
Method: POST
Path: /send
Mode: Backend (recommended)

Body:
{
  "to": "{{to}}",
  "to_name": "{{toName}}",
  "subject": "{{subject}}",
  "html": "{{html}}",
  "text": "{{text}}",
  "from_name": "{{fromName}}"
}
```

### Send Batch

```yaml
Endpoint: sendBatch
Method: POST
Path: /send/batch
Mode: Backend

Body:
{
  "recipients": {{recipients}},
  "subject": "{{subject}}",
  "html": "{{html}}",
  "from_name": "{{fromName}}"
}
```

### Check Suppression

```yaml
Endpoint: checkSuppression
Method: GET
Path: /suppressions/check
Mode: Backend

Query Parameters:
  email: {{email}}
```

### Get Statistics

```yaml
Endpoint: getStats
Method: GET
Path: /stats/overview
Mode: Backend
```

### Ping

```yaml
Endpoint: ping
Method: GET
Path: /ping
Mode: Backend
```

## Workflows

### Send Single Email Workflow

1. Create workflow: "sendEmailWorkflow"
2. Add actions:

```yaml
Actions:
  1. Call collection: ADSMedia.sendEmail
     Parameters:
       to: {{emailInput.value}}
       toName: {{nameInput.value}}
       subject: {{subjectInput.value}}
       html: {{contentEditor.value}}
       fromName: "My WeWeb App"
  
  2. Conditional:
     If: {{action1.result.success}} == true
     Then:
       - Show notification: "Email sent!"
       - Reset form
     Else:
       - Show notification: "Error: {{action1.result.error.message}}"
```

### Batch Send Workflow

```yaml
Actions:
  1. Transform data:
     - Input: {{usersCollection.data}}
     - Output: recipients array
  
  2. Call collection: ADSMedia.sendBatch
     Parameters:
       recipients: {{action1.result}}
       subject: {{subjectInput.value}}
       html: {{contentEditor.value}}
  
  3. Show notification based on result
```

## Components

### Email Form

```yaml
Form Component:
  Elements:
    - Text Input: emailInput
      Label: "To Email"
      Validation: email
    
    - Text Input: nameInput
      Label: "Recipient Name"
    
    - Text Input: subjectInput
      Label: "Subject"
      Validation: required
    
    - Rich Text Editor: contentEditor
      Label: "Content"
    
    - Button: sendButton
      Label: "Send Email"
      On Click: sendEmailWorkflow
```

### Stats Dashboard

```yaml
Dashboard Section:
  On Load: ADSMedia.getStats.fetch()
  
  Elements:
    - Stat Card:
        Title: "Total Sent"
        Value: {{ADSMedia.getStats.data.data.total_sent}}
    
    - Stat Card:
        Title: "Open Rate"
        Value: {{(ADSMedia.getStats.data.data.opens / ADSMedia.getStats.data.data.total_sent * 100).toFixed(1)}}%
    
    - Stat Card:
        Title: "Click Rate"
        Value: {{(ADSMedia.getStats.data.data.clicks / ADSMedia.getStats.data.data.total_sent * 100).toFixed(1)}}%
```

### User Selection Table

```yaml
Table Component:
  Data: {{usersCollection.data}}
  Selection: Multi-select enabled
  
  Columns:
    - Name
    - Email
    - Status
  
  Below table:
    - Button: sendToSelected
      Label: "Send to Selected ({{table.selectedRows.length}})"
      On Click: batchSendWorkflow
      Disabled: {{table.selectedRows.length === 0}}
```

## Formulas

### Format Recipients

```javascript
// In formula editor
const users = collections.users.data;
return users.map(user => ({
  email: user.email,
  name: user.first_name + ' ' + user.last_name
}));
```

### Build Personalized HTML

```javascript
// In formula editor
const template = variables.emailTemplate;
const user = variables.currentUser;

return template
  .replace('{{name}}', user.name)
  .replace('{{email}}', user.email)
  .replace('{{date}}', new Date().toLocaleDateString());
```

### Validate Email

```javascript
// In formula editor
const email = variables.emailInput;
const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return regex.test(email);
```

## Variables

### App Variables

```yaml
Variables:
  - apiKey: String (secret)
  - defaultFromName: String = "My App"
  - emailTemplates: Object
      welcome: {...}
      notification: {...}
```

### Page Variables

```yaml
Variables:
  - isSending: Boolean = false
  - lastResult: Object = null
  - selectedUsers: Array = []
```

## Event Handlers

### On Form Submit

```javascript
// Workflow actions
async function onFormSubmit() {
  variables.isSending = true;
  
  try {
    const result = await collections.ADSMedia.sendEmail.fetch({
      to: emailInput.value,
      subject: subjectInput.value,
      html: contentEditor.value
    });
    
    variables.lastResult = result;
    
    if (result.success) {
      showNotification('success', 'Email sent!');
      resetForm();
    } else {
      showNotification('error', result.error.message);
    }
  } catch (error) {
    showNotification('error', 'Network error');
  }
  
  variables.isSending = false;
}
```

## Error Handling

```yaml
Conditional Logic:
  If API call fails:
    - Log error to console
    - Show user-friendly message
    - Enable retry button
  
  If validation fails:
    - Highlight invalid fields
    - Show validation messages
```

## Best Practices

1. **Backend Mode** - Use backend mode for API calls
2. **Secrets** - Store API key in environment variables
3. **Loading States** - Show spinner during operations
4. **Validation** - Validate before sending
5. **Feedback** - Clear success/error messages

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [WeWeb](https://www.weweb.io)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

