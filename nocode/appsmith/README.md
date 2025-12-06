# ADSMedia Appsmith Integration

Send emails via ADSMedia API from your Appsmith applications.

## Setup

### 1. Create Datasource

1. Go to **Datasources** → **+ New Datasource**
2. Select **REST API**
3. Configure:

```
Name: ADSMedia API
URL: https://api.adsmedia.live/v1

Headers:
  Authorization: Bearer {{appsmith.store.adsmedia_api_key}}
  Content-Type: application/json
```

### 2. Store API Key

In your app's JS Objects:

```javascript
// Store API key securely
storeValue('adsmedia_api_key', 'your-api-key-here');
```

## API Queries

### Send Single Email

```
Name: SendEmail
Datasource: ADSMedia API
HTTP Method: POST
URL: /send

Body (JSON):
{
  "to": "{{Input_Email.text}}",
  "to_name": "{{Input_Name.text}}",
  "subject": "{{Input_Subject.text}}",
  "html": "{{RichTextEditor_Content.text}}",
  "from_name": "{{Input_FromName.text || 'My App'}}"
}
```

### Send Batch Email

```
Name: SendBatch
Datasource: ADSMedia API
HTTP Method: POST
URL: /send/batch

Body (JSON):
{
  "recipients": {{Table_Users.selectedRows.map(u => ({email: u.email, name: u.name}))}},
  "subject": "{{Input_Subject.text}}",
  "html": "{{RichTextEditor_Content.text}}",
  "from_name": "{{Input_FromName.text || 'My App'}}"
}
```

### Check Suppression

```
Name: CheckSuppression
Datasource: ADSMedia API
HTTP Method: GET
URL: /suppressions/check?email={{Input_CheckEmail.text}}
```

### Get Statistics

```
Name: GetStats
Datasource: ADSMedia API
HTTP Method: GET
URL: /stats/overview
```

### Test Connection

```
Name: Ping
Datasource: ADSMedia API
HTTP Method: GET
URL: /ping
```

## UI Layout

### Email Form

```yaml
Container:
  - Input Widget:
      name: Input_Email
      label: "To Email"
      placeholderText: "recipient@example.com"
  
  - Input Widget:
      name: Input_Name
      label: "Recipient Name"
      placeholderText: "John Doe"
  
  - Input Widget:
      name: Input_Subject
      label: "Subject"
      placeholderText: "Email Subject"
  
  - Rich Text Editor:
      name: RichTextEditor_Content
      label: "Content"
  
  - Button Widget:
      name: Button_Send
      label: "Send Email"
      onClick: |
        {{SendEmail.run().then(() => {
          if (SendEmail.data.success) {
            showAlert('Email sent! ID: ' + SendEmail.data.data.message_id, 'success');
          } else {
            showAlert('Error: ' + (SendEmail.data.error?.message || 'Failed'), 'error');
          }
        }).catch(e => showAlert('Error: ' + e.message, 'error'))}}
```

### Stats Dashboard

```yaml
Container:
  - Stat Box:
      name: Stat_TotalSent
      label: "Total Sent"
      value: "{{GetStats.data?.data?.total_sent || 0}}"
  
  - Stat Box:
      name: Stat_OpenRate
      label: "Open Rate"
      value: "{{((GetStats.data?.data?.opens / GetStats.data?.data?.total_sent) * 100 || 0).toFixed(1)}}%"
  
  - Stat Box:
      name: Stat_ClickRate
      label: "Click Rate"
      value: "{{((GetStats.data?.data?.clicks / GetStats.data?.data?.total_sent) * 100 || 0).toFixed(1)}}%"
```

### Batch Send Table

```yaml
Table Widget:
  name: Table_Users
  tableData: "{{GetUsers.data}}"
  enableMultiRowSelection: true
  
Button Widget:
  name: Button_SendBatch
  label: "Send to Selected"
  onClick: |
    {{SendBatch.run().then(() => {
      if (SendBatch.data.success) {
        showAlert('Batch sent! Task ID: ' + SendBatch.data.data.task_id, 'success');
      } else {
        showAlert('Error: ' + (SendBatch.data.error?.message || 'Failed'), 'error');
      }
    })}}
```

## JS Objects

### Email Helper

```javascript
export default {
  async sendWelcomeEmail(user) {
    const html = `
      <h1>Welcome, ${user.name}!</h1>
      <p>Thank you for joining our platform.</p>
    `;
    
    await SendEmail.run({
      to: user.email,
      to_name: user.name,
      subject: 'Welcome to Our Platform!',
      html: html
    });
    
    return SendEmail.data;
  },
  
  async sendPasswordReset(email) {
    const html = `
      <h1>Password Reset</h1>
      <p>Click the link below to reset your password.</p>
      <a href="{{appsmith.URL.fullPath}}/reset?token=...">Reset Password</a>
    `;
    
    await SendEmail.run({
      to: email,
      subject: 'Password Reset Request',
      html: html
    });
    
    return SendEmail.data;
  },
  
  formatRecipients(users) {
    return users.map(user => ({
      email: user.email,
      name: user.first_name + ' ' + user.last_name
    }));
  }
}
```

## Workflows

### On Page Load

```javascript
// Initialize data
{{(async () => {
  await GetStats.run();
  await GetUsers.run();
})()}}
```

### On Form Submit

```javascript
{{(async () => {
  // Validate
  if (!Input_Email.text || !Input_Subject.text) {
    showAlert('Please fill required fields', 'warning');
    return;
  }
  
  // Send
  await SendEmail.run();
  
  // Handle response
  if (SendEmail.data.success) {
    showAlert('Email sent successfully!', 'success');
    // Clear form
    Input_Email.setValue('');
    Input_Subject.setValue('');
    RichTextEditor_Content.setValue('');
  }
})()}}
```

## Error Handling

```javascript
// Global error handler in JS Object
export default {
  handleApiError(error) {
    if (error.statusCode === 401) {
      showAlert('Invalid API key', 'error');
    } else if (error.statusCode === 429) {
      showAlert('Rate limit exceeded. Try again later.', 'warning');
    } else {
      showAlert(error.message || 'Something went wrong', 'error');
    }
  }
}
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Appsmith](https://www.appsmith.com)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

