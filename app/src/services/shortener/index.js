'use strict';

const redis = require("redis");
const client = redis.createClient();
const hooks = require('./hooks');
const crypto = require('crypto');
const secret = '88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589';

const URL_SHORTENER_DIGITS = 7;
const BASE_CHARACTER_SET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const REDIRECT_URL = 'http://104.131.112.17/r/';

class Service {
  constructor(options) {
    this.options = options || {};
  }

  find(params) {
    return Promise.resolve([]);
  }

  create(data, params) {
    const url = data.url;
    const shortHash = this.getShortenedUrl(url);

    client.set(url, shortHash);
    client.set(shortHash, url);

    client.expire(url, 10);
    client.expire(shortHash, 10);

    return Promise.resolve(REDIRECT_URL + shortHash);
  }

  getShortenedUrl(url) {
    const salt = crypto.randomBytes(16).toString('ascii');
    const hash = parseInt(crypto.createHmac('sha256', secret)
                         .update(url + salt)
                         .digest('hex'), 16);

    return this.base62(hash).substring(0, URL_SHORTENER_DIGITS);
  }

  base62(int) {
    if (int === 0) return '0';
    
    var base62Str = '';
    
    while (int > 0) {
        base62Str += BASE_CHARACTER_SET[int % 62];
        int = Math.floor(int / 62);
    }

    return base62Str;
  }
}

module.exports = function(){
  const app = this;

  // Initialize our service with any options it requires
  app.use('/shortener', new Service());

  // Get our initialize service to that we can bind hooks
  const shortenerService = app.service('/shortener');

  // Set up our before hooks
  shortenerService.before(hooks.before);

  // Set up our after hooks
  shortenerService.after(hooks.after);
};

module.exports.Service = Service;
