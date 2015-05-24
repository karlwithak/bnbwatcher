'use strict';

var express = require('express');
var Utils = require('../util/utils.js');
var Watcher = require('../model/watcher.js');
var Database = require('../util/database.js');
var Crypt = require('../util/crypt.js');
var router = express.Router();

router.get('/', function(req, res, next) {
  var id = Utils.filterInt(req.query.id);
  var token = req.query.token;
  if (!id || !token) {
    console.log('cancel failed with req: ' + JSON.stringify(req.query));
    res.render('cancel', {success: false, noParams: true});
    return;
  } else if (token.length !== 40) {
    console.log('cancel failed with req: ' + JSON.stringify(req.query));
    res.render('cancel', {success: false});
    return;
  }
  var query = 'SELECT * FROM watchers WHERE id = $1 AND NOT archived';
  Database.executeQuery(query, [id], cancelWatcher);

  function cancelWatcher(result) {
    if (!result || result.length !== 1) {
      console.log('cancel failed with no matching watcher/already deleted');
      res.render('cancel', {success: false, alreadyDeleted: true});
      return;
    }
    var watcher = new Watcher();
    watcher.createFromDbRow(result[0]);
    var realToken = Crypt.getWatcherToken(watcher);
    if (realToken === token) {
      watcher.archive();
      res.render('cancel', {success: true});
    } else {
      console.log('cancel failed crypto check with tokens: ' + realToken + " " + token);
      res.render('cancel', {success: false});
    }
  }
});

module.exports = router;