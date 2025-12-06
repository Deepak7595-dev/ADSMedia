import adsmedia from "../../adsmedia.app.mjs";

export default {
  key: "adsmedia-send-email",
  name: "Send Email",
  description: "Send a single transactional email via ADSMedia API. [See the documentation](https://www.adsmedia.ai/api-docs)",
  version: "1.0.0",
  type: "action",
  props: {
    adsmedia,
    to: {
      propDefinition: [adsmedia, "to"],
    },
    toName: {
      propDefinition: [adsmedia, "toName"],
    },
    subject: {
      propDefinition: [adsmedia, "subject"],
    },
    html: {
      propDefinition: [adsmedia, "html"],
    },
    text: {
      propDefinition: [adsmedia, "text"],
    },
    fromName: {
      propDefinition: [adsmedia, "fromName"],
    },
    replyTo: {
      propDefinition: [adsmedia, "replyTo"],
    },
    serverId: {
      propDefinition: [adsmedia, "serverId"],
    },
  },
  async run({ $ }) {
    const response = await this.adsmedia.sendEmail($, {
      to: this.to,
      toName: this.toName,
      subject: this.subject,
      html: this.html,
      text: this.text,
      fromName: this.fromName,
      replyTo: this.replyTo,
      serverId: this.serverId,
    });

    $.export("$summary", `Email sent to ${this.to} (Message ID: ${response.data?.message_id || response.message_id})`);
    return response;
  },
};

