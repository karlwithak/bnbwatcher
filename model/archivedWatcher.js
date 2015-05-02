var Utils = require('../util/utils.js');
var Database = require('../util/database.js');
var Watcher = require('../model/watcher.js');

function ArchivedWatcher() {
  this.user_archived = null;
  this.properties = Watcher.properties.concat(['date_created'], ['id']);
}

ArchivedWatcher.prototype.getAllProperties = function() {
  var properties = this.properties;
  return properties.concat(['user_archived']);
};

ArchivedWatcher.prototype.asArray = function () {
  var archivedWatcher = this;
  var array = this.properties.reduce(function (accumulator, field) {
    accumulator.push(archivedWatcher[field]);
    return accumulator;
  }, []);
  array.push(archivedWatcher.user_archived);
  return array;
};

ArchivedWatcher.prototype.createFromDbRow = function(row, user_archived) {
  var archivedWatcher = this;
  this.properties.forEach(function (field) {
    archivedWatcher[field] = row[field];
  });
  this.user_archived = user_archived;
};

ArchivedWatcher.prototype.commit = function() {
  var query = 'INSERT INTO archived_watchers (' + this.getAllProperties() + ') ' +
      'VALUES (' + Database.makeParamList(this.getAllProperties().length) + ')';
  Database.executeQuery(query, this.asArray());
  query = 'DELETE FROM watchers WHERE id = $1';
  Database.executeQuery(query, [this.id]);
};

module.exports = ArchivedWatcher;
