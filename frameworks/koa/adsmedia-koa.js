/**
 * ADSMedia Koa.js Middleware
 * Send emails via ADSMedia API from Koa applications
 * 
 * npm install koa
 */

const API_BASE_URL = 'https://api.adsmedia.live/v1';

/**
 * ADSMedia API Client
 */
class ADSMediaClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async request(method, endpoint, data) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    } else if (data && method === 'GET') {
      const params = new URLSearchParams(data);
      url = `${url}?${params}`;
    }

    const response = await fetch(url, options);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'ADSMedia API Error');
    }

    return result.data;
  }

  async send(options) {
    return this.request('POST', '/send', options);
  }

  async sendBatch(options) {
    return this.request('POST', '/send/batch', options);
  }

  async checkSuppression(email) {
    return this.request('GET', '/suppressions/check', { email });
  }

  async ping() {
    return this.request('GET', '/ping');
  }

  async getUsage() {
    return this.request('GET', '/account/usage');
  }
}

/**
 * Koa middleware factory
 * @param {object} options - { apiKey: string, defaultFromName?: string }
 * @returns {function} Koa middleware
 */
function adsmediaMiddleware(options = {}) {
  const apiKey = options.apiKey || process.env.ADSMEDIA_API_KEY;
  
  if (!apiKey) {
    throw new Error('ADSMEDIA_API_KEY not configured');
  }

  const client = new ADSMediaClient(apiKey);
  const defaultFromName = options.defaultFromName || 'Koa';

  return async (ctx, next) => {
    ctx.adsmedia = {
      client,
      
      async send(params) {
        return client.send({
          from_name: defaultFromName,
          ...params,
        });
      },

      async sendBatch(params) {
        return client.sendBatch({
          from_name: defaultFromName,
          ...params,
        });
      },

      async checkSuppression(email) {
        return client.checkSuppression(email);
      },

      async ping() {
        return client.ping();
      },
    };

    await next();
  };
}

/**
 * Email routes factory
 * @returns {object} Koa router routes object
 */
function createEmailRoutes(Router) {
  const router = new Router({ prefix: '/email' });

  router.post('/send', async (ctx) => {
    try {
      const { to, subject, html, toName, fromName, text } = ctx.request.body;
      const result = await ctx.adsmedia.send({ to, subject, html, to_name: toName, from_name: fromName, text });
      ctx.body = { success: true, data: result };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  });

  router.post('/batch', async (ctx) => {
    try {
      const { recipients, subject, html, fromName } = ctx.request.body;
      const result = await ctx.adsmedia.sendBatch({ recipients, subject, html, from_name: fromName });
      ctx.body = { success: true, data: result };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  });

  router.get('/check', async (ctx) => {
    try {
      const result = await ctx.adsmedia.checkSuppression(ctx.query.email);
      ctx.body = { success: true, data: result };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  });

  router.get('/ping', async (ctx) => {
    try {
      const result = await ctx.adsmedia.ping();
      ctx.body = { success: true, data: result };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  });

  return router;
}

module.exports = {
  ADSMediaClient,
  adsmediaMiddleware,
  createEmailRoutes,
};

// Example usage
if (require.main === module) {
  const Koa = require('koa');
  const Router = require('@koa/router');
  const bodyParser = require('koa-bodyparser');

  const app = new Koa();
  
  app.use(bodyParser());
  app.use(adsmediaMiddleware({ apiKey: process.env.ADSMEDIA_API_KEY }));
  
  const emailRouter = createEmailRoutes(Router);
  app.use(emailRouter.routes());
  app.use(emailRouter.allowedMethods());

  app.listen(3000, () => console.log('Server running on :3000'));
}

