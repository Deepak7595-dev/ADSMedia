# ADSMedia Dify Tool Provider

Send emails via ADSMedia API from Dify AI workflows and agents.

## Installation

1. Copy the `adsmedia` folder to your Dify plugins directory:
   ```
   api/core/tools/provider/builtin/adsmedia/
   ```

2. Restart Dify

3. In Dify, go to **Tools** → **Add Tool**

4. Select **ADSMedia** and enter your API key

## Available Tools

### Send Email

Send transactional emails.

**Parameters:**
- `to` (required): Recipient email address
- `subject` (required): Email subject line
- `html` (required): HTML content
- `to_name` (optional): Recipient name
- `from_name` (optional): Sender display name

### Check Suppression

Check if an email is suppressed before sending.

**Parameters:**
- `email` (required): Email address to check

## Usage in Workflows

1. Create a new workflow
2. Add "ADSMedia" tool node
3. Select action (Send Email / Check Suppression)
4. Configure parameters
5. Connect to other nodes

## Usage in Agents

Add ADSMedia tools to your agent's toolset. The agent can then:

- Send emails on request
- Check email deliverability
- Handle email notifications in conversations

## Example Prompts

```
Send a welcome email to john@example.com
```

```
Check if jane@example.com can receive emails, then send her a confirmation
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Dify Documentation](https://docs.dify.ai)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

