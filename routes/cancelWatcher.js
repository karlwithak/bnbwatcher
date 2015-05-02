var express = require('express');
var Utils = require('../util/utils.js');
var ArchivedWatcher = require('../model/archivedWatcher.js');
var Database = require('../util/database.js');
var Crypt = require('../util/crypt.js');
var router = express.Router();

router.get('/', function(req, res, next) {
  var id = Utils.filterInt(req.query.id);
  var token = req.query.token;
  if (id === null || token.length !== 40) {
    res.send('bad params!');
    return;
  }
  query = "SELECT * FROM watchers WHERE id = $1";
  Database.executeQuery(query, [id], cancelWatcher);

  function cancelWatcher(result) {
    if (result.length !== 1) {
      res.send("no person found with that id");
      return;
    }
    var watcher = new ArchivedWatcher();
    watcher.createFromDbRow(result[0], true);
    var realToken = Crypt.getWatcherToken(watcher);
    if (realToken === token) {
      watcher.commit();
      res.send("good token");
    } else {
      res.send("bad token");
    }
  }
});

module.exports = router;