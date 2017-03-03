'use strict';

const hooks = require('./hooks');

class Service {
  constructor(options) {
    this.options = options || {};
  }

  find(params) {
    return Promise.resolve([]);
  }

  get(id, params) {
    params.redisClient.get(id, function(error, reply) {
      if(!reply) {
        return params.res.redirect(410, 'http://104.131.112.17/')
      }
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
