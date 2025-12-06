/**
 * ADSMedia Next.js Integration
 * Server actions and API routes for Next.js
 */

const API_BASE_URL = 'https://api.adsmedia.live/v1';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  toName?: string;
  fromName?: string;
  text?: string;
  replyTo?: string;
}

interface BatchRecipient {
  email: string;
  name?: string;
}

interface BatchEmailOptions {
  recipients: BatchRecipient[];
  subject: string;
  html: string;
  text?: string;
  preheader?: string;
  fromName?: string;
}

async function apiRequest(endpoint: string, method = 'GET', body?: any) {
  const apiKey = process.env.ADSMEDIA_API_KEY;
  
  if (!apiKey) {
    throw new Error('ADSMEDIA_API_KEY not configured');
  }

  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
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

// Server Actions (App Router)
export async function sendEmail(options: SendEmailOptions) {
  'use server';
  
  const payload: any = {
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  if (options.toName) payload.to_name = options.toName;
  if (options.fromName) payload.from_name = options.fromName;
  if (options.text) payload.text = options.text;
  if (options.replyTo) payload.reply_to = options.replyTo;

  return apiRequest('/send', 'POST', payload);
}

export async function sendBatchEmail(options: BatchEmailOptions) {
  'use server';
  
  const payload: any = {
    recipients: options.recipients,
    subject: options.subject,
    html: options.html,
  };

  if (options.fromName) payload.from_name = options.fromName;
  if (options.text) payload.text = options.text;
  if (options.preheader) payload.preheader = options.preheader;

  return apiRequest('/send/batch', 'POST', payload);
}

export async function checkSuppression(email: string) {
  'use server';
  return apiRequest(`/suppressions/check?email=${encodeURIComponent(email)}`);
}

export async function ping() {
  'use server';
  return apiRequest('/ping');
}

// Client for API Routes (Pages Router)
export function createADSMediaClient() {
  return {
    send: (options: SendEmailOptions) => {
      const payload: any = {
        to: options.to,
        subject: options.subject,
        html: options.html,
      };
      if (options.toName) payload.to_name = options.toName;
      if (options.fromName) payload.from_name = options.fromName;
      if (options.text) payload.text = options.text;
      if (options.replyTo) payload.reply_to = options.replyTo;
      
      return apiRequest('/send', 'POST', payload);
    },
    sendBatch: (options: BatchEmailOptions) => {
      const payload: any = {
        recipients: options.recipients,
        subject: options.subject,
        html: options.html,
      };
      if (options.fromName) payload.from_name = options.fromName;
      if (options.text) payload.text = options.text;
      if (options.preheader) payload.preheader = options.preheader;
      
      return apiRequest('/send/batch', 'POST', payload);
    },
    checkSuppression: (email: string) => 
      apiRequest(`/suppressions/check?email=${encodeURIComponent(email)}`),
    ping: () => apiRequest('/ping'),
    getUsage: () => apiRequest('/account/usage'),
  };
}

export default createADSMediaClient;

