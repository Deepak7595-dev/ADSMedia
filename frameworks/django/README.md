# ADSMedia Django Integration

Send emails via ADSMedia API from Django applications.

## Installation

```bash
pip install requests
```

## Setup

Add to `settings.py`:

```python
# Use as email backend
EMAIL_BACKEND = 'adsmedia.ADSMediaEmailBackend'
ADSMEDIA_API_KEY = 'your-api-key'
ADSMEDIA_FROM_NAME = 'My App'
```

Or set environment variable:

```bash
export ADSMEDIA_API_KEY=your-api-key
```

## Usage

### Email Backend (Django's send_mail)

```python
from django.core.mail import send_mail, EmailMultiAlternatives

# Simple
send_mail(
    'Subject',
    'Text content',
    'from@example.com',
    ['to@example.com'],
)

# HTML
msg = EmailMultiAlternatives('Subject', 'Text', 'from@example.com', ['to@example.com'])
msg.attach_alternative('<h1>Hello!</h1>', 'text/html')
msg.send()
```

### Direct Client

```python
from adsmedia import get_client, ADSMediaClient

# Using singleton
client = get_client()

# Or create instance
client = ADSMediaClient('your-api-key')

# Send email
result = client.send(
    to='user@example.com',
    subject='Hello!',
    html='<h1>Welcome!</h1>',
)
print(result['message_id'])

# Send batch
result = client.send_batch(
    recipients=[
        {'email': 'user1@example.com', 'name': 'User 1'},
        {'email': 'user2@example.com', 'name': 'User 2'},
    ],
    subject='Hello %%First Name%%!',
    html='<h1>Hi %%First Name%%!</h1>',
)
print(result['task_id'])

# Check suppression
result = client.check_suppression('user@example.com')
print(result['suppressed'])
```

### In Views

```python
from django.http import JsonResponse
from adsmedia import get_client

def send_welcome(request):
    client = get_client()
    result = client.send(
        to=request.POST['email'],
        subject='Welcome!',
        html='<h1>Hello!</h1>',
    )
    return JsonResponse({'message_id': result['message_id']})
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Django](https://www.djangoproject.com)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

