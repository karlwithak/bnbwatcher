var Utils = require('../util/utils.js');
var Watcher = require('../model/watcher.js');
var Database = require('../util/database.js');
var Email = require('../util/email.js');

function updater(result) {
  result.forEach(function (row) {
    var watcher = new Watcher();
    watcher.createFromDbRow(row);
    var oldIds = watcher.room_ids;
    watcher.room_ids = null;
    watcher.initRoomIds(checkForNewIds);
    function checkForNewIds() {
      var currentIds = watcher.room_ids;
      var newIds = Utils.arrayDiff(currentIds, oldIds);
      if (newIds.length > 0) {
        Email.sendNewRooms(watcher, newIds);
        watcher.updateRoomIds();
      }
    }
  });
}
var query = 'SELECT * FROM watchers';
Database.executeQuery(query, [], updater);
