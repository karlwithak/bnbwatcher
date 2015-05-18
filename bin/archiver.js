'use strict';

var Watcher = require('../model/watcher.js');
var Database = require('../util/database.js');
var Email = require('../util/email.js');

function archiver(result) {
  console.log(new Date().toLocaleString() + " Starting archiver");
  result.forEach(function (row) {
    var watcher = new Watcher();
    watcher.createFromDbRow(row);
    console.log("archiving watcher with id: " + watcher.id);
    Email.sendArchiving(watcher);
    watcher.archive();
  });
}
var query =
    'SELECT * FROM watchers ' +
    'WHERE (checkin < current_date OR checkout < current_date) ' +
    'AND NOT archived';
Database.executeQuery(query, [], archiver);