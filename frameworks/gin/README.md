# ADSMedia Gin (Go) Integration

Send emails via ADSMedia API from Gin applications.

## Installation

```bash
go get github.com/gin-gonic/gin
```

## Setup

```go
package main

import (
    "os"
    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()
    
    // Add middleware
    r.Use(ADSMediaMiddleware(os.Getenv("ADSMEDIA_API_KEY")))
    
    // Register email routes
    email := r.Group("/email")
    RegisterEmailRoutes(email)
    
    r.Run(":8080")
}
```

## Usage

### In Handlers

```go
func SendWelcome(c *gin.Context) {
    client := GetADSMedia(c)
    
    result, err := client.Send(SendEmailRequest{
        To:      "user@example.com",
        ToName:  "User",
        Subject: "Welcome!",
        HTML:    "<h1>Hello!</h1>",
    })
    
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(200, gin.H{"message_id": result.Data["message_id"]})
}
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
- [Gin](https://gin-gonic.com)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

