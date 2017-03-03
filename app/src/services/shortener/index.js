'use strict';

const re_weburl = require('/root/wize/app/public/regexp').re_weburl;

const hooks = require('./hooks');
const crypto = require('crypto');
const secret = '88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589';

const URL_SHORTENER_DIGITS = 7;
const BASE_CHARACTER_SET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const REDIRECT_URL = 'http://104.131.112.17/r/';

const DEFAULT_EXPIRATION = 24 * 60 * 60;

class Service {
  setup(app) {
    this.app = app;
  }

  constructor(options) {
    this.options = options || {};
  }

  find(params) {
    return Promise.resolve([]);
  }

  create(data, params) {
    var that = this;

    const urlsService = this.app.service('urls');

    if(!this.validUrl(data.url)) {
      return Promise.reject({message: 'Please enter a valid URL'});
    }

    const url = data.url;
    const customHash = data.custom_hash.toString('ascii');

    return new Promise(function(resolve, reject) {      
      if(customHash) {
        params.redisClient.get(customHash, function(error, reply) {
          if(!reply) {
              //Custom Hash is not there, we can insert it
              params.redisClient.set(url, customHash);
              params.redisClient.set(customHash, url);

              urlsService.create({
                url: url,
                hash: customHash
              }).then(function(res){
                  console.log(res.$options);
              });

              resolve({
                hash: customHash,
                short_url: REDIRECT_URL + customHash
              });
            }
            else {
              //Custom Hash is there, we have to error out
              const suggestion = customHash + '_' + that.getShortenedUrl(customHash);
              
              resolve({
                message: 'That key is already there :( ... May I suggest: ' + suggestion + '?',
                suggestion: suggestion
              });
            }
          });
      }
      else {
        params.redisClient.get(url, function(error, reply) {
          var shortHash = that.getShortenedUrl(url);
          
          if(!reply) {
              //URL is not there, return new hash
              params.redisClient.set(url, shortHash);
              params.redisClient.set(shortHash, url);

              urlsService.create({
                url: url,
                hash: shortHash
              }).then(function(res){
                  console.log(res.$options);
              });

              resolve({
                hash: shortHash,
                short_url: REDIRECT_URL + shortHash
              });
            }
            else {
              //URL is there, return old hash
              resolve({
                hash: reply,
                short_url: REDIRECT_URL + reply
              });
            }
          });
        }
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
