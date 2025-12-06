# ADSMedia Xano Integration

Send emails via ADSMedia API from your Xano backend.

## Setup

### 1. Create External API Resource

1. Go to **External API Request** in your Xano workspace
2. Click **Add External API**
3. Configure:

```yaml
Name: ADSMedia
Base URL: https://api.adsmedia.live/v1

Default Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json
```

## API Functions

### Create Send Email Function

1. Go to **API** → Create new API endpoint
2. Or create a **Function** for reuse

```yaml
Function: send_adsmedia_email
Inputs:
  - to (text)
  - to_name (text, optional)
  - subject (text)
  - html (text)
  - from_name (text, optional, default: "My App")

Function Stack:
  1. External API Request
     Resource: ADSMedia
     Method: POST
     Path: /send
     Body:
       to: var:to
       to_name: var:to_name
       subject: var:subject
       html: var:html
       from_name: var:from_name
  
  2. Return: api_response
```

### Create Send Batch Function

```yaml
Function: send_adsmedia_batch
Inputs:
  - recipients (list of objects: {email, name})
  - subject (text)
  - html (text)
  - from_name (text, optional)

Function Stack:
  1. External API Request
     Resource: ADSMedia
     Method: POST
     Path: /send/batch
     Body:
       recipients: var:recipients
       subject: var:subject
       html: var:html
       from_name: var:from_name
  
  2. Return: api_response
```

### Create Check Suppression Function

```yaml
Function: check_adsmedia_suppression
Inputs:
  - email (text)

Function Stack:
  1. External API Request
     Resource: ADSMedia
     Method: GET
     Path: /suppressions/check
     Query Params:
       email: var:email
  
  2. Return: api_response.data.suppressed
```

## API Endpoints

### POST /send-email

```yaml
Endpoint: /send-email
Method: POST

Inputs:
  - to (text, required)
  - to_name (text)
  - subject (text, required)
  - html (text, required)

Function Stack:
  1. Precondition
     Expression: !is_empty(input.to) AND !is_empty(input.subject)
     Error: "Missing required fields"
  
  2. Call Function: send_adsmedia_email
     to: input.to
     to_name: input.to_name
     subject: input.subject
     html: input.html
     from_name: "My Xano App"
  
  3. Create Record (email_log)
     to: input.to
     subject: input.subject
     message_id: function_result.data.message_id
     sent_at: now()
  
  4. Return:
     success: true
     message_id: function_result.data.message_id
```

### POST /send-welcome-email

```yaml
Endpoint: /send-welcome-email
Method: POST

Inputs:
  - user_id (integer, required)

Function Stack:
  1. Get Record (users)
     id: input.user_id
  
  2. Precondition
     Expression: !is_empty(user.email)
     Error: "User has no email"
  
  3. Call Function: send_adsmedia_email
     to: user.email
     to_name: user.name
     subject: "Welcome to Our App!"
     html: |
       <h1>Hello {{user.name}}!</h1>
       <p>Welcome to our platform. We're excited to have you!</p>
     from_name: "Welcome Team"
  
  4. Update Record (users)
     id: input.user_id
     welcome_email_sent: true
  
  5. Return:
     success: true
     message: "Welcome email sent"
```

### GET /email-stats

```yaml
Endpoint: /email-stats
Method: GET

Authentication: Required

Function Stack:
  1. External API Request
     Resource: ADSMedia
     Method: GET
     Path: /stats/overview
  
  2. Return: api_response.data
```

## Task Scheduler

### Daily Welcome Emails

```yaml
Task: daily_welcome_emails
Schedule: Daily at 9:00 AM

Function Stack:
  1. Query Records (users)
     Filter:
       welcome_email_sent = false
       created_at > date_subtract(now(), 1, "day")
  
  2. For Each Loop
     Collection: query_result
     
     Loop Stack:
       a. Call Function: send_adsmedia_email
          to: item.email
          to_name: item.name
          subject: "Welcome!"
          html: "<h1>Welcome {{item.name}}!</h1>"
       
       b. Update Record (users)
          id: item.id
          welcome_email_sent: true
```

### Weekly Newsletter

```yaml
Task: weekly_newsletter
Schedule: Every Monday at 10:00 AM

Function Stack:
  1. Query Records (users)
     Filter:
       subscribed = true
  
  2. Query Record (newsletters)
     Order: created_at DESC
     Limit: 1
  
  3. Transform List
     Input: users_query
     Map: { email: item.email, name: item.name }
  
  4. Call Function: send_adsmedia_batch
     recipients: transformed_list
     subject: newsletter.subject
     html: newsletter.html
     from_name: "Newsletter Team"
```

## Database Tables

### email_log

```yaml
Table: email_log
Fields:
  - id (autoincrement)
  - to (text)
  - subject (text)
  - message_id (text)
  - status (text, default: "sent")
  - sent_at (timestamp)
  - user_id (integer, link to users)
```

### email_templates

```yaml
Table: email_templates
Fields:
  - id (autoincrement)
  - name (text)
  - subject (text)
  - html (text)
  - variables (json)
  - created_at (timestamp)
```

## Utility Functions

### Build HTML from Template

```yaml
Function: build_email_html
Inputs:
  - template_name (text)
  - variables (object)

Function Stack:
  1. Query Record (email_templates)
     Filter: name = var:template_name
  
  2. Set Variable: html = template.html
  
  3. For Each Loop
     Collection: object_keys(var:variables)
     
     Loop Stack:
       a. Set Variable: html
          Expression: replace(var:html, "{{" + item + "}}", variables[item])
  
  4. Return: var:html
```

### Validate Email

```yaml
Function: validate_email
Inputs:
  - email (text)

Function Stack:
  1. Set Variable: is_valid
     Expression: regex_match(var:email, "^[^@]+@[^@]+\.[^@]+$")
  
  2. Return: var:is_valid
```

## Error Handling

```yaml
Function Stack with Error Handling:
  1. Try:
       a. External API Request...
       b. If api_response.success == false:
            - Throw Error: api_response.error.message
  
  2. Catch:
       a. Create Record (error_log)
          error: error.message
          function: "send_email"
          timestamp: now()
       b. Return:
          success: false
          error: error.message
```

## Best Practices

1. **API Key Security** - Store in environment variables
2. **Logging** - Track all sent emails
3. **Validation** - Validate inputs before API calls
4. **Templates** - Store templates in database
5. **Rate Limiting** - Use delays in loops

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Xano](https://www.xano.com)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

