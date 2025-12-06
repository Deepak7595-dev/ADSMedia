# Netlify Plugin - ADSMedia Email Notifications

Send deployment notifications via ADSMedia Email API.

## Features

- ✅ Email on successful deploy
- ❌ Email on failed deploy
- 📧 Customizable subject and sender
- 📊 Deploy details (site, branch, commit)

## Installation

### File-based (recommended)

1. Copy `netlify-plugin-adsmedia` to your project
2. Add to `netlify.toml`:

```toml
[[plugins]]
  package = "./netlify-plugin-adsmedia"

  [plugins.inputs]
    to = "team@example.com"
```

### npm (when published)

```bash
npm install netlify-plugin-adsmedia
```

## Configuration

### Environment Variables

Add to Netlify dashboard → Site settings → Environment variables:

```
ADSMEDIA_API_KEY=your-api-key
```

### Plugin Inputs

```toml
[[plugins]]
  package = "./netlify-plugin-adsmedia"

  [plugins.inputs]
    # Required
    to = "team@example.com"
    
    # Optional
    subject_prefix = "✅ Deploy Success"
    subject_prefix_error = "❌ Deploy Failed"
    from_name = "Netlify Deploy"
    on_success = true
    on_error = true
```

## Email Content

### Success Email

- Site name
- Deploy URL (clickable)
- Branch
- Commit (short SHA)
- Context (production/preview)

### Error Email

- Site name
- Branch
- Commit
- Context
- Error message

## Multiple Recipients

For multiple recipients, use comma-separated emails:

```toml
[plugins.inputs]
  to = "dev@example.com,ops@example.com"
```

Or create a mailing list in ADSMedia.

## Example netlify.toml

```toml
[build]
  publish = "dist"
  command = "npm run build"

[[plugins]]
  package = "./netlify-plugin-adsmedia"

  [plugins.inputs]
    to = "deploy-notifications@example.com"
    from_name = "My Site Deploy"
    on_success = true
    on_error = true
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Netlify Plugins](https://docs.netlify.com/integrations/build-plugins)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

