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
    'numBathrooms',
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
    console.log(formResult);
    //database.addWatcher(formResult);
    res.send('success: ' + req.body.city + " ");
  }
});

function validateForm(formResult) {
  formResult.priceMin = filterInt(formResult.priceMin, 0);
  formResult.priceMin = clampInt(0, formResult.priceMin, MAX_INT);

  formResult.priceMax = filterInt(formResult.priceMax, MAX_INT);
  formResult.priceMax = clampInt(0, formResult.priceMax, MAX_INT);

  if (formResult.email.length > 254 || formResult.email.length < 5) return false;
  if (formResult.city.length > 1024 || formResult.email.length < 1) return false;

  formResult.numGuests = filterInt(formResult.numGuests, 1);
  formResult.numGuests = clampInt(1, formResult.numGuests, 16);

  formResult.numBedrooms = filterInt(formResult.numBedrooms, 1);
  formResult.numBedrooms = clampInt(1, formResult.numBedrooms, 10);

  formResult.numBeds = filterInt(formResult.numBeds, 1);
  formResult.numBeds = clampInt(1, formResult.numBeds, 16);

  formResult.numBathrooms = filterHalfInt(formResult.numBathrooms, 1);
  formResult.numBathrooms = clampInt(0, formResult.numBathrooms, 8);

  formResult.roomTypeEntire = Boolean(formResult.roomTypeEntire);
  formResult.roomTypePrivate = Boolean(formResult.roomTypePrivate);
  formResult.roomTypeShared = Boolean(formResult.roomTypeShared);

  return true;
}

function filterInt(value, defaultVal) {
    if(/^([0-9]+)$/.test(value)) {
      return Number(value);
    }
    return defaultVal;
}

function filterHalfInt(value) {
  if(/^([0-9]*)(\.5)?$/.test(value)) {
    return Number(value)
  }
  return 0;
}

function clampInt(low, value, hi) {
  return Math.max(low, Math.min(value, hi));
}

module.exports = router;
