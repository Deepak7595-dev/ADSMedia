# ADSMedia Windsurf MCP Integration

Use ADSMedia API directly from Windsurf IDE with AI assistance via Model Context Protocol.

## Overview

Windsurf IDE (by Codeium) supports the Model Context Protocol (MCP), which enables AI assistants to interact with external tools and APIs. This integration allows you to send emails, manage campaigns, and access all ADSMedia features through natural language.

## Setup

### 1. Configure MCP

Add to your Windsurf MCP configuration file (`~/.windsurf/mcp.json` or workspace settings):

```json
{
  "mcpServers": {
    "adsmedia": {
      "command": "npx",
      "args": ["-y", "tsx", "/path/to/MCP/cursor/src/index.ts"],
      "env": {
        "ADSMEDIA_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 2. Alternative: Use Prebuilt Package

If you've published the MCP server to npm:

```json
{
  "mcpServers": {
    "adsmedia": {
      "command": "npx",
      "args": ["-y", "@adsmedia/mcp-server"],
      "env": {
        "ADSMEDIA_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 3. Restart Windsurf

After configuring, restart Windsurf IDE to load the MCP server.

## Available Tools

The ADSMedia MCP server provides the following tools:

### Email Operations
- `adsmedia_send_email` - Send a single transactional email
- `adsmedia_send_batch` - Send batch marketing emails (up to 1000)

### Campaign Management
- `adsmedia_create_campaign` - Create a new email campaign
- `adsmedia_get_campaign` - Get campaign details
- `adsmedia_list_campaigns` - List all campaigns
- `adsmedia_update_campaign` - Update campaign settings
- `adsmedia_delete_campaign` - Delete a campaign

### List Management
- `adsmedia_create_list` - Create a contact list
- `adsmedia_get_list` - Get list details
- `adsmedia_list_lists` - List all contact lists
- `adsmedia_add_contacts` - Add contacts to a list
- `adsmedia_remove_contacts` - Remove contacts from a list
- `adsmedia_delete_list` - Delete a list
- `adsmedia_split_list` - Split large lists

### Scheduling
- `adsmedia_create_schedule` - Schedule an email campaign
- `adsmedia_list_schedules` - List scheduled tasks
- `adsmedia_pause_schedule` - Pause a scheduled task
- `adsmedia_resume_schedule` - Resume a paused task
- `adsmedia_stop_schedule` - Stop a scheduled task
- `adsmedia_update_schedule` - Update schedule settings

### Statistics
- `adsmedia_get_stats_overview` - Get overall statistics
- `adsmedia_get_campaign_stats` - Get campaign-specific stats
- `adsmedia_get_hourly_stats` - Get hourly breakdown
- `adsmedia_get_daily_stats` - Get daily breakdown
- `adsmedia_get_country_stats` - Get stats by country
- `adsmedia_get_provider_stats` - Get stats by email provider
- `adsmedia_get_bounce_stats` - Get bounce statistics

### Account & Utilities
- `adsmedia_get_account` - Get account information
- `adsmedia_list_servers` - List available sending servers
- `adsmedia_check_suppression` - Check if email is suppressed
- `adsmedia_ping` - Test API connection

## Usage Examples

### Send Email via Chat

```
You: Send a welcome email to john@example.com with subject "Welcome!" and content saying hello

AI: I'll send that email for you using ADSMedia.
[Uses adsmedia_send_email tool]
Email sent successfully! Message ID: api-123456789-abcdef
```

### Check Statistics

```
You: What are my email statistics for today?

AI: Let me check your ADSMedia statistics.
[Uses adsmedia_get_stats_overview tool]
Here's your email statistics:
- Total Sent: 1,234
- Opens: 567 (45.9%)
- Clicks: 234 (18.9%)
- Bounces: 12 (0.9%)
```

### Create Campaign

```
You: Create a new campaign called "Summer Sale" with subject "Hot Summer Deals!"

AI: I'll create that campaign for you.
[Uses adsmedia_create_campaign tool]
Campaign created! ID: 123
```

### Manage Lists

```
You: Add these contacts to my newsletter list: alice@example.com, bob@example.com

AI: Adding contacts to your newsletter list.
[Uses adsmedia_add_contacts tool]
Added 2 contacts to the list successfully.
```

## Natural Language Examples

The AI understands various ways to express email tasks:

- "Send an email to..." / "Email this to..."
- "Create a campaign for..." / "Set up an email campaign..."
- "Schedule this email for tomorrow at 9am"
- "Check if user@example.com is on the suppression list"
- "Show me my email stats" / "How are my campaigns performing?"
- "Add these emails to my mailing list"
- "What's my bounce rate?"

## Troubleshooting

### Server Not Loading

1. Check the path to the MCP server is correct
2. Verify Node.js and npx are installed
3. Check the API key is set correctly
4. Look at Windsurf logs for errors

### API Errors

1. Verify API key is valid
2. Check your ADSMedia account status
3. Ensure you have sufficient credits
4. Check rate limits

### Connection Issues

```
You: Test my ADSMedia connection

AI: [Uses adsmedia_ping tool]
Connection successful! API is responding.
```

## Shared Configuration with Cursor

This MCP server uses the same codebase as the Cursor IDE integration. You can share the same server installation between both IDEs.

## Links

- [ADSMedia API Documentation](https://www.adsmedia.ai/api-docs)
- [Windsurf IDE](https://codeium.com/windsurf)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Cursor MCP Integration](../cursor/)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

