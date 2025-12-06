/**
 * ADSMedia Express.js Middleware
 * Send emails via ADSMedia API from Express applications
 * 
 * npm install express
 */

const API_BASE_URL = 'https://api.adsmedia.live/v1';

/**
 * Create ADSMedia client
 */
function createClient(apiKey) {
  async function request(method, endpoint, data) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const queryString = method === 'GET' && data 
      ? '?' + new URLSearchParams(data).toString() 
      : '';

    const response = await fetch(url + queryString, options);
    const result = await response.json();

    if (!result.success) {
      const error = new Error(result.error?.message || 'ADSMedia API Error');
      error.status = response.status;
      throw error;
    }

    return result.data;
  }

  return {
    send: (payload) => request('POST', '/send', payload),
    sendBatch: (payload) => request('POST', '/send/batch', payload),
    checkSuppression: (email) => request('GET', '/suppressions/check', { email }),
    ping: () => request('GET', '/ping'),
    getUsage: () => request('GET', '/account/usage'),
  };
}

/**
 * Express middleware that adds adsmedia client to req
 */
function adsmediaMiddleware(apiKey) {
  const client = createClient(apiKey || process.env.ADSMEDIA_API_KEY);

  return (req, res, next) => {
    req.adsmedia = client;
    next();
  };
}

/**
 * Create Express router with email endpoints
 */
function createEmailRouter(apiKey) {
  const express = require('express');
  const router = express.Router();
  const client = createClient(apiKey || process.env.ADSMEDIA_API_KEY);

  router.post('/send', async (req, res) => {
    try {
      const result = await client.send(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  router.post('/send/batch', async (req, res) => {
    try {
      const result = await client.sendBatch(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  router.get('/check', async (req, res) => {
    try {
      const result = await client.checkSuppression(req.query.email);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  router.get('/ping', async (req, res) => {
    try {
      const result = await client.ping();
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  router.get('/usage', async (req, res) => {
    try {
      const result = await client.getUsage();
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  return router;
}

module.exports = {
  createClient,
  adsmediaMiddleware,
  createEmailRouter,
};

