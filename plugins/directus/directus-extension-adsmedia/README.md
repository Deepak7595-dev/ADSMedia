# Directus Extension - ADSMedia Email

Send emails via ADSMedia API from Directus.

## Installation

1. Copy to extensions folder:
   ```
   extensions/endpoints/adsmedia/
   ```

2. Set environment variable:
   ```
   ADSMEDIA_API_KEY=your-api-key
   ```

3. Restart Directus

## API Endpoints

All endpoints are available at `/adsmedia/...`

### Send Email
```
POST /adsmedia/send
{
  "to": "user@example.com",
  "subject": "Hello!",
  "html": "<h1>Welcome!</h1>"
}
```

### Send Batch
```
POST /adsmedia/send/batch
{
  "recipients": [
    { "email": "user1@example.com", "name": "User 1" },
    { "email": "user2@example.com", "name": "User 2" }
  ],
  "subject": "Hello %%First Name%%!",
  "html": "<h1>Hi %%First Name%%!</h1>"
}
```

### Check Suppression
```
GET /adsmedia/check?email=user@example.com
```

### Test Connection
```
GET /adsmedia/ping
```

### Get Usage
```
GET /adsmedia/usage
```

## Usage in Flows

1. Create a Flow with HTTP Request action
2. Set URL to `{{$env.PUBLIC_URL}}/adsmedia/send`
3. Configure payload with email data

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Directus Extensions](https://docs.directus.io/extensions)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

