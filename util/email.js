var emailjs = require('emailjs');
var Utils = require('../util/utils.js');
var Crypt = require('../util/crypt.js');
var jade = require('jade');
var fs = require('fs');
var juice = require('juice');

var server = emailjs.server.connect({
  host: 'localhost',
  port: 25
});

var jadeOptions = {};
var juiceOptions = {};

Email = {
  newRoomsGenerator: jade.compileFile('./emails/newRooms.jade', jadeOptions),
  archivingGenerator: jade.compileFile('./emails/archiving.jade', jadeOptions),
  createdWatcherGenerator: jade.compileFile('./emails/createdWatcher.jade', jadeOptions),
  css: fs.readFileSync('./public/css/email.css', 'utf8')
};

Email.sendNewRooms = function(watcher, newIds) {
  var roomLinks = newIds.map(function (roomId) {
    return buildRoomLink(this, roomId);
  }, this);
  var locals = {
    roomLinks: roomLinks,
    cancelLink: buildCancelLink(watcher),
    location: watcher.location
  };
  var html = Email.newRoomsGenerator(locals);
  var subject = newIds.length + ' new rooms found in ' + watcher.location;
  sendEmail(html, watcher.email, subject);
};

Email.sendArchiving = function(watcher) {
  var locals = {
    location: watcher.location,
    date: watcher.checkin ? watcher.checkin : watcher.checkout
  };
  var html = Email.archivingGenerator(locals);
  var subject = 'Your watcher for ' + watcher.location + ' has expired!';
  sendEmail(html, watcher.email, subject);
};

Email.sendCreatedWatcher = function(watcher) {
  var locals = {
    cancelLink: buildCancelLink(watcher),
    location: watcher.location
  };
  var html = Email.createdWatcherGenerator(locals);
  var subject = 'A new watcher for ' + watcher.location + ' has been created!';
  sendEmail(html, watcher.email, subject);
};

function sendEmail(html, to, subject) {
  var data = juice.inlineContent(html, Email.css, juiceOptions);
  server.send({
    from: 'test@bnbwatcher.com',
    to: to,
    subject: subject,
    attachment : [
      {data : data, alternative : true }
    ]
  }, function(err, message) {
    if (err) {
      console.log(err);
    }
  });
}

function buildCancelLink(watcher) {
  return 'To cancel this watcher click here: http://104.236.215.4:3000/cancel?'
      + 'id=' + watcher.id
      + '&token=' + Crypt.getWatcherToken(watcher)
      + '\n';
}

function buildRoomLink(watcher, roomId) {
  var link = 'https://www.airbnb.com/rooms/' + roomId;
  if (watcher.checkin) {
    link += '?checkin=' + Utils.urlifyDate(watcher.checkin);
  }
  if (watcher.checkin && watcher.checkout) {
    link += '&checkout=' + Utils.urlifyDate(watcher.checkout);
  }
  return link;
}

module.exports = Email;
