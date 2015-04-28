var pg = require('pg');
var yaml = require('js-yaml');
var fs = require('fs');
var serverInfo = yaml.safeLoad(fs.readFileSync('server_info.yml'));

var Utils = {};

Utils.filterInt = function(value) {
  if(/^([0-9]+)$/.test(value)) {
    return Number(value);
  }
  return null;
};

Utils.filterHalfInt = function(value) {
  if(/^([0-9]*)(\.5)?$/.test(value)) {
    return Number(value)
  }
  return null;
};

Utils.filterDate = function(value) {
  if (value === null || value.length < 1) return null;
  value = value.replace(/\+/g, ' ');
  value = new Date(value);
  if (isNaN(value.getTime())) {
    return null;
  } else return value;
};

Utils.clampInt = function(low, value, hi) {
  if (value === null) return null;
  return Math.max(low, Math.min(value, hi));
};

Utils.getServerInfo = function() {
  return serverInfo;
};

Utils.getClient = function() {
  var dbInfo = serverInfo['db_info'];

  return new pg.Client({
    user: dbInfo['user'],
    password: dbInfo['pass'],
    database: dbInfo['name'],
    host: dbInfo['host'],
    port: dbInfo['port']
  });
};

Utils.addParam = function(paramName, paramVal){
  if (paramName !== null && paramVal !== null) {
    return '&' + paramName + '=' + paramVal;
  }
  else return ''
};

module.exports = Utils;