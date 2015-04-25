var express = require('express');
var router = express.Router();
var database = require('../util/database.js');
var MAX_INT = 2147483646;

/* Post new watcher. */
router.post('/', function(req, res, next) {
  var fields = [
    'city',
    'moveIn',
    'moveOut',
    'numGuests',
    'priceMin',
    'priceMax',
    'numBedrooms',
    'numBaths',
    'numBeds',
    'roomTypeEntire',
    'roomTypePrivate',
    'roomTypeShared',
    'email'
  ];
  var formResult = {};
  fields.forEach(function (field) {
    formResult[field] = req.body[field] ? req.body[field].trim() : null;
  });
  if (formResult.email === null || formResult.city === null) {
    res.send('fail: missing email or city: ' + formResult);
  } else {
    var valid = validateForm(formResult);
    if (!valid) {
      res.send('fail: form did not validate');
      return;
    }
    database.addWatcher(formResult);
    res.send('success: ' + req.body.city + " ");
  }
});

function validateForm(formResult) {
  formResult.priceMin = filterInt(formResult.priceMin);
  formResult.priceMin = clampInt(0, formResult.priceMin, MAX_INT);

  formResult.priceMax = filterInt(formResult.priceMax);
  formResult.priceMax = clampInt(0, formResult.priceMax, MAX_INT);

  if (formResult.email == null
      ||formResult.email.length > 254
      || formResult.email.length < 5) return false;
  if (formResult.city == null
      ||formResult.city.length > 1024
      || formResult.city.length < 1) return false;

  formResult.numGuests = filterInt(formResult.numGuests);
  formResult.numGuests = clampInt(1, formResult.numGuests, 16);

  formResult.numBedrooms = filterInt(formResult.numBedrooms);
  formResult.numBedrooms = clampInt(1, formResult.numBedrooms, 10);

  formResult.numBeds = filterInt(formResult.numBeds);
  formResult.numBeds = clampInt(1, formResult.numBeds, 16);

  formResult.numBaths = filterHalfInt(formResult.numBaths);
  formResult.numBaths = clampInt(0, formResult.numBaths, 8);
  if (formResult.numBaths !== null) {
    // I don't want to deal with decimal numbers, so multiply by 10 to give us an int in
    // [0, 5, 10, ... , 80] hopefully I remember to convert back whenever I use it.
    formResult.numBaths *= 10;
  }

  formResult.roomTypeEntire = Boolean(formResult.roomTypeEntire);
  formResult.roomTypePrivate = Boolean(formResult.roomTypePrivate);
  formResult.roomTypeShared = Boolean(formResult.roomTypeShared);

  formResult.moveIn = filterDate(formResult.moveIn);
  formResult.moveOut = filterDate(formResult.moveOut);

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
