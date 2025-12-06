# ADSMedia AWS Lambda

Serverless email API on AWS Lambda with API Gateway.

## Deployment

### Using Serverless Framework

1. Install Serverless:
   ```bash
   npm install -g serverless
   ```

2. Set API key:
   ```bash
   export ADSMEDIA_API_KEY=your-api-key
   ```

3. Deploy:
   ```bash
   serverless deploy
   ```

### Manual Deployment

1. Create Lambda functions
2. Set `ADSMEDIA_API_KEY` environment variable
3. Create API Gateway with routes

## Endpoints

### Send Email
```
POST /send
{
  "to": "user@example.com",
  "subject": "Hello!",
  "html": "<h1>Welcome!</h1>"
}
```

### Send Batch
```
POST /send/batch
{
  "recipients": [{"email": "...", "name": "..."}],
  "subject": "Hello %%First Name%%!",
  "html": "<h1>Hi!</h1>"
}
```

### Check Suppression
```
GET /check?email=user@example.com
```

### Ping
```
GET /ping
```

## Usage

```javascript
const response = await fetch('https://xxx.execute-api.us-east-1.amazonaws.com/dev/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Hello!',
    html: '<h1>Welcome!</h1>',
  }),
});

const result = await response.json();
console.log(result.data.message_id);
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Serverless Framework](https://www.serverless.com)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

