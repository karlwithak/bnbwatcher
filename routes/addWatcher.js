var express = require('express');
var router = express.Router();
var database = require('../util/database.js');
var MAX_INT = 2147483646;

/* Post new watcher. */
router.post('/', function(req, res, next) {
  var fields = [
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
  var formResult = {};
  fields.forEach(function (field) {
    formResult[field] = req.body[field] ? req.body[field].trim() : null;
  });
  if (formResult.email === null || formResult.location === null) {
    res.send('fail: missing email or location: ' + formResult);
  } else {
    var valid = validateForm(formResult);
    if (!valid) {
      res.send('fail: form did not validate');
      return;
    }
    database.addWatcher(fields, formResult);
    res.send('success: ' + req.body.location + " ");
  }
});

function validateForm(formResult) {
  formResult.price_min = filterInt(formResult.price_min);
  formResult.price_min = clampInt(0, formResult.price_min, MAX_INT);

  formResult.price_max = filterInt(formResult.price_max);
  formResult.price_max = clampInt(0, formResult.price_max, MAX_INT);

  if (formResult.email == null
      ||formResult.email.length > 254
      || formResult.email.length < 5) return false;
  if (formResult.location == null
      ||formResult.location.length > 1024
      || formResult.location.length < 1) return false;

  formResult.number_of_guests = filterInt(formResult.number_of_guests);
  formResult.number_of_guests = clampInt(1, formResult.number_of_guests, 16);

  formResult.min_bedrooms = filterInt(formResult.min_bedrooms);
  formResult.min_bedrooms = clampInt(1, formResult.min_bedrooms, 10);

  formResult.min_beds = filterInt(formResult.min_beds);
  formResult.min_beds = clampInt(1, formResult.min_beds, 16);

  formResult.min_bathrooms = filterHalfInt(formResult.min_bathrooms);
  formResult.min_bathrooms = clampInt(0, formResult.min_bathrooms, 8);
  if (formResult.min_bathrooms !== null) {
    // I don't want to deal with decimal numbers, so multiply by 10 to give us an int in
    // [0, 5, 10, ... , 80] hopefully I remember to convert back whenever I use it.
    formResult.min_bathrooms *= 10;
  }

  formResult.room_type_entire = Boolean(formResult.room_type_entire);
  formResult.room_type_private = Boolean(formResult.room_type_private);
  formResult.room_type_shared = Boolean(formResult.room_type_shared);

  formResult.checkin = filterDate(formResult.checkin);
  formResult.checkout = filterDate(formResult.checkout);

  return true;
}

function filterInt(value) {
    if(/^([0-9]+)$/.test(value)) {
      return Number(value);
    }
    return null;
}

function filterHalfInt(value) {
  if(/^([0-9]*)(\.5)?$/.test(value)) {
    return Number(value)
  }
  return null;
}

function filterDate(value) {
  if (value === null || value.length < 1) return null;
  value = value.replace(/\+/g, ' ');
  value = new Date(value);
  if (isNaN(value.getTime())) {
    return null;
  } else return value;
}

function clampInt(low, value, hi) {
  if (value === null) return null;
  return Math.max(low, Math.min(value, hi));
}

module.exports = router;
