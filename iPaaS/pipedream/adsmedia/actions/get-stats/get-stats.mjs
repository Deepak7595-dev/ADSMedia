import adsmedia from "../../adsmedia.app.mjs";

export default {
  key: "adsmedia-get-stats",
  name: "Get Campaign Statistics",
  description: "Get statistics for a campaign/task in ADSMedia. [See the documentation](https://www.adsmedia.ai/api-docs)",
  version: "1.0.0",
  type: "action",
  props: {
    adsmedia,
    taskId: {
      propDefinition: [adsmedia, "taskId"],
    },
  },
  async run({ $ }) {
    const response = await this.adsmedia.getCampaignStats($, this.taskId);

    const data = response.data || response;
    $.export("$summary", `Stats for task ${this.taskId}: ${data.sent || 0} sent, ${data.opens || 0} opens, ${data.clicks || 0} clicks`);
    return response;
  },
};

