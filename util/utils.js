var https = require('https');
var fs = require('fs');

var Utils = {
  serverInfo : JSON.parse(fs.readFileSync('server_info.json'))
};

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


Utils.addParam = function(paramName, paramVal){
  if (paramName !== null && paramVal !== null) {
    return '&' + paramName + '=' + paramVal;
  }
  else return ''
};

Utils.makeHttpsRequest = function(host, path, callback) {
  var options = {
    host: host,
    port: 443,
    path: path,
    headers: { accept: '*/*' }
  };
  https.get(options, function(response) {
    var body = '';

    response.on('data', function(chunk) {
      body += chunk;
    });

    response.on('end', function() {
      callback(JSON.parse(body));
    });
  });
};

Utils.urlifyDate = function(date) {
  return(date.toJSON().substring(10, 0));
};

Utils.arrayDiff = function(arr1, arr2) {
  return arr1.filter(function(i) {
    return arr2.indexOf(i) < 0;
  });
};

module.exports = Utils;