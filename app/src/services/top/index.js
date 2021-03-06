'use strict';

const hooks = require('./hooks');

class Service {
  constructor(options) {
    this.options = options || {};
  }

  find(params) {
    return new Promise(function(resolve, reject) {   
      params.redisClient.zrevrange('topScores', 0, -1, 'withscores', function(err, members) {
          resolve(members);
      });
    });
  }

  get(id, params) {
    return Promise.resolve({
      id, text: `A new message with ID: ${id}!`
    });
  }

  create(data, params) {
    if(Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current)));
    }

    return Promise.resolve(data);
  }

  update(id, data, params) {
    return Promise.resolve(data);
  }

  patch(id, data, params) {
    return Promise.resolve(data);
  }

  remove(id, params) {
    return Promise.resolve({ id });
  }
}

module.exports = function(){
  const app = this;

  // Initialize our service with any options it requires
  app.use('/tops', new Service());

  // Get our initialize service to that we can bind hooks
  const topService = app.service('/tops');

  // Set up our before hooks
  topService.before(hooks.before);

  // Set up our after hooks
  topService.after(hooks.after);
};

module.exports.Service = Service;
