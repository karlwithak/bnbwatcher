var emailjs = require('emailjs');
var Utils = require('../util/utils.js');

var server = emailjs.server.connect({
  host: 'localhost',
  port: 25
});

Email = {};

Email.send = function(watcher, newIds) {
  var text = "Here are your new rooms: \n";
  newIds.forEach(function (roomId) {
    text += buildRoomLink(watcher, roomId) + "\n";
  });
  server.send({
    text: text,
    from: 'test@hrynuik.com',
    to: watcher.email,
    subject: newIds.length + ' new rooms found in ' + watcher.location
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