import { defineEndpoint } from '@directus/extensions-sdk';

const API_BASE_URL = 'https://api.adsmedia.live/v1';

interface SendEmailPayload {
  to: string;
  to_name?: string;
  subject: string;
  html: string;
  text?: string;
  from_name?: string;
  reply_to?: string;
}

interface BatchPayload {
  recipients: Array<{ email: string; name?: string }>;
  subject: string;
  html: string;
  text?: string;
  preheader?: string;
  from_name?: string;
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

export default defineEndpoint((router, { env, logger }) => {
  const apiKey = env.ADSMEDIA_API_KEY;

  if (!apiKey) {
    logger.warn('ADSMEDIA_API_KEY not configured');
  }

  // Send single email
  router.post('/send', async (req, res) => {
    try {
      const payload: SendEmailPayload = req.body;

      if (!payload.to || !payload.subject || !payload.html) {
        return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
      }

      const result = await apiRequest(apiKey, '/send', 'POST', payload);
      logger.info(`ADSMedia: Email sent to ${payload.to}`);
      res.json({ success: true, data: result });
    } catch (error: any) {
      logger.error(`ADSMedia: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  });

  // Send batch emails
  router.post('/send/batch', async (req, res) => {
    try {
      const payload: BatchPayload = req.body;

      if (!payload.recipients || !payload.subject || !payload.html) {
        return res.status(400).json({ error: 'Missing required fields: recipients, subject, html' });
      }

      const result = await apiRequest(apiKey, '/send/batch', 'POST', payload);
      logger.info(`ADSMedia: Batch sent, Task ID: ${result.task_id}`);
      res.json({ success: true, data: result });
    } catch (error: any) {
      logger.error(`ADSMedia: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  });

  // Check suppression
  router.get('/check', async (req, res) => {
    try {
      const email = req.query.email as string;

      if (!email) {
        return res.status(400).json({ error: 'Email parameter required' });
      }

      const result = await apiRequest(apiKey, `/suppressions/check?email=${encodeURIComponent(email)}`);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Test connection
  router.get('/ping', async (_req, res) => {
    try {
      const result = await apiRequest(apiKey, '/ping');
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get usage
  router.get('/usage', async (_req, res) => {
    try {
      const result = await apiRequest(apiKey, '/account/usage');
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
});

