var emailjs = require('emailjs');
var Utils = require('../util/utils.js');

var server = emailjs.server.connect({
  host: 'localhost',
  port: 25
});

Email = {};

Email.sendNewRooms = function(watcher, newIds) {
  var text = "Here are your new rooms: \n";
  newIds.forEach(function (roomId) {
    text += buildRoomLink(watcher, roomId) + "\n";
  });
  var subject = newIds.length + ' new rooms found in ' + watcher.location;

  server.send({
    text: text,
    from: 'test@bnbwatcher.com',
    to: watcher.email,
    subject: subject
  }, function(err, message) {
    if (err) {
      console.log(err);
    }
  });
};

Email.sendArchivingWatcher = function(archivedWatcher) {
  var text = "You will no longer be getting alerts for this alert. Click here to make a new one";
  var subject = "Your watcher for " + archivedWatcher.location + " has expired!";
  server.send({
    text: text,
    from: 'test@bnbwatcher.com',
    to: archivedWatcher.email,
    subject: subject
  }, function(err, message) {
    if (err) {
      console.log(err);
    }
  });
};

function buildRoomLink(watcher, roomId) {
  var link = "https://www.airbnb.com/rooms/" + roomId;
  if (watcher.checkin !== null) {
    link += "?checkin=" + Utils.urlifyDate(watcher.checkin);
  }
  if (watcher.checkin !== null && watcher.checkout !== null) {
    link += "&checkout=" + Utils.urlifyDate(watcher.checkout);
  }
  return link;
}

module.exports = Email;