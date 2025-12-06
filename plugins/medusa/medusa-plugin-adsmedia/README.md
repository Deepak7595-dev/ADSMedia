# Medusa Plugin - ADSMedia Email

Send transactional emails via ADSMedia API for Medusa e-commerce.

## Installation

1. Copy `medusa-plugin-adsmedia` to your plugins folder

2. Add to `medusa-config.js`:

```javascript
const plugins = [
  // ... other plugins
  {
    resolve: `medusa-plugin-adsmedia`,
    options: {
      api_key: process.env.ADSMEDIA_API_KEY,
      from_name: "My Store",
    },
  },
];
```

3. Configure notification provider in admin:
   - Go to Settings → Notification Providers
   - Enable ADSMedia for desired events

## Supported Events

| Event | Description |
|-------|-------------|
| `order.placed` | New order confirmation |
| `order.shipment_created` | Order shipped notification |
| `order.canceled` | Order cancellation notice |
| `customer.password_reset` | Password reset request |
| `user.password_reset` | Admin password reset |
| `invite.created` | Team invitation |

## Custom Templates

Override templates in your own service:

```javascript
// src/services/custom-notification.js
const ADSMediaNotificationService = require('medusa-plugin-adsmedia/services/adsmedia-notification');

class CustomNotificationService extends ADSMediaNotificationService {
  orderPlacedTemplate(data) {
    return `
      <h1>Thanks for your order!</h1>
      <!-- Your custom HTML -->
    `;
  }
}

module.exports = CustomNotificationService;
```

## Manual Sending

```javascript
const notificationService = req.scope.resolve("adsmediaNotificationService");

await notificationService.sendEmail({
  to: "customer@example.com",
  subject: "Custom Email",
  html: "<h1>Hello!</h1>",
});
```

## Links

- [API Documentation](https://www.adsmedia.ai/api-docs)
- [Medusa Documentation](https://docs.medusajs.com)
- [GitHub](https://github.com/ADSMedia-ai/ADSMedia)

## License

MIT © [ADSMedia](https://www.adsmedia.ai)

