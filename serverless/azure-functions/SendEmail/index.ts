import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const API_BASE_URL = 'https://api.adsmedia.live/v1';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const apiKey = process.env.ADSMEDIA_API_KEY;

    if (!apiKey) {
        context.res = {
            status: 500,
            body: { error: 'ADSMEDIA_API_KEY not configured' }
        };
        return;
    }

    if (req.method === 'OPTIONS') {
        context.res = {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        };
        return;
    }

    if (req.method !== 'POST') {
        context.res = {
            status: 405,
            body: { error: 'Method not allowed' }
        };
        return;
    }

    try {
        const { to, subject, html, text, from_name, to_name } = req.body;

        if (!to || !subject || !html) {
            context.res = {
                status: 400,
                body: { error: 'Missing required fields: to, subject, html' }
            };
            return;
        }

        const response = await fetch(`${API_BASE_URL}/send`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to, subject, html, text, from_name, to_name }),
        });

        const data = await response.json();

        context.res = {
            status: response.status,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            body: data
        };
    } catch (error: any) {
        context.res = {
            status: 500,
            body: { error: error.message }
        };
    }
};

export default httpTrigger;

