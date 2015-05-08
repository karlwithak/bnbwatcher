'use strict';

var crypto = require('crypto');
var Utils = require('../util/utils.js');
var Watcher = require('../model/watcher.js');
var secretKey = Utils.serverInfo['secret_key'];

var Crypt = {};

var watcherTokenProperties = [
    'id',
    'location',
    'email',
    'date_created'
];

Crypt.getWatcherToken = function(watcher) {
  var hmac = crypto.createHmac('sha1', secretKey);
  watcherTokenProperties.forEach(function (property) {
    var val = watcher[property];
    if (val === undefined || val === null) {
      console.error('tried to make token for incomplete watcher: ' + watcher);
    }
    hmac.update(JSON.stringify(val));
  });
  return hmac.digest('hex');
};

Crypt.getUnsubscribeToken = function(email) {
  var hmac = crypto.createHmac('sha1', secretKey);
  if (!email || email.length < 5) {
    console.error('tried to make token for invalid email: ' + email);
  }
  hmac.update(email);
  return hmac.digest('hex');
};

module.exports = Crypt;