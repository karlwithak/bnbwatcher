var pg = require('pg');
var conString = "postgres://airbnbwatch_user:airbnbwatch_pass@localhost/airbnbwatch_dev";

function addWatcher(formResult) {
  var client = new pg.Client(conString);
  client.connect (function(err) {
    if (err) {
      return console.error('could not connect to postgres', err);
    }
    client.query(
        'INSERT INTO watchers (email, city, price_min, price_max, num_guests, num_bedrooms,' +
        ' num_beds, num_baths, room_type_entire, room_type_private, room_type_shared, move_in,' +
        ' move_out) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
        [
            formResult.email,
            formResult.city,
            formResult.priceMin,
            formResult.priceMax,
            formResult.numGuests,
            formResult.numBedrooms,
            formResult.numBeds,
            formResult.numBaths,
            formResult.roomTypeEntire,
            formResult.roomTypePrivate,
            formResult.roomTypeShared,
            formResult.moveIn,
            formResult.moveOut
        ],
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