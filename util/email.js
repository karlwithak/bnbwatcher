var emailjs = require('emailjs');
var Utils = require('../util/utils.js');
var Crypt = require('../util/crypt.js');

var server = emailjs.server.connect({
  host: 'localhost',
  port: 25
});

Email = {};

Email.sendNewRooms = function(watcher, newIds) {
  var text = "Here are your new rooms: \n";
  newIds.forEach(function (roomId) {
    text += buildRoomLink(watcher, roomId) + "\n\n";
  });
  text += buildCancelLink(watcher);
  var subject = newIds.length + ' new rooms found in ' + watcher.location;
  sendEmail(text, watcher.email, subject);
};

Email.sendArchivingWatcher = function(watcher) {
  var text = "You will no longer be getting alerts for this alert. Click here to make a new one";
  var subject = "Your watcher for " + watcher.location + " has expired!";
  sendEmail(text, watcher.email, subject);
};

Email.sendCreatingWatcher = function(watcher) {
  var text = "You have created a new watcher at bnbwatcher.com !\n"
      + buildCancelLink(watcher);
  var subject = "Watcher for " + watcher.location + " successfully created!";
  sendEmail(text, watcher.email, subject);
};

function sendEmail(text, to, subject) {
  server.send({
    text: text,
    from: 'test@bnbwatcher.com',
    to: to,
    subject: subject
  }, function(err, message) {
    if (err) {
      console.log(err);
    }
  });
}

function buildCancelLink(watcher) {
  return "To cancel this watcher click here: http://104.236.215.4:3000/cancel?"
      + "id=" + watcher.id
      + "&token=" + Crypt.getWatcherToken(watcher)
      + "\n";
}

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