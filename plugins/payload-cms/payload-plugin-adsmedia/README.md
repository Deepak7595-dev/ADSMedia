# Payload CMS Plugin - ADSMedia Email

Send emails via ADSMedia API from Payload CMS.

## Installation

1. Install:
   ```bash
   npm install payload-plugin-adsmedia
   ```

2. Add to `payload.config.ts`:
   ```typescript
   import { buildConfig } from 'payload/config';
   import { adsmediaPlugin } from 'payload-plugin-adsmedia';

   export default buildConfig({
     plugins: [
       adsmediaPlugin({
         apiKey: process.env.ADSMEDIA_API_KEY,
         defaultFromName: 'My App',
       }),
     ],
   });
   ```

## Usage

### In Collections/Hooks

```typescript
import { getADSMediaService } from 'payload-plugin-adsmedia';

const afterChange: CollectionAfterChangeHook = async ({ doc }) => {
  const adsmedia = getADSMediaService();
  
  await adsmedia.send({
    to: doc.email,
    subject: 'Welcome!',
    html: '<h1>Thanks for signing up!</h1>',
  });
  
  return doc;
};
```

### Send Batch

```typescript
const adsmedia = getADSMediaService();

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
  console.log('Email is suppressed:', result.reason);
}
```

## API Endpoints

The plugin adds these endpoints:

```
POST /api/adsmedia/send
GET  /api/adsmedia/check?email=user@example.com
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Payload CMS](https://payloadcms.com)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

