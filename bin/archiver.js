var Utils = require('../util/utils.js');
var ArchivedWatcher = require('../model/archivedWatcher.js');
var Database = require('../util/database.js');
var Email = require('../util/email.js');

function archiver(result) {
  result.forEach(function (row) {
    var archivedWatcher = new ArchivedWatcher();
    archivedWatcher.createFromDbRow(row, false);
    Email.sendArchivingWatcher(archivedWatcher);
    archivedWatcher.commit();
  });
}
var query = 'SELECT * FROM watchers WHERE checkin < current_date OR checkout < current_date';
Database.executeQuery(query, [], archiver);