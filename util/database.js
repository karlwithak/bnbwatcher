var pg = require('pg');
var fs = require('fs');
var yaml = require('js-yaml');
var dbInfo = yaml.safeLoad(fs.readFileSync('server_info.yml'))['db_info'];

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

module.exports = Database;