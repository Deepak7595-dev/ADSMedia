# ADSMedia PHP SDK

Official PHP SDK for ADSMedia Email API.

## Installation

```bash
composer require adsmedia/sdk
```

## Quick Start

```php
<?php

require 'vendor/autoload.php';

use ADSMedia\Client;

$client = new Client('your-api-key');

// Send email
$result = $client->send([
    'to' => 'user@example.com',
    'subject' => 'Hello!',
    'html' => '<h1>Welcome!</h1>',
]);

echo "Message ID: " . $result['message_id'];
```

## Send Batch

```php
$result = $client->sendBatch([
    'recipients' => [
        ['email' => 'user1@example.com', 'name' => 'User 1'],
        ['email' => 'user2@example.com', 'name' => 'User 2'],
    ],
    'subject' => 'Hello %%First Name%%!',
    'html' => '<h1>Hi %%First Name%%!</h1>',
]);

echo "Task ID: " . $result['task_id'];
```

## Campaigns

```php
// List campaigns
$campaigns = $client->getCampaigns();

// Create campaign
$campaign = $client->createCampaign([
    'name' => 'Newsletter Q1',
    'subject' => 'Monthly Update',
    'html' => '<h1>Newsletter</h1>',
]);

// Update campaign
$client->updateCampaign($campaignId, [
    'subject' => 'New Subject',
]);

// Delete campaign
$client->deleteCampaign($campaignId);
```

## Lists

```php
// Get lists
$lists = $client->getLists();

// Create list
$list = $client->createList('Newsletter Subscribers');

// Add contacts
$client->addContacts($listId, [
    ['email' => 'john@example.com', 'firstName' => 'John'],
    ['email' => 'jane@example.com', 'firstName' => 'Jane'],
]);

// Get contacts
$contacts = $client->getContacts($listId, 100, 0);

// Split list
$result = $client->splitList($listId, 35000);
```

## Schedules

```php
// Create schedule
$schedule = $client->createSchedule([
    'campaign_id' => 45,
    'list_id' => 123,
    'server_id' => 1,
    'sender_name' => 'John from Company',
    'schedule' => '2025-12-15 10:00:00',
]);

// Pause/Resume/Stop
$client->pauseSchedule($scheduleId);
$client->resumeSchedule($scheduleId);
$client->stopSchedule($scheduleId);
```

## Check Suppression

```php
$result = $client->checkSuppression('user@example.com');

if ($result['suppressed']) {
    echo "Suppressed: " . $result['reason'];
} else {
    echo "OK to send";
}
```

## API Reference

### Email
- `send(array $params)` - Send single email
- `sendBatch(array $params)` - Send batch emails
- `getStatus(string $messageId)` - Check send status

### Campaigns
- `getCampaigns(int $limit, int $offset)`
- `getCampaign(int $id)`
- `createCampaign(array $params)`
- `updateCampaign(int $id, array $params)`
- `deleteCampaign(int $id)`

### Lists
- `getLists()`
- `createList(string $name, int $type)`
- `getContacts(int $listId, int $limit, int $offset)`
- `addContacts(int $listId, array $contacts)`
- `splitList(int $id, int $maxSize)`

### Schedules
- `getSchedules(string $status)`
- `createSchedule(array $params)`
- `updateSchedule(int $id, array $params)`
- `pauseSchedule(int $id)`
- `resumeSchedule(int $id)`
- `stopSchedule(int $id)`

### Other
- `ping()` - Test connection
- `getServers()` - List servers
- `verifyDomain(int $serverId)` - Verify domain DNS
- `checkSuppression(string $email)` - Check suppression
- `getStats()` - Overview stats
- `getAccount()` - Account info
- `getUsage()` - Usage stats

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

