# ADSMedia FastAPI Integration

Send emails via ADSMedia API from FastAPI applications.

## Installation

```bash
pip install fastapi requests uvicorn
```

## Usage

### As Dependency

```python
from fastapi import FastAPI, Depends
from adsmedia_middleware import ADSMediaClient, get_adsmedia_client, EmailRequest

app = FastAPI()

@app.post("/send-welcome")
async def send_welcome(
    user_email: str,
    user_name: str,
    client: ADSMediaClient = Depends(get_adsmedia_client)
):
    return client.send(EmailRequest(
        to=user_email,
        to_name=user_name,
        subject="Welcome!",
        html=f"<h1>Hello {user_name}!</h1>",
    ))
```

### As Router

```python
from fastapi import FastAPI
from adsmedia_middleware import create_email_router

app = FastAPI()
app.include_router(create_email_router())

# Routes available:
# POST /email/send
# POST /email/send/batch
# GET  /email/check?email=user@example.com
# GET  /email/ping
# GET  /email/usage
```

### Direct Client

```python
from adsmedia_middleware import ADSMediaClient

client = ADSMediaClient("your-api-key")

# Send email
result = client.send(EmailRequest(
    to="user@example.com",
    subject="Hello!",
    html="<h1>Welcome!</h1>",
))
print(result["message_id"])

# Check suppression
result = client.check_suppression("user@example.com")
print(result["suppressed"])
```

## Configuration

Set environment variable:

```bash
export ADSMEDIA_API_KEY=your-api-key
```

## Run Example

```bash
python adsmedia_middleware.py
```

Then:

```bash
curl -X POST http://localhost:8000/email/send \
  -H "Content-Type: application/json" \
  -d '{"to": "user@example.com", "subject": "Hello!", "html": "<h1>Hi!</h1>"}'
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [FastAPI](https://fastapi.tiangolo.com)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

