'use strict';

module.exports = {
  default: {
    apiKey: '',
    defaultFromName: 'Strapi',
  },
  validator: (config) => {
    if (!config.apiKey) {
      strapi.log.warn('ADSMedia: API key not configured');
    }
  },
};

