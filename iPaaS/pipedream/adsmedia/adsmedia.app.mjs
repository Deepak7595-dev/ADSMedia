import { axios } from "@pipedream/platform";

export default {
  type: "app",
  app: "adsmedia",
  propDefinitions: {
    to: {
      type: "string",
      label: "To Email",
      description: "Recipient email address",
    },
    toName: {
      type: "string",
      label: "To Name",
      description: "Recipient name",
      optional: true,
    },
    subject: {
      type: "string",
      label: "Subject",
      description: "Email subject line",
    },
    html: {
      type: "string",
      label: "HTML Content",
      description: "HTML content of the email",
    },
    text: {
      type: "string",
      label: "Plain Text",
      description: "Plain text version (auto-generated from HTML if not provided)",
      optional: true,
    },
    fromName: {
      type: "string",
      label: "From Name",
      description: "Sender display name",
      optional: true,
    },
    replyTo: {
      type: "string",
      label: "Reply-To",
      description: "Reply-to email address",
      optional: true,
    },
    serverId: {
      type: "integer",
      label: "Server ID",
      description: "Specific server ID (random available if not specified)",
      optional: true,
    },
    campaignId: {
      type: "integer",
      label: "Campaign ID",
      description: "Campaign ID",
      async options() {
        const campaigns = await this.getCampaigns();
        return campaigns.map((c) => ({
          label: c.name,
          value: c.id,
        }));
      },
    },
    listId: {
      type: "integer",
      label: "List ID",
      description: "Contact list ID",
      async options() {
        const lists = await this.getLists();
        return lists.map((l) => ({
          label: `${l.name} (${l.count} contacts)`,
          value: l.id,
        }));
      },
    },
    taskId: {
      type: "integer",
      label: "Task ID",
      description: "Schedule/Task ID for statistics",
    },
  },
  methods: {
    _baseUrl() {
      return "https://api.adsmedia.live/v1";
    },
    _headers() {
      return {
        "Authorization": `Bearer ${this.$auth.api_key}`,
        "Content-Type": "application/json",
      };
    },
    async _makeRequest({
      $,
      method = "GET",
      path,
      params,
      data,
    }) {
      return axios($ || this, {
        method,
        url: `${this._baseUrl()}${path}`,
        headers: this._headers(),
        params,
        data,
      });
    },
    // Connection
    async ping($) {
      return this._makeRequest({ $, path: "/ping" });
    },
    // Email
    async sendEmail($, opts) {
      return this._makeRequest({
        $,
        method: "POST",
        path: "/send",
        data: {
          to: opts.to,
          to_name: opts.toName,
          subject: opts.subject,
          html: opts.html,
          text: opts.text,
          from_name: opts.fromName,
          reply_to: opts.replyTo,
          server_id: opts.serverId,
        },
      });
    },
    async sendBatch($, opts) {
      return this._makeRequest({
        $,
        method: "POST",
        path: "/send/batch",
        data: {
          recipients: opts.recipients,
          subject: opts.subject,
          html: opts.html,
          text: opts.text,
          preheader: opts.preheader,
          from_name: opts.fromName,
          server_id: opts.serverId,
        },
      });
    },
    async getEmailStatus($, { messageId, sendId }) {
      const params = messageId ? { message_id: messageId } : { id: sendId };
      return this._makeRequest({ $, path: "/send/status", params });
    },
    // Campaigns
    async getCampaigns($, limit = 50) {
      const response = await this._makeRequest({
        $,
        path: "/campaigns",
        params: { limit },
      });
      return response.data || response;
    },
    async getCampaign($, id) {
      return this._makeRequest({ $, path: "/campaigns/get", params: { id } });
    },
    async createCampaign($, opts) {
      return this._makeRequest({
        $,
        method: "POST",
        path: "/campaigns/create",
        data: opts,
      });
    },
    // Lists
    async getLists($) {
      const response = await this._makeRequest({ $, path: "/lists" });
      return response.data || response;
    },
    async getList($, id) {
      return this._makeRequest({ $, path: "/lists/get", params: { id } });
    },
    async createList($, opts) {
      return this._makeRequest({
        $,
        method: "POST",
        path: "/lists/create",
        data: opts,
      });
    },
    async addContacts($, listId, contacts) {
      return this._makeRequest({
        $,
        method: "POST",
        path: "/lists/contacts/add",
        params: { id: listId },
        data: { contacts },
      });
    },
    async splitList($, listId, maxSize = 35000) {
      return this._makeRequest({
        $,
        method: "POST",
        path: "/lists/split",
        params: { id: listId },
        data: { max_size: maxSize },
      });
    },
    // Schedules
    async getSchedules($, status) {
      const params = status ? { status } : {};
      return this._makeRequest({ $, path: "/schedules", params });
    },
    async createSchedule($, opts) {
      return this._makeRequest({
        $,
        method: "POST",
        path: "/schedules/create",
        data: {
          campaign_id: opts.campaignId,
          list_id: opts.listId,
          server_id: opts.serverId,
          sender_name: opts.senderName,
          schedule: opts.schedule,
        },
      });
    },
    async updateSchedule($, id, opts) {
      return this._makeRequest({
        $,
        method: "PUT",
        path: "/schedules/update",
        params: { id },
        data: opts,
      });
    },
    async pauseSchedule($, id) {
      return this._makeRequest({
        $,
        method: "POST",
        path: "/schedules/pause",
        params: { id },
      });
    },
    async resumeSchedule($, id) {
      return this._makeRequest({
        $,
        method: "POST",
        path: "/schedules/resume",
        params: { id },
      });
    },
    // Servers
    async getServers($) {
      return this._makeRequest({ $, path: "/servers" });
    },
    async verifyDomain($, serverId) {
      return this._makeRequest({
        $,
        path: "/domains/verify",
        params: { server_id: serverId },
      });
    },
    // Statistics
    async getOverviewStats($) {
      return this._makeRequest({ $, path: "/stats/overview" });
    },
    async getCampaignStats($, taskId) {
      return this._makeRequest({
        $,
        path: "/stats/campaign",
        params: { id: taskId },
      });
    },
    async getEvents($, taskId, type, limit = 100) {
      return this._makeRequest({
        $,
        path: "/stats/events",
        params: { id: taskId, type, limit },
      });
    },
    // Suppression
    async checkSuppression($, email) {
      return this._makeRequest({
        $,
        path: "/suppressions/check",
        params: { email },
      });
    },
    // Account
    async getAccount($) {
      return this._makeRequest({ $, path: "/account" });
    },
    async getUsage($) {
      return this._makeRequest({ $, path: "/account/usage" });
    },
  },
};

