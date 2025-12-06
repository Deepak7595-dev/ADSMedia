# ADSMedia Azure Functions

Serverless email API on Azure Functions.

## Deployment

1. Create Function App
2. Set `ADSMEDIA_API_KEY` in Application Settings
3. Deploy functions

### Using Azure CLI

```bash
func azure functionapp publish <app-name>
```

## Functions

### SendEmail

```
POST /api/send
{
  "to": "user@example.com",
  "subject": "Hello!",
  "html": "<h1>Welcome!</h1>"
}
```

## Usage

```javascript
const response = await fetch('https://<app>.azurewebsites.net/api/send', {
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
- [Azure Functions](https://azure.microsoft.com/en-us/products/functions)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

