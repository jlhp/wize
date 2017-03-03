'use strict';

const hooks = require('./hooks');
const crypto = require('crypto');
const secret = '88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589';

const URL_SHORTENER_DIGITS = 7;
const BASE_CHARACTER_SET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const REDIRECT_URL = 'http://104.131.112.17/r/';

const DEFAULT_EXPIRATION = 24 * 60 * 60;

const re_weburl = new RegExp(
      "^" +
        // protocol identifier
        "(?:(?:https?|ftp)://)" +
        // user:pass authentication
        "(?:\\S+(?::\\S*)?@)?" +
        "(?:" +
          "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
          "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
          "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
          "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
          "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
          "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
        "|" +
          "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
          "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
          "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
          "\\.?" +
        ")" +
        "(?::\\d{2,5})?" +
        "(?:[/?#]\\S*)?" +
      "$", "i"
    );

class Service {
  constructor(options) {
    this.options = options || {};
  }

  find(params) {
    return Promise.resolve([]);
  }

  create(data, params) {
    if(!this.validUrl(data.url)) {
      return Promise.reject({message: 'Please enter a valid URL'});
    }

    const url = data.url;
    var shortHash = this.getShortenedUrl(url);

    return new Promise(function(resolve, reject) {
      params.redisClient.get(url, function(error, reply) {
        //Check if the URL is already there, and if it is, then return the previously generated hash
        if(!reply) {
          params.redisClient.setex(url, DEFAULT_EXPIRATION, shortHash);
          params.redisClient.setex(shortHash, DEFAULT_EXPIRATION, url);
        }
        else {            
          resolve({
            hash: reply,
            short_url: REDIRECT_URL + reply
          });
        }
      });
    });
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

  validUrl(url) {
    return re_weburl.test(url);
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
