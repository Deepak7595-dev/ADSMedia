# ADSMedia Pipedream Components

Official Pipedream components for ADSMedia Email API.

## Overview

These components allow you to integrate ADSMedia email sending into your Pipedream workflows.

## Available Actions

| Action | Description |
|--------|-------------|
| **Send Email** | Send a single transactional email |
| **Send Batch** | Send up to 1000 marketing emails |
| **Create Campaign** | Create a new email campaign |
| **Add Contacts** | Add contacts to a list |
| **Get Stats** | Get campaign statistics |

## Setup

1. In Pipedream, go to **Accounts** → **Connect an app**
2. Search for "ADSMedia"
3. Enter your API key from [adsmedia.ai](https://www.adsmedia.ai)

## Usage Examples

### Send Welcome Email

```javascript
// In a Pipedream workflow
const result = await this.adsmedia.sendEmail($, {
  to: steps.trigger.event.email,
  subject: "Welcome!",
  html: "<h1>Welcome to our service!</h1>",
});
```

### Send Marketing Batch

```javascript
const result = await this.adsmedia.sendBatch($, {
  recipients: [
    { email: "user1@example.com", name: "John" },
    { email: "user2@example.com", name: "Jane" },
  ],
  subject: "Hello %%First Name%%!",
  html: "<h1>Hi %%First Name%%!</h1><p>Check out our offers.</p>",
});
```

### Add Contacts to List

```javascript
await this.adsmedia.addContacts($, listId, [
  { email: "john@example.com", firstName: "John", lastName: "Doe" },
  { email: "jane@example.com", firstName: "Jane" },
]);
```

## Available Methods

The `adsmedia` app object provides these methods:

### Email
- `sendEmail($, opts)` - Send single email
- `sendBatch($, opts)` - Send batch emails
- `getEmailStatus($, { messageId, sendId })` - Get email status

### Campaigns
- `getCampaigns($, limit)` - List campaigns
- `getCampaign($, id)` - Get campaign details
- `createCampaign($, opts)` - Create campaign

### Lists & Contacts
- `getLists($)` - List all lists
- `getList($, id)` - Get list details
- `createList($, opts)` - Create list
- `addContacts($, listId, contacts)` - Add contacts
- `splitList($, listId, maxSize)` - Split large list

### Schedules
- `getSchedules($, status)` - List schedules
- `createSchedule($, opts)` - Create schedule
- `updateSchedule($, id, opts)` - Update schedule
- `pauseSchedule($, id)` - Pause schedule
- `resumeSchedule($, id)` - Resume schedule

### Statistics
- `getOverviewStats($)` - Overview stats
- `getCampaignStats($, taskId)` - Campaign stats
- `getEvents($, taskId, type, limit)` - Get events

### Other
- `ping($)` - Test connection
- `getServers($)` - List servers
- `verifyDomain($, serverId)` - Verify domain DNS
- `checkSuppression($, email)` - Check if email suppressed
- `getAccount($)` - Account info
- `getUsage($)` - Usage stats

## Personalization Placeholders

Use in subject and HTML:

| Placeholder | Description |
|-------------|-------------|
| `%%First Name%%` | Recipient's first name |
| `%%Last Name%%` | Recipient's last name |
| `%%emailaddress%%` | Recipient's email |
| `%%unsubscribelink%%` | Unsubscribe URL |

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Pipedream](https://pipedream.com)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

