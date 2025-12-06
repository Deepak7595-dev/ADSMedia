# Strapi Plugin - ADSMedia Email

Send emails via ADSMedia API from Strapi.

## Installation

1. Copy `strapi-plugin-adsmedia` to `./src/plugins/adsmedia`

2. Enable in `config/plugins.js`:

```javascript
module.exports = {
  adsmedia: {
    enabled: true,
    config: {
      apiKey: process.env.ADSMEDIA_API_KEY,
      defaultFromName: 'My App',
    },
  },
};
```

3. Rebuild admin:
```bash
npm run build
npm run develop
```

## Usage

### In Controllers/Services

```javascript
// Send single email
await strapi.plugin('adsmedia').service('email').send({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Hello!</h1>',
});

// Send batch
await strapi.plugin('adsmedia').service('email').sendBatch({
  recipients: [
    { email: 'user1@example.com', name: 'User 1' },
    { email: 'user2@example.com', name: 'User 2' },
  ],
  subject: 'Hello %%First Name%%!',
  html: '<h1>Hi %%First Name%%!</h1>',
});

// Check suppression
const result = await strapi.plugin('adsmedia').service('email').checkSuppression('user@example.com');
```

### REST API Endpoints

```
POST /adsmedia/send
POST /adsmedia/send/batch
GET  /adsmedia/check?email=user@example.com
GET  /adsmedia/ping
GET  /adsmedia/usage
```

## Example: Send on User Registration

```javascript
// src/extensions/users-permissions/strapi-server.js
module.exports = (plugin) => {
  plugin.controllers.auth.callback = async (ctx) => {
    // ... original callback logic ...
    
    // Send welcome email
    await strapi.plugin('adsmedia').service('email').send({
      to: user.email,
      subject: 'Welcome to our platform!',
      html: `<h1>Welcome ${user.username}!</h1>`,
    });
  };
  
  return plugin;
};
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Strapi Plugins](https://docs.strapi.io/dev-docs/plugins)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

