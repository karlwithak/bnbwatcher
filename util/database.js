var pg = require('pg');
var conString = "postgres://airbnbwatch_user:airbnbwatch_pass@localhost/airbnbwatch_dev";

function addWatcher(fields, formResult) {
  var client = new pg.Client(conString);
  client.connect (function(err) {
    if (err) {
      return console.error('could not connect to postgres', err);
    }
    var query = 'INSERT INTO watchers ( ' + fields.toString() + ' ) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)';
    var values = fields.reduce(function (accumulator, field) {
      accumulator.push(formResult[field]);
      return accumulator;
    }, []);
    client.query(query, values,
        function (err, result) {
          if (err) {
            return console.error('error running query', err);
          }
          client.end();
        }
    );
  });
}

module.exports = {addWatcher : addWatcher};