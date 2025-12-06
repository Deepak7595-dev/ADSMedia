'use strict';

const register = require('./register');
const bootstrap = require('./bootstrap');
const config = require('./config');
const services = require('./services');
const controllers = require('./controllers');
const routes = require('./routes');

module.exports = {
  register,
  bootstrap,
  config,
  services,
  controllers,
  routes,
};

