'use strict';

var Utils = require('../util/utils.js');
var Watcher = require('../model/watcher.js');
var Database = require('../util/database.js');
var Email = require('../util/email.js');

function updater(result) {
  console.log(new Date().toLocaleString() + " Starting roomIdsUpdater");
  result.forEach(function (row) {
    var watcher = new Watcher();
    watcher.createFromDbRow(row);
    var oldIds = watcher.room_ids;
    watcher.room_ids = null;
    watcher.initRoomIds(checkForNewIds);
    function checkForNewIds() {
      var newRooms = filterNewRooms(watcher.room_names, watcher.room_ids, oldIds);
      if (newRooms.ids.length > 0) {
        console.log("found " + newRooms.ids.length + " new rooms for watcher: " + watcher.id);
        Email.sendNewRooms(watcher, newRooms.ids, newRooms.names);
        watcher.room_ids = Utils.arrayUnion(watcher.room_ids, oldIds);
        watcher.updateRoomIds();
      }
    }
  });
}

function filterNewRooms(roomNames, currentIds, oldIds) {
  var newNames = [];
  var newIds = [];
  currentIds.forEach(function(id, index) {
    if (oldIds.indexOf(id) < 0) {
      newIds.push(id);
      newNames.push(roomNames[index]);
    }
  });
  return {
    ids: newIds,
    names: newNames
  };
}

var query = 'SELECT * FROM watchers WHERE NOT archived';
Database.executeQuery(query, [], updater);
