# ADSMedia Koa.js Integration

Send emails via ADSMedia API from Koa applications.

## Installation

```bash
npm install koa @koa/router koa-bodyparser
```

## Setup

```javascript
const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const { adsmediaMiddleware, createEmailRoutes } = require('./adsmedia-koa');

const app = new Koa();

app.use(bodyParser());
app.use(adsmediaMiddleware({
  apiKey: process.env.ADSMEDIA_API_KEY,
  defaultFromName: 'My App',
}));

const emailRouter = createEmailRoutes(Router);
app.use(emailRouter.routes());
app.use(emailRouter.allowedMethods());

app.listen(3000);
```

## Usage

### In Routes

```javascript
router.post('/send-welcome', async (ctx) => {
  const { email, name } = ctx.request.body;
  
  const result = await ctx.adsmedia.send({
    to: email,
    to_name: name,
    subject: 'Welcome!',
    html: `<h1>Hello ${name}!</h1>`,
  });

  ctx.body = { message_id: result.message_id };
});
```

### Batch Sending

```javascript
const result = await ctx.adsmedia.sendBatch({
  recipients: [
    { email: 'user1@example.com', name: 'User 1' },
    { email: 'user2@example.com', name: 'User 2' },
  ],
  subject: 'Hello %%First Name%%!',
  html: '<h1>Hi %%First Name%%!</h1>',
});
```

### Check Suppression

```javascript
const result = await ctx.adsmedia.checkSuppression('user@example.com');
console.log(result.suppressed);
```

## Routes

- `POST /email/send` - Send single email
- `POST /email/batch` - Send batch emails
- `GET /email/check?email=...` - Check suppression
- `GET /email/ping` - Test connection

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Koa.js](https://koajs.com)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

