var pg = require('pg');
var yaml = require('js-yaml');
var fs = require('fs');
var serverInfo = yaml.safeLoad(fs.readFileSync('server_info.yml'));
var https = require('https');

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

Utils.executeQuery = function(query, data, callback) {
  var client = Utils.getClient();
  client.connect(function(err) {
      if (err) {
        return console.error('could not connect to postgres', err);
      }

    client.query(query, data,
        function (err, result) {
          if (err) {
            return console.error('error running query', err);
          }
          if (callback) {
            callback(result.rows);
          }
          client.end();
        }
    );
  });
};

Utils.arrayDiff = function(arr1, arr2) {
  return arr1.filter(function(i) {
    return arr2.indexOf(i) < 0;
  });
};

module.exports = Utils;