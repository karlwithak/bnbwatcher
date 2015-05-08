'use strict';

var Watcher = require('../model/watcher.js');
var Database = require('../util/database.js');
var Email = require('../util/email.js');

function archiver(result) {
  result.forEach(function (row) {
    var watcher = new Watcher();
    watcher.createFromDbRow(row);
    Email.sendArchiving(watcher);
    watcher.archive(false);
  });
}
var query = 'SELECT * FROM watchers WHERE checkin < current_date OR checkout < current_date';
Database.executeQuery(query, [], archiver);