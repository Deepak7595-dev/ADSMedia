import adsmedia from "../../adsmedia.app.mjs";

export default {
  key: "adsmedia-send-batch",
  name: "Send Batch Emails",
  description: "Send up to 1000 marketing emails in a batch via ADSMedia API. [See the documentation](https://www.adsmedia.ai/api-docs)",
  version: "1.0.0",
  type: "action",
  props: {
    adsmedia,
    recipients: {
      type: "string[]",
      label: "Recipients",
      description: "Array of recipient emails or JSON objects with email and name: `{\"email\": \"user@example.com\", \"name\": \"John\"}`",
    },
    subject: {
      propDefinition: [adsmedia, "subject"],
      description: "Email subject line. Supports placeholders: %%First Name%%, %%Last Name%%, %%emailaddress%%",
    },
    html: {
      propDefinition: [adsmedia, "html"],
      description: "HTML content. Supports personalization placeholders.",
    },
    text: {
      propDefinition: [adsmedia, "text"],
    },
    preheader: {
      type: "string",
      label: "Preheader",
      description: "Email preheader (preview text)",
      optional: true,
    },
    fromName: {
      propDefinition: [adsmedia, "fromName"],
    },
    serverId: {
      propDefinition: [adsmedia, "serverId"],
    },
  },
  async run({ $ }) {
    // Parse recipients - can be email strings or JSON objects
    const parsedRecipients = this.recipients.map((r) => {
      if (typeof r === "string") {
        try {
          return JSON.parse(r);
        } catch {
          return { email: r };
        }
      }
      return r;
    });

    const response = await this.adsmedia.sendBatch($, {
      recipients: parsedRecipients,
      subject: this.subject,
      html: this.html,
      text: this.text,
      preheader: this.preheader,
      fromName: this.fromName,
      serverId: this.serverId,
    });

    const count = response.data?.recipients_count || parsedRecipients.length;
    $.export("$summary", `Batch of ${count} emails queued (Task ID: ${response.data?.task_id || response.task_id})`);
    return response;
  },
};

