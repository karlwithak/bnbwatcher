var Utils = require('../util/utils.js');
var https = require('https');

var MAX_INT = 2147483646;

function Watcher() {
  this.properties = [
    'location',
    'checkin',
    'checkout',
    'number_of_guests',
    'price_min',
    'price_max',
    'min_bedrooms',
    'min_bathrooms',
    'min_beds',
    'room_type_entire',
    'room_type_private',
    'room_type_shared',
    'email'
  ];
}

Watcher.prototype.asArray = function () {
  var watcher = this;
  return this.properties.reduce(function (accumulator, field) {
    accumulator.push(watcher[field]);
    return accumulator;
  }, []);
};

Watcher.prototype.loadFromForm = function(form) {
  var watcher = this;
  this.properties.forEach(function (field) {
    watcher[field] = form[field] ? form[field].trim() : null;
  });
  this.validateFromForm();
};

Watcher.prototype.validateFromForm = function() {
  this.price_min = Utils.filterInt(this.price_min);
  this.price_min = Utils.clampInt(0, this.price_min, MAX_INT);

  this.price_max = Utils.filterInt(this.price_max);
  this.price_max = Utils.clampInt(0, this.price_max, MAX_INT);

  this.number_of_guests = Utils.filterInt(this.number_of_guests);
  this.number_of_guests = Utils.clampInt(1, this.number_of_guests, 16);

  this.min_bedrooms = Utils.filterInt(this.min_bedrooms);
  this.min_bedrooms = Utils.clampInt(1, this.min_bedrooms, 10);

  this.min_beds = Utils.filterInt(this.min_beds);
  this.min_beds = Utils.clampInt(1, this.min_beds, 16);

  this.min_bathrooms = Utils.filterHalfInt(this.min_bathrooms);
  this.min_bathrooms = Utils.clampInt(0, this.min_bathrooms, 8);
  if (this.min_bathrooms !== null) {
    // I don't want to deal with decimal numbers, so multiply by 10 to give us an int in
    // [0, 5, 10, ... , 80] hopefully I remember to convert back whenever I use it.
    this.min_bathrooms *= 10;
  }

  this.room_type_entire = Boolean(this.room_type_entire);
  this.room_type_private = Boolean(this.room_type_private);
  this.room_type_shared = Boolean(this.room_type_shared);

  this.checkin = Utils.filterDate(this.checkin);
  this.checkout = Utils.filterDate(this.checkout);
};

Watcher.prototype.commit = function() {
  var client = Utils.getClient();
  var watcher = this;
  client.connect (function(err) {
    if (err) {
      return console.error('could not connect to postgres', err);
    }
    var query = 'INSERT INTO watchers ( ' + watcher.properties.toString() + ' ) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)';
    client.query(query, watcher.asArray(),
        function (err, result) {
          if (err) {
            return console.error('error running query', err);
          }
          client.end();
        }
    );
  });
};

Watcher.prototype.initRoomIds = function() {
  var options = {
    host: 'm.airbnb.com',
    port: 443,
    path: this.buildQuery(),
    headers: {
      accept: '*/*'
    }
  };

  https.get(options, function(response) {
    console.log(response.statusCode);
    var body = '';

    response.on('data', function(chunk) {
      body += chunk;
    });

    response.on('end', function() {
      var json = JSON.parse(body);
      console.log(json.listings_count);
    });
  });
  //TODO: check if we need to make more quests to get all the data
};

Watcher.prototype.buildQuery = function() {
  var query = '/api/-/v1/listings/search?&items_per_page=50&currency=USD'
      + Utils.addParam('location', this.location.replace(/ /g, '+'))
      + Utils.addParam('checkin', this.checkin.toJSON().substring(10, 0))
      + Utils.addParam('checkout', this.checkout.toJSON().substring(10, 0))
      + Utils.addParam('number_of_guests', this.number_of_guests)
      + Utils.addParam('price_min', this.price_min)
      + Utils.addParam('price_max', this.price_max)
      + Utils.addParam('min_bedrooms', this.min_bedrooms)
      + Utils.addParam('min_bathrooms', this.min_bathrooms / 10)
      + Utils.addParam('min_beds', this.min_beds);
  if (this.room_type_entire) {
    query += Utils.addParam('room_types[]', 'Entire+room');
  }
  if (this.room_type_private) {
    query += Utils.addParam('room_types[]', 'Private+room');
  }
  if (this.room_type_shared) {
    query += Utils.addParam('room_types[]', 'Shared+room');
  }
  console.log(query);
  return query;
};

module.exports = Watcher;
