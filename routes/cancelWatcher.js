var express = require('express');
var Utils = require('../util/utils.js');
var Watcher = require('../model/watcher.js');
var Database = require('../util/database.js');
var Crypt = require('../util/crypt.js');
var router = express.Router();

router.get('/', function(req, res, next) {
  var id = Utils.filterInt(req.query.id);
  var token = req.query.token;
  if (id === null || token.length !== 40) {
    res.render('cancel', {success: false});
    return;
  }
  query = 'SELECT * FROM watchers WHERE id = $1';
  Database.executeQuery(query, [id], cancelWatcher);

  function cancelWatcher(result) {
    if (result.length !== 1) {
      res.render('cancel', {success: false});
      return;
    }
    var watcher = new Watcher();
    watcher.createFromDbRow(result[0]);
    var realToken = Crypt.getWatcherToken(watcher);
    if (realToken === token) {
      watcher.archive(true);
      res.render('cancel', {success: true});
    } else {
      res.render('cancel', {success: false});
    }
  }
});

module.exports = router;