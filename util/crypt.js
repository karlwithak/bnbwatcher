var crypto = require('crypto');
var Utils = require('../util/utils.js');
var Watcher = require('../model/watcher.js');
var secretKey = Utils.serverInfo['secret_key'];

var Crypt = {};

var tokenProperties = [
    'id',
    'location',
    'email',
    'date_created'
];

Crypt.getWatcherToken = function(watcher) {
  var sha = crypto.createHash('sha1');
  sha.update('secretKey');
  tokenProperties.forEach(function (property) {
    var val = watcher[property];
    if (val === undefined || val === null) {
      console.error('tried to make token for incomplete watcher: ' + watcher);
      throw new Error;
    }
    sha.update(JSON.stringify(val));
  });
  return sha.digest('hex');
};

module.exports = Crypt;