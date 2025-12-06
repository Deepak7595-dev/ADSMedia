'use strict';

module.exports = [
  {
    method: 'POST',
    path: '/send',
    handler: 'email.send',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/send/batch',
    handler: 'email.sendBatch',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/check',
    handler: 'email.checkSuppression',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/ping',
    handler: 'email.ping',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/usage',
    handler: 'email.usage',
    config: {
      policies: [],
    },
  },
];

