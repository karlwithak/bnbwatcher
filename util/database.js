var pg = require('pg');
var Utils = require('../util/utils.js');
var dbInfo = Utils.serverInfo['db_info'];

var Database = {};

Database.executeQuery = function(query, data, callback) {
  var client = Database.getClient();
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

Database.getClient = function() {
  return new pg.Client({
    user: dbInfo['user'],
    password: dbInfo['pass'],
    database: dbInfo['name'],
    host: dbInfo['host'],
    port: dbInfo['port']
  });
};

Database.makeParamList = function(size) {
  var list = '';
  for (var i = 1; i <= size; i++) {
    list += '$' + i + ',';
  }
  return list.slice(0, -1);
};

module.exports = Database;