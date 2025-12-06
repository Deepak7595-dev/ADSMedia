import adsmedia from "../../adsmedia.app.mjs";

export default {
  key: "adsmedia-create-campaign",
  name: "Create Campaign",
  description: "Create a new email campaign in ADSMedia. [See the documentation](https://www.adsmedia.ai/api-docs)",
  version: "1.0.0",
  type: "action",
  props: {
    adsmedia,
    name: {
      type: "string",
      label: "Campaign Name",
      description: "Name for the campaign",
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
    preheader: {
      type: "string",
      label: "Preheader",
      description: "Email preheader (preview text)",
      optional: true,
    },
    type: {
      type: "integer",
      label: "Type",
      description: "Email type",
      options: [
        { label: "HTML + Text", value: 1 },
        { label: "HTML Only", value: 2 },
        { label: "Text Only", value: 3 },
      ],
      default: 1,
      optional: true,
    },
  },
  async run({ $ }) {
    const response = await this.adsmedia.createCampaign($, {
      name: this.name,
      subject: this.subject,
      html: this.html,
      text: this.text,
      preheader: this.preheader,
      type: this.type,
    });

    $.export("$summary", `Campaign "${this.name}" created (ID: ${response.data?.id || response.id})`);
    return response;
  },
};

