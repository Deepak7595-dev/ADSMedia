# @adsmedia/sdk

Official JavaScript/TypeScript SDK for ADSMedia Email API.

## Installation

```bash
npm install @adsmedia/sdk
# or
yarn add @adsmedia/sdk
# or
pnpm add @adsmedia/sdk
```

## Quick Start

```typescript
import ADSMedia from '@adsmedia/sdk';

const client = new ADSMedia({
  apiKey: 'your-api-key'
});

// Send a single email
const result = await client.send({
  to: 'recipient@example.com',
  subject: 'Hello!',
  html: '<h1>Welcome!</h1>',
});

console.log(`Email sent! Message ID: ${result.messageId}`);
```

## Features

- ✅ Full TypeScript support
- ✅ Tree-shakeable ESM and CommonJS builds
- ✅ Zero dependencies
- ✅ Works in Node.js 16+
- ✅ Comprehensive API coverage

## Usage Examples

### Send Single Email (Transactional)

```typescript
const result = await client.send({
  to: 'user@example.com',
  toName: 'John Doe',
  subject: 'Welcome to our service!',
  html: '<h1>Hello John!</h1><p>Thanks for signing up.</p>',
  text: 'Hello John! Thanks for signing up.',
  fromName: 'Support Team',
  replyTo: 'support@yourcompany.com',
});
```

### Send Batch Emails (Marketing)

```typescript
const result = await client.sendBatch({
  recipients: [
    { email: 'user1@example.com', name: 'User 1', firstName: 'User' },
    { email: 'user2@example.com', name: 'User 2', firstName: 'User' },
  ],
  subject: 'Hello %%First Name%%!',
  html: '<h1>Hi %%First Name%%!</h1><p>Check out our latest offers.</p>',
  preheader: 'Exclusive deals inside',
  fromName: 'Marketing Team',
});

console.log(`Queued ${result.queued} emails. Task ID: ${result.taskId}`);
```

### Campaign Management

```typescript
// Create a campaign
const campaign = await client.createCampaign({
  name: 'Newsletter Q1 2025',
  subject: 'Monthly Update',
  html: '<h1>Newsletter</h1><p>Latest news...</p>',
  preheader: 'Your monthly update is here',
});

// Get all campaigns
const campaigns = await client.getCampaigns();

// Update a campaign
await client.updateCampaign(campaign.id, {
  subject: 'Updated Subject',
});

// Delete a campaign
await client.deleteCampaign(campaign.id);
```

### Contact Lists

```typescript
// Create a list
const list = await client.createList({
  name: 'Newsletter Subscribers',
  type: 1, // 1 = email
});

// Add contacts
await client.addContacts(list.id, [
  { email: 'john@example.com', firstName: 'John', lastName: 'Doe' },
  { email: 'jane@example.com', firstName: 'Jane', lastName: 'Smith' },
]);

// Get contacts
const contacts = await client.getContacts(list.id, 100, 0);

// Remove contacts
await client.removeContacts(list.id, ['john@example.com']);
```

### Schedule Sending

```typescript
// Create a schedule
const schedule = await client.createSchedule({
  campaignId: 45,
  listId: 123,
  serverId: 1,
  senderName: 'John from Company',
  schedule: '2025-12-15 10:00:00',
});

// Pause/Resume/Stop
await client.pauseSchedule(schedule.id);
await client.resumeSchedule(schedule.id);
await client.stopSchedule(schedule.id);
```

### Statistics

```typescript
// Get overview stats
const overview = await client.getOverviewStats();
console.log(`Total sent: ${overview.sent}, Opens: ${overview.opens}`);

// Get campaign-specific stats
const stats = await client.getCampaignStats(taskId);

// Get geographic stats
const countries = await client.getCountryStats(taskId);

// Get provider breakdown
const providers = await client.getProviderStats(taskId);

// Get bounce details
const bounces = await client.getBounceDetails(taskId);

// Get events
const opens = await client.getEvents(taskId, 'open', 100, 0);
```

### Domain Verification

```typescript
const verification = await client.verifyDomain(serverId);
console.log('SPF valid:', verification.spf.valid);
console.log('DKIM valid:', verification.dkim.valid);
console.log('DMARC valid:', verification.dmarc.valid);
```

### Suppression Check

```typescript
const result = await client.checkSuppression('user@example.com');
if (result.suppressed) {
  console.log(`Email is suppressed: ${result.reason}`);
}
```

## Configuration

```typescript
const client = new ADSMedia({
  apiKey: 'your-api-key',     // Required
  baseUrl: 'https://api.adsmedia.live/v1', // Optional (default)
  timeout: 30000,             // Optional: request timeout in ms (default: 30000)
});
```

## Error Handling

```typescript
import ADSMedia, { ADSMediaError } from '@adsmedia/sdk';

try {
  await client.send({ /* ... */ });
} catch (error) {
  if (error instanceof ADSMediaError) {
    console.error(`API Error: ${error.message}`);
    console.error(`Status Code: ${error.statusCode}`);
  } else {
    throw error;
  }
}
```

## Personalization Placeholders

Use these placeholders in your email content:

| Placeholder | Description |
|-------------|-------------|
| `%%First Name%%` | Recipient's first name |
| `%%Last Name%%` | Recipient's last name |
| `%%emailaddress%%` | Recipient's email address |
| `%%Sender Name%%` | Sender display name |
| `%%unsubscribelink%%` | Unsubscribe URL |
| `%%webversion%%` | View in browser link |

## TypeScript

The SDK is written in TypeScript and provides full type definitions:

```typescript
import ADSMedia, {
  SendEmailOptions,
  SendBatchOptions,
  Campaign,
  ContactList,
  Schedule,
  Stats,
  ADSMediaError,
} from '@adsmedia/sdk';
```

## Rate Limits

- 100 requests per minute per API key
- HTTP 429 returned when exceeded

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [GitHub Repository](https://github.com/ADSMedia-ai/ADSMedia)
- [Report Issues](https://github.com/ADSMedia-ai/ADSMedia/issues)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

