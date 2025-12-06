# ADSMedia ASP.NET Core Integration

Send emails via ADSMedia API from ASP.NET Core applications.

## Setup

### 1. Add Files

Copy `ADSMediaClient.cs`, `ADSMediaExtensions.cs`, and optionally `ADSMediaController.cs` to your project.

### 2. Configure

In `appsettings.json`:

```json
{
  "ADSMedia": {
    "ApiKey": "your-api-key",
    "FromName": "My App"
  }
}
```

Or set environment variable:

```bash
export ADSMEDIA_API_KEY=your-api-key
```

### 3. Register in DI

In `Program.cs`:

```csharp
builder.Services.AddADSMedia(builder.Configuration);
```

## Usage

### Inject Client

```csharp
public class EmailService
{
    private readonly ADSMediaClient _client;

    public EmailService(ADSMediaClient client)
    {
        _client = client;
    }

    public async Task SendWelcome(string email, string name)
    {
        var result = await _client.SendAsync(new SendEmailRequest
        {
            To = email,
            ToName = name,
            Subject = "Welcome!",
            Html = $"<h1>Hello {name}!</h1>"
        });

        if (result.Success)
        {
            Console.WriteLine($"Message ID: {result.Data?.MessageId}");
        }
    }
}
```

### Batch Sending

```csharp
var result = await _client.SendBatchAsync(new BatchEmailRequest
{
    Recipients = new List<Recipient>
    {
        new Recipient { Email = "user1@example.com", Name = "User 1" },
        new Recipient { Email = "user2@example.com", Name = "User 2" }
    },
    Subject = "Hello %%First Name%%!",
    Html = "<h1>Hi %%First Name%%!</h1>"
});
```

### Check Suppression

```csharp
var result = await _client.CheckSuppressionAsync("user@example.com");
if (result.Data?.Suppressed == true)
{
    Console.WriteLine("Email is suppressed");
}
```

## API Endpoints

If you include `ADSMediaController.cs`:

- `POST /api/email/send` - Send single email
- `POST /api/email/batch` - Send batch emails
- `GET /api/email/check?email=...` - Check suppression
- `GET /api/email/ping` - Test connection

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [ASP.NET Core](https://docs.microsoft.com/aspnet/core)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

