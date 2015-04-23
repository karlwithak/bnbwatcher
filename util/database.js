var pg = require('pg');
var conString = "postgres://airbnbwatch_user:airbnbwatch_pass@localhost/airbnbwatch_dev";

function addWatcher(formResult) {
  var client = new pg.Client(conString);
  client.connect (function(err) {
    if (err) {
      return console.error('could not connect to postgres', err);
    }
    client.query('INSERT INTO watchers (email, city, price_min, price_max) ' +
                 'VALUES ($1, $2, $3, $4)',
        [formResult.email, formResult.city, formResult.priceMin, formResult.priceMax],
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