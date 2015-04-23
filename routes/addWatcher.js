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
    formResult[field] = req.body[field] ? req.body[field] : null;
  });
  if (formResult.email === null || formResult.city === null) {
    res.send('fail: missing email or city: ' + formResult);
  } else {
    database.addWatcher(formResult);
    res.send('success: ' + req.body.city + " ");
  }
});

module.exports = router;
