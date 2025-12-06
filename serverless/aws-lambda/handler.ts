/**
 * ADSMedia AWS Lambda Handler
 * 
 * Deploy to AWS Lambda with API Gateway for serverless email sending
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const API_BASE_URL = 'https://api.adsmedia.live/v1';

interface SendEmailBody {
  to: string;
  subject: string;
  html: string;
  text?: string;
  to_name?: string;
  from_name?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function makeRequest(endpoint: string, method: string, body?: any): Promise<any> {
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
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  return response.json();
}

function response(statusCode: number, body: any): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}

export async function sendEmail(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === 'OPTIONS') {
    return response(200, {});
  }

  if (event.httpMethod !== 'POST') {
    return response(405, { error: 'Method not allowed' });
  }

  try {
    const body: SendEmailBody = JSON.parse(event.body || '{}');

    if (!body.to || !body.subject || !body.html) {
      return response(400, { error: 'Missing required fields: to, subject, html' });
    }

    const result = await makeRequest('/send', 'POST', body);
    return response(200, result);
  } catch (error: any) {
    return response(500, { error: error.message });
  }
}

export async function sendBatch(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === 'OPTIONS') {
    return response(200, {});
  }

  if (event.httpMethod !== 'POST') {
    return response(405, { error: 'Method not allowed' });
  }

  try {
    const body = JSON.parse(event.body || '{}');

    if (!body.recipients || !body.subject || !body.html) {
      return response(400, { error: 'Missing required fields: recipients, subject, html' });
    }

    const result = await makeRequest('/send/batch', 'POST', body);
    return response(200, result);
  } catch (error: any) {
    return response(500, { error: error.message });
  }
}

export async function checkSuppression(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === 'OPTIONS') {
    return response(200, {});
  }

  if (event.httpMethod !== 'GET') {
    return response(405, { error: 'Method not allowed' });
  }

  try {
    const email = event.queryStringParameters?.email;

    if (!email) {
      return response(400, { error: 'Email parameter required' });
    }

    const result = await makeRequest(`/suppressions/check?email=${encodeURIComponent(email)}`, 'GET');
    return response(200, result);
  } catch (error: any) {
    return response(500, { error: error.message });
  }
}

export async function ping(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === 'OPTIONS') {
    return response(200, {});
  }

  try {
    const result = await makeRequest('/ping', 'GET');
    return response(200, result);
  } catch (error: any) {
    return response(500, { error: error.message });
  }
}

