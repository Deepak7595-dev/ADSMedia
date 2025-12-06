# KeystoneJS Plugin - ADSMedia Email

Send emails via ADSMedia API from KeystoneJS.

## Installation

```bash
npm install @adsmedia/keystone-plugin
```

## Usage

### Basic Client

```typescript
import { createADSMediaClient } from '@adsmedia/keystone-plugin';

const adsmedia = createADSMediaClient({
  apiKey: process.env.ADSMEDIA_API_KEY!,
  defaultFromName: 'My App',
});

// Send email
await adsmedia.send({
  to: 'user@example.com',
  subject: 'Hello!',
  html: '<h1>Welcome!</h1>',
});
```

### With Hooks

```typescript
import { list } from '@keystone-6/core';
import { withADSMedia } from '@adsmedia/keystone-plugin';

const { client } = withADSMedia({
  apiKey: process.env.ADSMEDIA_API_KEY!,
});

export const User = list({
  fields: {
    name: text(),
    email: text(),
  },
  hooks: {
    afterOperation: async ({ operation, item }) => {
      if (operation === 'create') {
        await client.send({
          to: item.email,
          subject: 'Welcome!',
          html: `<h1>Hello ${item.name}!</h1>`,
        });
      }
    },
  },
});
```

### Batch Sending

```typescript
await adsmedia.sendBatch({
  recipients: [
    { email: 'user1@example.com', name: 'User 1' },
    { email: 'user2@example.com', name: 'User 2' },
  ],
  subject: 'Hello %%First Name%%!',
  html: '<h1>Hi %%First Name%%!</h1>',
});
```

### Check Suppression

```typescript
const result = await adsmedia.checkSuppression('user@example.com');
if (result.suppressed) {
  console.log('Suppressed:', result.reason);
}
```

## API

### createADSMediaClient(config)

- `apiKey` (required): ADSMedia API key
- `defaultFromName` (optional): Default sender name

### Methods

- `send(options)` - Send single email
- `sendBatch(options)` - Send batch emails
- `checkSuppression(email)` - Check if email is suppressed
- `ping()` - Test API connection
- `getUsage()` - Get usage stats

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [KeystoneJS](https://keystonejs.com)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

