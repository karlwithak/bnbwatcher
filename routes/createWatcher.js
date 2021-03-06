'use strict';

var express = require('express');
var router = express.Router();
var Watcher = require('../model/watcher.js');

/* Post new watcher. */
router.post('/', function(req, res, next) {
  if (!req.body['email'] ||
      req.body['email'].length > 254 ||
      req.body['email'].length < 5 ||
      !req.body['location'] ||
      req.body['location'].length > 1024 ||
      req.body['location'].length < 1 ||
      !req.body['checkin'])
  {
    console.log('create watcher failed with form: ' + JSON.stringify(req.body));
    res.render('create', {success: false});
  } else {
    var watcher = new Watcher();
    watcher.createFromForm(req.body);
    res.render('create', {success: true});
  }
});

router.get('/', function(req, res, next) {
  res.render('create', {success: false});
});

module.exports = router;
