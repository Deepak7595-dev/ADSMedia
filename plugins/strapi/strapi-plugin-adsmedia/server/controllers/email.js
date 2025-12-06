'use strict';

module.exports = ({ strapi }) => ({
  async send(ctx) {
    try {
      const { to, toName, subject, html, text, fromName, replyTo } = ctx.request.body;
      
      if (!to || !subject || !html) {
        return ctx.badRequest('Missing required fields: to, subject, html');
      }

      const result = await strapi
        .plugin('adsmedia')
        .service('email')
        .send({ to, toName, subject, html, text, fromName, replyTo });

      ctx.body = { success: true, data: result };
    } catch (error) {
      ctx.badRequest(error.message);
    }
  },

  async sendBatch(ctx) {
    try {
      const { recipients, subject, html, text, preheader, fromName } = ctx.request.body;
      
      if (!recipients || !subject || !html) {
        return ctx.badRequest('Missing required fields: recipients, subject, html');
      }

      const result = await strapi
        .plugin('adsmedia')
        .service('email')
        .sendBatch({ recipients, subject, html, text, preheader, fromName });

      ctx.body = { success: true, data: result };
    } catch (error) {
      ctx.badRequest(error.message);
    }
  },

  async checkSuppression(ctx) {
    try {
      const { email } = ctx.query;
      
      if (!email) {
        return ctx.badRequest('Email parameter required');
      }

      const result = await strapi
        .plugin('adsmedia')
        .service('email')
        .checkSuppression(email);

      ctx.body = { success: true, data: result };
    } catch (error) {
      ctx.badRequest(error.message);
    }
  },

  async ping(ctx) {
    try {
      const result = await strapi
        .plugin('adsmedia')
        .service('email')
        .ping();

      ctx.body = { success: true, data: result };
    } catch (error) {
      ctx.badRequest(error.message);
    }
  },

  async usage(ctx) {
    try {
      const result = await strapi
        .plugin('adsmedia')
        .service('email')
        .getUsage();

      ctx.body = { success: true, data: result };
    } catch (error) {
      ctx.badRequest(error.message);
    }
  },
});

