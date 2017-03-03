'use strict';

const redis = require("redis");
const client = redis.createClient();
const hooks = require('./hooks');

class Service {
  constructor(options) {
    this.options = options || {};
  }

  find(params) {
    return Promise.resolve([]);
  }

  get(id, params) {
    client.get(id, function(error, reply) {
      return params.res.redirect(301, reply); 
    });
  }
}

module.exports = function(){
  const app = this;

  // Initialize our service with any options it requires
  app.use('/r', new Service());

  // Get our initialize service to that we can bind hooks
  const rService = app.service('/r');

  // Set up our before hooks
  rService.before(hooks.before);

  // Set up our after hooks
  rService.after(hooks.after);
};

module.exports.Service = Service;
