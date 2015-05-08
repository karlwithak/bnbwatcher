var Utils = require('../util/utils.js');
var Database = require('../util/database.js');
var Email = require('../util/email.js');

var MAX_INT = 2147483646;
var MAX_IDS = 1000;

function Watcher() {
  this.id = null;
  this.room_ids = null;
  this.date_created = null;
}

Watcher.properties = [
    'email',
    'location',
    'price_min',
    'price_max',
    'number_of_guests',
    'min_bedrooms',
    'min_beds',
    'min_bathrooms',
    'room_type_entire',
    'room_type_private',
    'room_type_shared',
    'checkin',
    'checkout',
    'currency'
];

Watcher.prototype.asArray = function () {
  return Watcher.properties.map(function (field) {
    return this[field];
  }, this);
};

Watcher.prototype.createFromDbRow = function(row) {
  Watcher.properties.forEach(function (field) {
    this[field] = row[field];
  }, this);
  this.id = row.id;
  this.room_ids = row.room_ids;
  this.date_created = row.date_created;
};

Watcher.prototype.createFromForm = function(form) {
  Watcher.properties.forEach(function (field) {
    this[field] = form[field] ? form[field].trim() : null;
  }, this);
  this.validateFromForm();
  var watcher = this;
  this.initRoomIds(function () {
    watcher.saveToDb();
  });
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

  this.currency = this.currency ? this.currency : null;
};

Watcher.prototype.saveToDb = function() {
  var watcher = this;
  var columns = Watcher.properties.concat(['room_ids']);
  var query = 'INSERT INTO watchers (' + columns + ') ' +
      'VALUES (' + Database.makeParamList(columns.length) + ') ' +
      'RETURNING id, date_created';
  var values = this.asArray().concat([this.room_ids]);
  Database.executeQuery(query, values, function (result) {
    var newId = result[0].id;
    var date_created = result[0].date_created;
    if (!newId || !date_created) {
      console.error('invalid id returned from watcher insertion: ' + result);
      return;
    }
    watcher.id = newId;
    watcher.date_created = date_created;
    Email.sendCreatedWatcher(watcher);
  });
};

Watcher.prototype.archive = function(user_archived) {
  var columns = Watcher.properties.concat(['id', 'date_created', 'user_archived']);
  var query = 'INSERT INTO archived_watchers (' + columns + ') ' +
      'VALUES (' + Database.makeParamList(columns.length) + ')';
  var values = this.asArray().concat(this.id, this.date_created, user_archived);
  Database.executeQuery(query, values);
  query = 'DELETE FROM watchers WHERE id = $1';
  Database.executeQuery(query, [this.id]);
};

Watcher.prototype.updateRoomIds = function() {
  var query = 'UPDATE watchers SET room_ids = $1 ' +
      'WHERE id = $2';
  Database.executeQuery(query, [this.room_ids, this.id]);
};

Watcher.prototype.initRoomIds = function(callback) {
  var watcher = this;
  watcher.room_ids = [];
  function fetcher(json) {
    var total_ids = json['listings_count'];
    json['listings'].forEach(function (listing) {
      watcher.room_ids.push(listing['listing']['id']);
    });
    if (watcher.room_ids.length < total_ids && watcher.room_ids.length < MAX_IDS) {
      Utils.makeHttpsRequest('m.airbnb.com', watcher.buildQuery(watcher.room_ids.length), fetcher);
    } else {
      if (callback) {
        callback();
      }
    }
  }
  Utils.makeHttpsRequest('m.airbnb.com', this.buildQuery(watcher.room_ids.length), fetcher);
};

Watcher.prototype.buildQuery = function(offset) {
  var query = '/api/-/v1/listings/search?items_per_page=50'
      + Utils.addParam('location', this.location.replace(/ /g, '+'))
      + Utils.addParam('number_of_guests', this.number_of_guests)
      + Utils.addParam('price_min', this.price_min)
      + Utils.addParam('price_max', this.price_max)
      + Utils.addParam('min_bedrooms', this.min_bedrooms)
      + Utils.addParam('min_beds', this.min_beds)
      + Utils.addParam('currency', this.currency)
      + Utils.addParam('offset', offset);
  if (this.min_bathrooms !== null) {
    query += Utils.addParam('min_bathrooms', this.min_bathrooms / 10)
  }
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
    query += Utils.addParam('checkin', Utils.urlifyDate(this.checkin))
  }
  if (this.checkout !== null) {
    query += Utils.addParam('checkout', Utils.urlifyDate(this.checkout))
  }
  return query;
};

module.exports = Watcher;
