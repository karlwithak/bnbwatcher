var Utils = require('../util/utils.js');

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
  this.roomIds = null;
}

Watcher.prototype.asArray = function () {
  var watcher = this;
  var array = this.properties.reduce(function (accumulator, field) {
    accumulator.push(watcher[field]);
    return accumulator;
  }, []);
  array.push(watcher.roomIds);
  return array;
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
  var query = 'INSERT INTO watchers ( ' + this.properties.toString() + ',room_ids ) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)';
  Utils.executeQuery(query, this.asArray());
};

Watcher.prototype.initRoomIds = function() {
  var watcher = this;
  watcher.roomIds = [];
  function callback(json) {
    var total_ids = json['listings_count'];
    json['listings'].forEach(function (listing) {
      watcher.roomIds.push(listing['listing']['id']);
    });
    if(watcher.roomIds.length < total_ids) {
      Utils.makeHttpsRequest('m.airbnb.com', watcher.buildQuery(watcher.roomIds.length), callback);
    } else {
      console.log(watcher.roomIds.length);
      watcher.commit();
    }
  }
  Utils.makeHttpsRequest('m.airbnb.com', this.buildQuery(watcher.roomIds.length), callback);
};

Watcher.prototype.buildQuery = function(offset) {
  var query = '/api/-/v1/listings/search?items_per_page=50&currency=USD'
      + Utils.addParam('location', this.location.replace(/ /g, '+'))
      + Utils.addParam('number_of_guests', this.number_of_guests)
      + Utils.addParam('price_min', this.price_min)
      + Utils.addParam('price_max', this.price_max)
      + Utils.addParam('min_bedrooms', this.min_bedrooms)
      + Utils.addParam('min_bathrooms', this.min_bathrooms / 10)
      + Utils.addParam('min_beds', this.min_beds)
      + Utils.addParam('offset', offset);
  if (this.room_type_entire) {
    query += Utils.addParam('room_types[]', 'Entire+room');
  }
  if (this.room_type_private) {
    query += Utils.addParam('room_types[]', 'Private+room');
  }
  if (this.room_type_shared) {
    query += Utils.addParam('room_types[]', 'Shared+room');
  }
  if (this.checkin !== null) {
    query += Utils.addParam('checkin', this.checkin.toJSON().substring(10, 0))
  }
  if (this.checkout !== null) {
    query += Utils.addParam('checkout', this.checkout.toJSON().substring(10, 0))
  }
  console.log(query);
  return query;
};

module.exports = Watcher;
