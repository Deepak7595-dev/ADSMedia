import { KeystoneContext } from '@keystone-6/core/types';

const API_BASE_URL = 'https://api.adsmedia.live/v1';

export interface ADSMediaConfig {
  apiKey: string;
  defaultFromName?: string;
}

export interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  fromName?: string;
  replyTo?: string;
}

export interface BatchEmailOptions {
  recipients: Array<{ email: string; name?: string }>;
  subject: string;
  html: string;
  text?: string;
  preheader?: string;
  fromName?: string;
}

async function apiRequest(apiKey: string, endpoint: string, method = 'GET', body?: any) {
  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'ADSMedia API Error');
  }

  return data.data;
}

export function createADSMediaClient(config: ADSMediaConfig) {
  const { apiKey, defaultFromName = 'KeystoneJS' } = config;

  return {
    async send(options: SendEmailOptions) {
      const payload: any = {
        to: options.to,
        subject: options.subject,
        html: options.html,
        from_name: options.fromName || defaultFromName,
      };

      if (options.toName) payload.to_name = options.toName;
      if (options.text) payload.text = options.text;
      if (options.replyTo) payload.reply_to = options.replyTo;

      return apiRequest(apiKey, '/send', 'POST', payload);
    },

    async sendBatch(options: BatchEmailOptions) {
      const payload: any = {
        recipients: options.recipients,
        subject: options.subject,
        html: options.html,
        from_name: options.fromName || defaultFromName,
      };

      if (options.text) payload.text = options.text;
      if (options.preheader) payload.preheader = options.preheader;

      return apiRequest(apiKey, '/send/batch', 'POST', payload);
    },

    async checkSuppression(email: string) {
      return apiRequest(apiKey, `/suppressions/check?email=${encodeURIComponent(email)}`);
    },

    async ping() {
      return apiRequest(apiKey, '/ping');
    },

    async getUsage() {
      return apiRequest(apiKey, '/account/usage');
    },
  };
}

// Keystone hook helper
export function withADSMedia(config: ADSMediaConfig) {
  const client = createADSMediaClient(config);

  return {
    client,

    // Hook for afterOperation
    async sendAfterCreate(
      context: KeystoneContext,
      item: any,
      options: Partial<SendEmailOptions> & { getEmail: (item: any) => string; getSubject: (item: any) => string; getHtml: (item: any) => string }
    ) {
      const email = options.getEmail(item);
      const subject = options.getSubject(item);
      const html = options.getHtml(item);

      await client.send({
        to: email,
        subject,
        html,
        fromName: options.fromName,
      });
    },
  };
}

export default createADSMediaClient;

