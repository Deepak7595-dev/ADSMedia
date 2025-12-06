'use strict';

const API_BASE_URL = 'https://api.adsmedia.live/v1';

module.exports = ({ strapi }) => ({
  /**
   * Get plugin config
   */
  getConfig() {
    return strapi.config.get('plugin.adsmedia');
  },

  /**
   * Make API request to ADSMedia
   */
  async apiRequest(endpoint, method = 'GET', body = null) {
    const config = this.getConfig();
    
    if (!config.apiKey) {
      throw new Error('ADSMedia API key not configured');
    }

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || 'API Error');
    }

    return data.data;
  },

  /**
   * Send a single email
   */
  async send({ to, toName, subject, html, text, fromName, replyTo }) {
    const config = this.getConfig();
    
    const payload = {
      to,
      subject,
      html,
    };

    if (toName) payload.to_name = toName;
    if (text) payload.text = text;
    if (fromName || config.defaultFromName) {
      payload.from_name = fromName || config.defaultFromName;
    }
    if (replyTo) payload.reply_to = replyTo;

    const result = await this.apiRequest('/send', 'POST', payload);
    
    strapi.log.info(`ADSMedia: Email sent to ${to}, ID: ${result.message_id}`);
    
    return result;
  },

  /**
   * Send batch emails
   */
  async sendBatch({ recipients, subject, html, text, preheader, fromName }) {
    const config = this.getConfig();
    
    const payload = {
      recipients,
      subject,
      html,
    };

    if (text) payload.text = text;
    if (preheader) payload.preheader = preheader;
    if (fromName || config.defaultFromName) {
      payload.from_name = fromName || config.defaultFromName;
    }

    const result = await this.apiRequest('/send/batch', 'POST', payload);
    
    strapi.log.info(`ADSMedia: Batch sent, Task ID: ${result.task_id}`);
    
    return result;
  },

  /**
   * Check if email is suppressed
   */
  async checkSuppression(email) {
    return this.apiRequest(`/suppressions/check?email=${encodeURIComponent(email)}`);
  },

  /**
   * Test connection
   */
  async ping() {
    return this.apiRequest('/ping');
  },

  /**
   * Get usage stats
   */
  async getUsage() {
    return this.apiRequest('/account/usage');
  },
});

