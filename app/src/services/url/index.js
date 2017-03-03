'use strict';

const service = require('feathers-sequelize');
const url = require('./url-model');
const hooks = require('./hooks');

module.exports = function(){
  const app = this;

  const options = {
    Model: url(app.get('sequelize'))/*,
    paginate: {
      default: 5,
      max: 25
    }*/
  };

  // Initialize our service with any options it requires
  app.use('/urls', service(options));

  // Get our initialize service to that we can bind hooks
  const urlService = app.service('/urls');

  // Set up our before hooks
  urlService.before(hooks.before);

  // Set up our after hooks
  urlService.after(hooks.after);
};
