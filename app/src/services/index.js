'use strict';
const top = require('./top');
const url = require('./url');
const r = require('./r');
const shortener = require('./shortener');
const authentication = require('./authentication');
const user = require('./user');
const Sequelize = require('sequelize');
module.exports = function() {
  const app = this;

  const sequelize = new Sequelize(app.get('mysql'), {
    dialect: 'mysql',
    logging: false
  });
  app.set('sequelize', sequelize);

  app.configure(authentication);
  app.configure(user);
  app.configure(shortener);
  app.configure(r);
  app.configure(url);
  app.configure(top);
};
