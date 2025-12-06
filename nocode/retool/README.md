# ADSMedia Retool Integration

Send emails via ADSMedia API from your Retool applications.

## Setup

### 1. Create Resource

1. Go to **Resources** in Retool
2. Click **Create new** → **REST API**
3. Configure:

```
Name: ADSMedia
Base URL: https://api.adsmedia.live/v1

Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json
```

### 2. Create Queries

#### Send Single Email

```
Name: send_email
Resource: ADSMedia
Action type: POST
URL path: /send

Body (JSON):
{
  "to": {{ email_input.value }},
  "to_name": {{ name_input.value || undefined }},
  "subject": {{ subject_input.value }},
  "html": {{ html_editor.value }},
  "text": {{ text_input.value || undefined }},
  "from_name": {{ from_name_input.value || undefined }}
}
```

#### Send Batch Email

```
Name: send_batch
Resource: ADSMedia
Action type: POST
URL path: /send/batch

Body (JSON):
{
  "recipients": {{ users_table.selectedRow.data.map(user => ({ email: user.email, name: user.name })) }},
  "subject": {{ subject_input.value }},
  "html": {{ html_editor.value }},
  "from_name": {{ from_name_input.value || "My App" }}
}
```

#### Check Suppression

```
Name: check_suppression
Resource: ADSMedia
Action type: GET
URL path: /suppressions/check
URL parameters:
  email: {{ email_input.value }}
```

#### Get Statistics

```
Name: get_stats
Resource: ADSMedia
Action type: GET
URL path: /stats/overview
```

#### Test Connection (Ping)

```
Name: ping
Resource: ADSMedia
Action type: GET
URL path: /ping
```

#### List Campaigns

```
Name: list_campaigns
Resource: ADSMedia
Action type: GET
URL path: /campaigns
```

#### Create Campaign

```
Name: create_campaign
Resource: ADSMedia
Action type: POST
URL path: /campaigns

Body (JSON):
{
  "name": {{ campaign_name_input.value }},
  "subject": {{ subject_input.value }},
  "html": {{ html_editor.value }},
  "text": {{ text_input.value || undefined }},
  "from_name": {{ from_name_input.value || "My App" }}
}
```

## UI Components

### Email Form

```javascript
// Container with inputs
Form:
  - Text Input: email_input (Email)
  - Text Input: name_input (Name)
  - Text Input: subject_input (Subject)
  - Rich Text Editor: html_editor (Content)
  - Button: send_button (Send Email)
    onClick: send_email.trigger()
```

### Batch Send from Table

```javascript
// Table showing users
Table: users_table
  Data: {{ users_query.data }}
  Selection: Enable multi-select

Button: send_to_selected
  onClick: send_batch.trigger()
```

### Statistics Dashboard

```javascript
// Stats display
Statistic: total_sent
  Value: {{ get_stats.data.data.total_sent }}
  Label: "Total Sent"

Statistic: open_rate
  Value: {{ (get_stats.data.data.opens / get_stats.data.data.total_sent * 100).toFixed(1) }}%
  Label: "Open Rate"

Statistic: click_rate
  Value: {{ (get_stats.data.data.clicks / get_stats.data.data.total_sent * 100).toFixed(1) }}%
  Label: "Click Rate"
```

## Event Handlers

### Success Handler

```javascript
// On send_email success
if (send_email.data.success) {
  utils.showNotification({
    title: "Email Sent!",
    description: `Message ID: ${send_email.data.data.message_id}`,
    notificationType: "success"
  });
} else {
  utils.showNotification({
    title: "Error",
    description: send_email.data.error?.message || "Failed to send",
    notificationType: "error"
  });
}
```

### Error Handler

```javascript
// On query error
utils.showNotification({
  title: "API Error",
  description: send_email.error?.message || "Something went wrong",
  notificationType: "error"
});
```

## Transformers

### Format Recipients

```javascript
// Transform table data to recipients array
const users = {{ users_query.data }};
return users.map(user => ({
  email: user.email,
  name: `${user.first_name} ${user.last_name}`
}));
```

### Parse Response

```javascript
// Extract message ID from response
const response = {{ send_email.data }};
return response.success ? response.data.message_id : null;
```

## Workflows

### Send Welcome Email Workflow

1. Query new user data
2. Transform to email format
3. Call send_email
4. Log result
5. Update user record

```javascript
// Workflow steps
await get_new_user.trigger();
const user = get_new_user.data[0];

await send_email.trigger({
  additionalScope: {
    email: user.email,
    name: user.name,
    subject: "Welcome!",
    html: `<h1>Hello ${user.name}!</h1>`
  }
});

if (send_email.data.success) {
  await mark_user_welcomed.trigger({ userId: user.id });
}
```

## Best Practices

1. **Environment Variables** - Store API key in Retool secrets
2. **Error Handling** - Always check `response.success`
3. **Rate Limits** - Add delays for bulk operations
4. **Logging** - Track sent emails in your database
5. **Templates** - Store HTML templates separately

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Retool](https://retool.com)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

