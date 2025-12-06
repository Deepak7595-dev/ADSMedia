# ADSMedia Express.js Middleware

Send emails via ADSMedia API from Express applications.

## Installation

```bash
npm install express
```

## Usage

### As Middleware

```javascript
const express = require('express');
const { adsmediaMiddleware } = require('./adsmedia-middleware');

const app = express();
app.use(express.json());
app.use(adsmediaMiddleware(process.env.ADSMEDIA_API_KEY));

app.post('/send-welcome', async (req, res) => {
  try {
    const result = await req.adsmedia.send({
      to: req.body.email,
      subject: 'Welcome!',
      html: '<h1>Hello!</h1>',
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

### As Router

```javascript
const express = require('express');
const { createEmailRouter } = require('./adsmedia-middleware');

const app = express();
app.use(express.json());
app.use('/email', createEmailRouter());

// Routes available:
// POST /email/send
// POST /email/send/batch
// GET  /email/check?email=user@example.com
// GET  /email/ping
// GET  /email/usage

app.listen(3000);
```

### Direct Client

```javascript
const { createClient } = require('./adsmedia-middleware');

const client = createClient('your-api-key');

// Send email
const result = await client.send({
  to: 'user@example.com',
  subject: 'Hello!',
  html: '<h1>Welcome!</h1>',
});
console.log(result.message_id);

// Check suppression
const check = await client.checkSuppression('user@example.com');
console.log(check.suppressed);
```

## Configuration

Set environment variable:

```bash
export ADSMEDIA_API_KEY=your-api-key
```

## Example Request

```bash
curl -X POST http://localhost:3000/email/send \
  -H "Content-Type: application/json" \
  -d '{"to": "user@example.com", "subject": "Hello!", "html": "<h1>Hi!</h1>"}'
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Express.js](https://expressjs.com)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

