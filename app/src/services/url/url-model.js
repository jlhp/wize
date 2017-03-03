'use strict';

// url-model.js - A sequelize model
// 
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.

const Sequelize = require('sequelize');

module.exports = function(sequelize) {
  const url = sequelize.define('urls', {
    url: {
      type: Sequelize.STRING,
      allowNull: false
    },
    hash: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    freezeTableName: true
  });

  url.sync();

  return url;
};
