var Utils = require('../util/utils.js');
var Watcher = require('../model/watcher.js');


function updater(result) {
  result.forEach(function (row) {
    var watcher = new Watcher();
    watcher.loadFromDbRow(row);
    var oldIds = watcher.room_ids;
    watcher.room_ids = null;
    watcher.initRoomIds(checkForNewIds);
    function checkForNewIds() {
      var newIds = watcher.room_ids;
      console.log('new ids: ' + watcher.location + Utils.arrayDiff(newIds, oldIds));
    }
  });
}
var query = 'SELECT * FROM watchers';
Utils.executeQuery(query, [], updater);

