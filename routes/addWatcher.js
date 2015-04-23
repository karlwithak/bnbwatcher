var express = require('express');
var router = express.Router();
var database = require('../util/database.js');

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
    'roomType',
    'email'
  ];
  var formResult = {};
  fields.forEach(function (field) {
    formResult[field] = req.body[field] ? req.body[field].trim() : null;
  });
  if (formResult.email === null || formResult.city === null) {
    res.send('fail: missing email or city: ' + formResult);
  } else {
    validateForm(formResult);
    database.addWatcher(formResult);
    res.send('success: ' + req.body.city + " ");
  }
});

function validateForm(formResult) {
  formResult.priceMin = filterInt(formResult.priceMin);
  if (formResult.priceMin === null) {
    formResult.priceMin = 0;
  }
  formResult.priceMax = filterInt(formResult.priceMax);
  if (formResult.priceMax === null) {
    formResult.priceMax = 2147483646;
  }
  if (formResult.priceMax !== null && formResult.priceMin !== null) {
    formResult.priceMax = Math.max(formResult.priceMin, formResult.priceMax);
  }
}

function filterInt(value) {
    if(/^(\+)?([0-9]+)$/.test(value)) {
      return Number(value);
    }
    return null;
}

module.exports = router;
