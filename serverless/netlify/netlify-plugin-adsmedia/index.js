/**
 * Netlify Build Plugin - ADSMedia Email Notifications
 * Send email notifications on successful/failed deployments
 */

module.exports = {
  async onSuccess({ inputs, utils }) {
    const { ADSMEDIA_API_KEY } = process.env;
    const { to, subject_prefix, from_name, on_success } = inputs;

    if (!on_success) {
      console.log('ADSMedia: Skipping success notification (disabled)');
      return;
    }

    if (!ADSMEDIA_API_KEY) {
      utils.build.failPlugin('ADSMEDIA_API_KEY environment variable is required');
      return;
    }

    if (!to) {
      utils.build.failPlugin('Email recipient (to) is required');
      return;
    }

    const { SITE_NAME, DEPLOY_URL, BRANCH, COMMIT_REF, CONTEXT } = process.env;
    const prefix = subject_prefix || '✅ Deploy Success';
    const subject = `${prefix}: ${SITE_NAME || 'Site'}`;

    const html = `
      <h1>🚀 Deployment Successful!</h1>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Site</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${SITE_NAME || 'Unknown'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>URL</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><a href="${DEPLOY_URL}">${DEPLOY_URL}</a></td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Branch</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${BRANCH || 'Unknown'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Commit</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><code>${COMMIT_REF?.slice(0, 7) || 'Unknown'}</code></td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Context</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${CONTEXT || 'Unknown'}</td></tr>
      </table>
      <p style="margin-top: 16px; color: #666;">Sent via <a href="https://www.adsmedia.ai">ADSMedia</a></p>
    `;

    try {
      const response = await fetch('https://api.adsmedia.live/v1/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ADSMEDIA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          html,
          from_name: from_name || 'Netlify Deploy',
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log(`ADSMedia: Success notification sent to ${to}`);
        console.log(`Message ID: ${data.data.message_id}`);
      } else {
        console.error(`ADSMedia: Failed to send - ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`ADSMedia: Error - ${error.message}`);
    }
  },

  async onError({ inputs, utils, error }) {
    const { ADSMEDIA_API_KEY } = process.env;
    const { to, subject_prefix_error, from_name, on_error } = inputs;

    if (!on_error) {
      console.log('ADSMedia: Skipping error notification (disabled)');
      return;
    }

    if (!ADSMEDIA_API_KEY || !to) {
      return;
    }

    const { SITE_NAME, BRANCH, COMMIT_REF, CONTEXT } = process.env;
    const prefix = subject_prefix_error || '❌ Deploy Failed';
    const subject = `${prefix}: ${SITE_NAME || 'Site'}`;

    const html = `
      <h1>⚠️ Deployment Failed</h1>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Site</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${SITE_NAME || 'Unknown'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Branch</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${BRANCH || 'Unknown'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Commit</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><code>${COMMIT_REF?.slice(0, 7) || 'Unknown'}</code></td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Context</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${CONTEXT || 'Unknown'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Error</strong></td><td style="padding: 8px; border: 1px solid #ddd; color: red;">${error?.message || 'Unknown error'}</td></tr>
      </table>
      <p style="margin-top: 16px; color: #666;">Sent via <a href="https://www.adsmedia.ai">ADSMedia</a></p>
    `;

    try {
      const response = await fetch('https://api.adsmedia.live/v1/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ADSMEDIA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          html,
          from_name: from_name || 'Netlify Deploy',
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log(`ADSMedia: Error notification sent to ${to}`);
      }
    } catch (err) {
      console.error(`ADSMedia: Failed to send error notification - ${err.message}`);
    }
  },
};

