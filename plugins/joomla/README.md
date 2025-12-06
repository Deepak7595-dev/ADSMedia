# ADSMedia Joomla Extension

Send emails via ADSMedia API from Joomla CMS.

## Overview

This extension replaces Joomla's mail system with ADSMedia API for better deliverability.

## Installation

### Manual Installation

1. Download the extension package
2. Go to **Extensions** → **Manage** → **Install**
3. Upload the package
4. Enable the plugin

## Extension Structure

```
plg_system_adsmedia/
├── adsmedia.xml
├── adsmedia.php
├── language/
│   └── en-GB/
│       └── en-GB.plg_system_adsmedia.ini
└── forms/
    └── config.xml
```

## Files

### adsmedia.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<extension type="plugin" group="system" method="upgrade">
    <name>System - ADSMedia Email</name>
    <author>ADSMedia</author>
    <creationDate>2024</creationDate>
    <copyright>Copyright (C) ADSMedia. All rights reserved.</copyright>
    <license>MIT</license>
    <version>1.0.0</version>
    <description>PLG_SYSTEM_ADSMEDIA_DESC</description>
    
    <files>
        <filename plugin="adsmedia">adsmedia.php</filename>
    </files>
    
    <languages folder="language">
        <language tag="en-GB">en-GB/en-GB.plg_system_adsmedia.ini</language>
    </languages>
    
    <config>
        <fields name="params">
            <fieldset name="basic">
                <field
                    name="api_key"
                    type="text"
                    label="PLG_SYSTEM_ADSMEDIA_API_KEY"
                    description="PLG_SYSTEM_ADSMEDIA_API_KEY_DESC"
                    required="true"
                />
                <field
                    name="from_name"
                    type="text"
                    label="PLG_SYSTEM_ADSMEDIA_FROM_NAME"
                    description="PLG_SYSTEM_ADSMEDIA_FROM_NAME_DESC"
                    default="Joomla"
                />
                <field
                    name="enabled"
                    type="radio"
                    label="PLG_SYSTEM_ADSMEDIA_ENABLED"
                    default="1"
                >
                    <option value="0">JNO</option>
                    <option value="1">JYES</option>
                </field>
            </fieldset>
        </fields>
    </config>
</extension>
```

### adsmedia.php

```php
<?php
defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\CMS\Log\Log;

class PlgSystemAdsmedia extends CMSPlugin
{
    protected $autoloadLanguage = true;
    protected $apiKey;
    protected $fromName;
    protected $baseUrl = 'https://api.adsmedia.live/v1';

    public function __construct(&$subject, $config)
    {
        parent::__construct($subject, $config);
        
        $this->apiKey = $this->params->get('api_key', '');
        $this->fromName = $this->params->get('from_name', 'Joomla');
    }

    /**
     * Override mail sending
     */
    public function onMailerBeforeSend($args)
    {
        if (!$this->params->get('enabled', 1) || empty($this->apiKey)) {
            return true;
        }

        $mailer = $args[0];
        
        // Get recipients
        $recipients = array_keys($mailer->getAllRecipientAddresses());
        
        if (empty($recipients)) {
            return true;
        }

        // Get email data
        $subject = $mailer->Subject;
        $body = $mailer->Body;
        $isHtml = $mailer->ContentType === 'text/html';

        // Send via ADSMedia for each recipient
        foreach ($recipients as $to) {
            $data = [
                'to' => $to,
                'subject' => $subject,
                'html' => $isHtml ? $body : nl2br(htmlspecialchars($body)),
                'from_name' => $this->fromName,
            ];

            if (!$isHtml) {
                $data['text'] = $body;
            }

            $result = $this->sendViaAdsmedia($data);
            
            if (!$result['success']) {
                Log::add('ADSMedia send failed: ' . ($result['error'] ?? 'Unknown error'), Log::ERROR, 'adsmedia');
                return false;
            }
            
            Log::add('Email sent via ADSMedia to ' . $to . '. Message ID: ' . $result['data']['message_id'], Log::INFO, 'adsmedia');
        }

        // Prevent Joomla's default mail sending
        $mailer->clearAllRecipients();
        return true;
    }

    /**
     * Send email via ADSMedia API
     */
    protected function sendViaAdsmedia(array $data): array
    {
        $ch = curl_init($this->baseUrl . '/send');
        
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->apiKey,
                'Content-Type: application/json',
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return ['success' => false, 'error' => $error];
        }

        $result = json_decode($response, true);
        
        if ($httpCode >= 400 || !($result['success'] ?? false)) {
            return ['success' => false, 'error' => $result['error']['message'] ?? 'API error'];
        }

        return $result;
    }

    /**
     * Test connection on plugin save
     */
    public function onExtensionBeforeSave($context, $item, $isNew)
    {
        if ($context !== 'com_plugins.plugin' || $item->element !== 'adsmedia') {
            return true;
        }

        $params = json_decode($item->params, true);
        $apiKey = $params['api_key'] ?? '';

        if (empty($apiKey)) {
            return true;
        }

        // Test API connection
        $ch = curl_init($this->baseUrl . '/ping');
        curl_setopt_array($ch, [
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $apiKey,
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        $result = json_decode($response, true);
        
        if (!($result['success'] ?? false)) {
            Factory::getApplication()->enqueueMessage(
                'ADSMedia API connection failed. Please check your API key.',
                'warning'
            );
        } else {
            Factory::getApplication()->enqueueMessage(
                'ADSMedia API connection successful!',
                'success'
            );
        }

        return true;
    }
}
```

### language/en-GB/en-GB.plg_system_adsmedia.ini

```ini
PLG_SYSTEM_ADSMEDIA="System - ADSMedia Email"
PLG_SYSTEM_ADSMEDIA_DESC="Send all Joomla emails via ADSMedia API"

PLG_SYSTEM_ADSMEDIA_API_KEY="API Key"
PLG_SYSTEM_ADSMEDIA_API_KEY_DESC="Your ADSMedia API key"

PLG_SYSTEM_ADSMEDIA_FROM_NAME="From Name"
PLG_SYSTEM_ADSMEDIA_FROM_NAME_DESC="Default sender display name"

PLG_SYSTEM_ADSMEDIA_ENABLED="Enable ADSMedia"
PLG_SYSTEM_ADSMEDIA_ENABLED_DESC="Enable sending emails via ADSMedia"
```

## Configuration

1. Go to **Extensions** → **Plugins**
2. Find "System - ADSMedia Email"
3. Click to configure
4. Enter your API key
5. Set default from name
6. Enable and save

## Usage

Once configured, all Joomla emails will be sent via ADSMedia:

- User registration
- Password reset
- Contact form
- Custom component emails

## Logging

Emails are logged to Joomla's log system:

```
administrator/logs/adsmedia.php
```

## Troubleshooting

### Emails not sending?

1. Check API key is valid
2. Verify plugin is enabled
3. Check logs for errors

### Test the connection

Save the plugin - it will test the API connection automatically.

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Joomla](https://www.joomla.org)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

