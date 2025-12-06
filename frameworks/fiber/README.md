# ADSMedia Fiber (Go) Integration

Send emails via ADSMedia API from Fiber applications.

## Installation

```bash
go get github.com/gofiber/fiber/v2
```

## Setup

```go
package main

import (
    "os"
    "github.com/gofiber/fiber/v2"
)

func main() {
    app := fiber.New()
    
    // Add middleware
    app.Use(ADSMediaMiddleware(os.Getenv("ADSMEDIA_API_KEY")))
    
    // Register email routes
    RegisterEmailRoutes(app)
    
    app.Listen(":3000")
}
```

## Usage

### In Handlers

```go
app.Post("/send-welcome", func(c *fiber.Ctx) error {
    client := GetADSMedia(c)
    
    result, err := client.Send(SendEmailRequest{
        To:      "user@example.com",
        ToName:  "User",
        Subject: "Welcome!",
        HTML:    "<h1>Hello!</h1>",
    })
    
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    
    return c.JSON(fiber.Map{"message_id": result.Data["message_id"]})
})
```

### Batch Sending

```go
result, err := client.SendBatch(BatchEmailRequest{
    Recipients: []BatchRecipient{
        {Email: "user1@example.com", Name: "User 1"},
        {Email: "user2@example.com", Name: "User 2"},
    },
    Subject: "Hello %%First Name%%!",
    HTML:    "<h1>Hi %%First Name%%!</h1>",
})
```

### Check Suppression

```go
result, err := client.CheckSuppression("user@example.com")
suppressed := result.Data["suppressed"].(bool)
```

## Routes

- `POST /email/send` - Send single email
- `POST /email/batch` - Send batch emails
- `GET /email/check?email=...` - Check suppression
- `GET /email/ping` - Test connection

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Fiber](https://gofiber.io)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

