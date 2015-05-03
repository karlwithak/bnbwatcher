var express = require('express');
var router = express.Router();
var Watcher = require('../model/watcher.js');

/* Post new watcher. */
router.post('/', function(req, res, next) {
  if (req.body['email'] === null
      || req.body['email'].length > 254
      || req.body['email'].length < 5
      || req.body['location'] === null
      || req.body['location'].length > 1024
      || req.body['location'].length < 1)
  {
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
