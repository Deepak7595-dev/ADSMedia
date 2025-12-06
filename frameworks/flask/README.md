# ADSMedia Flask Integration

Send emails via ADSMedia API from Flask applications.

## Installation

```bash
pip install flask requests
```

## Setup

```python
from flask import Flask
from adsmedia_flask import ADSMedia, create_email_blueprint

app = Flask(__name__)
app.config['ADSMEDIA_API_KEY'] = 'your-api-key'

adsmedia = ADSMedia(app)
app.register_blueprint(create_email_blueprint())
```

Or with factory pattern:

```python
adsmedia = ADSMedia()

def create_app():
    app = Flask(__name__)
    adsmedia.init_app(app)
    return app
```

## Usage

### In Routes

```python
from flask import g

@app.route('/send-welcome', methods=['POST'])
def send_welcome():
    result = g.adsmedia.send(
        to=request.json['email'],
        subject='Welcome!',
        html='<h1>Hello!</h1>',
    )
    return {'message_id': result['message_id']}
```

### Direct Client

```python
from adsmedia_flask import ADSMediaClient

client = ADSMediaClient('your-api-key')

result = client.send(
    to='user@example.com',
    subject='Hello!',
    html='<h1>Welcome!</h1>',
)
```

### Batch Sending

```python
result = g.adsmedia.send_batch(
    recipients=[
        {'email': 'user1@example.com', 'name': 'User 1'},
        {'email': 'user2@example.com', 'name': 'User 2'},
    ],
    subject='Hello %%First Name%%!',
    html='<h1>Hi %%First Name%%!</h1>',
)
```

## Blueprint Routes

- `POST /email/send` - Send single email
- `GET /email/check?email=...` - Check suppression
- `GET /email/ping` - Test connection

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Flask](https://flask.palletsprojects.com)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

