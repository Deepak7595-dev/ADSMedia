# ADSMedia MCP Server

MCP (Model Context Protocol) server for integrating [ADSMedia Email API](https://www.adsmedia.ai/api-docs) with Cursor IDE.

## 🚀 Features

Full access to ADSMedia API via MCP:

### 📧 Email
- **Send emails** — transactional and marketing
- **Batch sending** — up to 1000 recipients with personalization
- **Delivery status** — track delivery

### 📑 Campaigns
- Create, edit, delete campaigns
- HTML templates with placeholders

### 📋 Lists & Contacts
- Manage subscriber lists
- Add/remove contacts
- Custom fields

### 📅 Schedules
- Create sending tasks
- Pause/resume/stop

### 🖥️ Servers
- View sending servers
- Status and limits

### 🌐 Domain Verification
- Check SPF, DKIM, DMARC, MX, PTR
- DNSSEC and TLSA validation

### 📊 Statistics
- Overview statistics
- By campaigns
- Hourly/daily breakdown
- Opens geography
- Bounces and providers

### ⚡ Events
- Opens, clicks, bounces, unsubscribes

### 🚫 Suppression
- Check blocked emails

### 👤 Account
- Account information
- Usage and limits
- API keys

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/ADSMedia-ai/ADSMedia.git
cd ADSMedia/MCP/cursor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Build the project

```bash
npm run build
```

---

## ⚙️ Cursor IDE Configuration

### Option 1: Global configuration

Open the global MCP config file:
- **Windows:** `%APPDATA%\Cursor\User\globalStorage\cursor.mcp\config.json`
- **macOS:** `~/Library/Application Support/Cursor/User/globalStorage/cursor.mcp/config.json`
- **Linux:** `~/.config/Cursor/User/globalStorage/cursor.mcp/config.json`

Add configuration:

```json
{
  "mcpServers": {
    "adsmedia": {
      "command": "node",
      "args": ["C:/path/to/ADSMedia/MCP/cursor/dist/index.js"],
      "env": {
        "ADSMEDIA_API_KEY": "your_api_key"
      }
    }
  }
}
```

### Option 2: Project configuration

Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "adsmedia": {
      "command": "node",
      "args": ["C:/path/to/ADSMedia/MCP/cursor/dist/index.js"],
      "env": {
        "ADSMEDIA_API_KEY": "your_api_key"
      }
    }
  }
}
```

> ⚠️ **Important:** Replace `C:/path/to/ADSMedia` with the actual path to the project folder.

---

## 🔑 Getting API Key

1. Sign up at [adsmedia.ai](https://www.adsmedia.ai)
2. Go to account settings
3. Copy your API key

---

## 🛠️ Available Tools

### Authentication
| Tool | Description |
|------|-------------|
| `adsmedia_ping` | Test API connection |

### Email
| Tool | Description |
|------|-------------|
| `adsmedia_send_email` | Send transactional email |
| `adsmedia_send_batch` | Send batch marketing emails |
| `adsmedia_send_status` | Get delivery status |

### Campaigns
| Tool | Description |
|------|-------------|
| `adsmedia_list_campaigns` | List campaigns |
| `adsmedia_get_campaign` | Get campaign by ID |
| `adsmedia_create_campaign` | Create campaign |
| `adsmedia_update_campaign` | Update campaign |
| `adsmedia_delete_campaign` | Delete campaign |

### Lists & Contacts
| Tool | Description |
|------|-------------|
| `adsmedia_list_lists` | List subscriber lists |
| `adsmedia_create_list` | Create list |
| `adsmedia_get_contacts` | Get contacts from list |
| `adsmedia_add_contacts` | Add contacts |
| `adsmedia_delete_contacts` | Delete contacts |

### Schedules
| Tool | Description |
|------|-------------|
| `adsmedia_list_schedules` | List tasks |
| `adsmedia_create_schedule` | Create task |
| `adsmedia_pause_schedule` | Pause task |
| `adsmedia_resume_schedule` | Resume task |
| `adsmedia_stop_schedule` | Stop task |

### Servers
| Tool | Description |
|------|-------------|
| `adsmedia_list_servers` | List servers |
| `adsmedia_get_server` | Get server info |

### Domain Verification
| Tool | Description |
|------|-------------|
| `adsmedia_verify_domain` | Verify DNS records |

### Statistics
| Tool | Description |
|------|-------------|
| `adsmedia_stats_overview` | Overview statistics |
| `adsmedia_stats_campaign` | Campaign statistics |
| `adsmedia_stats_hourly` | Hourly statistics |
| `adsmedia_stats_daily` | Daily statistics |
| `adsmedia_stats_countries` | Geography |
| `adsmedia_stats_bounces` | Bounces |
| `adsmedia_stats_providers` | By providers |

### Events
| Tool | Description |
|------|-------------|
| `adsmedia_get_events` | Get events |

### Suppressions
| Tool | Description |
|------|-------------|
| `adsmedia_check_suppression` | Check if email is blocked |

### Account
| Tool | Description |
|------|-------------|
| `adsmedia_get_account` | Account information |
| `adsmedia_get_usage` | Usage and limits |
| `adsmedia_get_api_keys` | Get API key |
| `adsmedia_regenerate_api_key` | Regenerate API key |

---

## 📝 Usage Examples

### Send email

```
Send an email to test@example.com with subject "Hello" and body "<h1>Hello!</h1>"
```

### Create campaign

```
Create a campaign "New Year Newsletter" with subject "Happy New Year!" and HTML content
```

### Get statistics

```
Show statistics for campaign ID 123
```

### Verify server

```
Check DNS records for server 15
```

---

## 🔗 Links

- [ADSMedia API Documentation](https://www.adsmedia.ai/api-docs)
- [ADSMedia Website](https://www.adsmedia.ai)
- [MCP Protocol](https://modelcontextprotocol.io)
- [Cursor IDE](https://cursor.com)

---

## 📄 License

MIT
