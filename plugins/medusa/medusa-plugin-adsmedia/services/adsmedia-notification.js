const { AbstractNotificationService } = require("@medusajs/medusa");

const API_BASE_URL = "https://api.adsmedia.live/v1";

class ADSMediaNotificationService extends AbstractNotificationService {
  static identifier = "adsmedia";

  constructor(container, options) {
    super(container);
    this.options_ = options;
    this.apiKey_ = options.api_key;
    this.fromName_ = options.from_name || "Medusa Store";
  }

  async sendNotification(event, data, attachmentGenerator) {
    const { to, subject, html, text } = this.getEmailContent(event, data);

    if (!to) {
      return { to: null, status: "failed", data: { error: "No recipient" } };
    }

    try {
      const result = await this.sendEmail({ to, subject, html, text });
      return {
        to,
        status: "sent",
        data: result,
      };
    } catch (error) {
      return {
        to,
        status: "failed",
        data: { error: error.message },
      };
    }
  }

  async resendNotification(notification, config, attachmentGenerator) {
    const { to, data } = notification;
    return this.sendNotification(notification.event_name, data, attachmentGenerator);
  }

  getEmailContent(event, data) {
    const templates = {
      "order.placed": {
        subject: `Order Confirmation #${data.order?.display_id || ""}`,
        html: this.orderPlacedTemplate(data),
      },
      "order.shipment_created": {
        subject: `Your order has shipped #${data.order?.display_id || ""}`,
        html: this.orderShippedTemplate(data),
      },
      "order.canceled": {
        subject: `Order Canceled #${data.order?.display_id || ""}`,
        html: this.orderCanceledTemplate(data),
      },
      "customer.password_reset": {
        subject: "Password Reset Request",
        html: this.passwordResetTemplate(data),
      },
      "user.password_reset": {
        subject: "Password Reset Request",
        html: this.passwordResetTemplate(data),
      },
      "invite.created": {
        subject: "You've been invited",
        html: this.inviteTemplate(data),
      },
    };

    const template = templates[event] || {
      subject: `Notification: ${event}`,
      html: `<p>Event: ${event}</p><pre>${JSON.stringify(data, null, 2)}</pre>`,
    };

    return {
      to: data.order?.email || data.customer?.email || data.email,
      ...template,
    };
  }

  orderPlacedTemplate(data) {
    const order = data.order || {};
    return `
      <h1>Thank you for your order!</h1>
      <p>Order #${order.display_id}</p>
      <p>We've received your order and will notify you when it ships.</p>
      <h3>Order Summary</h3>
      <p>Total: ${this.formatCurrency(order.total, order.currency_code)}</p>
    `;
  }

  orderShippedTemplate(data) {
    const order = data.order || {};
    return `
      <h1>Your order has shipped!</h1>
      <p>Order #${order.display_id}</p>
      <p>Your order is on its way.</p>
    `;
  }

  orderCanceledTemplate(data) {
    const order = data.order || {};
    return `
      <h1>Order Canceled</h1>
      <p>Order #${order.display_id} has been canceled.</p>
    `;
  }

  passwordResetTemplate(data) {
    return `
      <h1>Password Reset</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${data.token_url || data.link || "#"}">Reset Password</a>
    `;
  }

  inviteTemplate(data) {
    return `
      <h1>You've been invited!</h1>
      <p>Click below to accept the invitation:</p>
      <a href="${data.invite_link || "#"}">Accept Invitation</a>
    `;
  }

  formatCurrency(amount, currency) {
    if (!amount) return "";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency?.toUpperCase() || "USD",
    }).format(amount / 100);
  }

  async sendEmail({ to, subject, html, text }) {
    const payload = {
      to,
      subject,
      html,
      from_name: this.fromName_,
    };
    if (text) payload.text = text;

    const response = await fetch(`${API_BASE_URL}/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey_}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || "Failed to send email");
    }

    return data.data;
  }
}

module.exports = ADSMediaNotificationService;
module.exports.default = ADSMediaNotificationService;

