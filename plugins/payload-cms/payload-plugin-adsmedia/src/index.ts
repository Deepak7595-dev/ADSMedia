import type { Config, Plugin } from 'payload/config';

const API_BASE_URL = 'https://api.adsmedia.live/v1';

export interface ADSMediaPluginOptions {
  apiKey: string;
  defaultFromName?: string;
}

interface EmailPayload {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  fromName?: string;
  replyTo?: string;
}

interface BatchPayload {
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

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'API Error');
  }

  return data.data;
}

export class ADSMediaService {
  private apiKey: string;
  private defaultFromName: string;

  constructor(options: ADSMediaPluginOptions) {
    this.apiKey = options.apiKey;
    this.defaultFromName = options.defaultFromName || 'Payload CMS';
  }

  async send(payload: EmailPayload) {
    const body: any = {
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      from_name: payload.fromName || this.defaultFromName,
    };

    if (payload.toName) body.to_name = payload.toName;
    if (payload.text) body.text = payload.text;
    if (payload.replyTo) body.reply_to = payload.replyTo;

    return apiRequest(this.apiKey, '/send', 'POST', body);
  }

  async sendBatch(payload: BatchPayload) {
    const body: any = {
      recipients: payload.recipients,
      subject: payload.subject,
      html: payload.html,
      from_name: payload.fromName || this.defaultFromName,
    };

    if (payload.text) body.text = payload.text;
    if (payload.preheader) body.preheader = payload.preheader;

    return apiRequest(this.apiKey, '/send/batch', 'POST', body);
  }

  async checkSuppression(email: string) {
    return apiRequest(this.apiKey, `/suppressions/check?email=${encodeURIComponent(email)}`);
  }

  async ping() {
    return apiRequest(this.apiKey, '/ping');
  }

  async getUsage() {
    return apiRequest(this.apiKey, '/account/usage');
  }
}

let serviceInstance: ADSMediaService | null = null;

export const adsmediaPlugin =
  (options: ADSMediaPluginOptions): Plugin =>
  (incomingConfig: Config): Config => {
    serviceInstance = new ADSMediaService(options);

    // Add custom endpoint
    const endpoints = incomingConfig.endpoints || [];

    return {
      ...incomingConfig,
      endpoints: [
        ...endpoints,
        {
          path: '/adsmedia/send',
          method: 'post',
          handler: async (req, res) => {
            try {
              if (!serviceInstance) {
                return res.status(500).json({ error: 'Plugin not initialized' });
              }
              const result = await serviceInstance.send(req.body);
              res.json({ success: true, data: result });
            } catch (error: any) {
              res.status(500).json({ error: error.message });
            }
          },
        },
        {
          path: '/adsmedia/check',
          method: 'get',
          handler: async (req, res) => {
            try {
              if (!serviceInstance) {
                return res.status(500).json({ error: 'Plugin not initialized' });
              }
              const email = req.query.email as string;
              if (!email) {
                return res.status(400).json({ error: 'Email required' });
              }
              const result = await serviceInstance.checkSuppression(email);
              res.json({ success: true, data: result });
            } catch (error: any) {
              res.status(500).json({ error: error.message });
            }
          },
        },
      ],
    };
  };

export const getADSMediaService = (): ADSMediaService => {
  if (!serviceInstance) {
    throw new Error('ADSMedia plugin not initialized');
  }
  return serviceInstance;
};

export default adsmediaPlugin;

