'use strict';

var express = require('express');
var Watcher = require('../model/watcher.js');
var Database = require('../util/database.js');
var Crypt = require('../util/crypt.js');
var router = express.Router();

router.get('/', function(req, res, next) {
  var email = req.query.email;
  var token = req.query.token;
  if (!email || !token) {
    res.render('unsubscribe', {success: false, noParams: true});
    return;
  } else if (email.length > 254 || token.length !== 40) {
    res.render('unsubscribe', {success: false});
    return;
  }

  var realToken = Crypt.getUnsubscribeToken(email);
  if (realToken === token) {
    var query =
        'UPDATE watchers ' +
        'SET (archived, date_archived, room_ids) = (TRUE, NOW(), NULL) ' +
        'WHERE email = $1 AND NOT archived';
    Database.executeQuery(query, [email]);
    res.render('unsubscribe', {success: true, email: email});
  } else {
    res.render('unsubscribe', {success: false});
  }
});

module.exports = router;