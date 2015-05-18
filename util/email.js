'use strict';

var emailjs = require('emailjs');
var Utils = require('../util/utils.js');
var Crypt = require('../util/crypt.js');
var jade = require('jade');
var fs = require('fs');
var juice = require('juice');

var emailInfo = Utils.serverInfo['email_info'];
var server = emailjs.server.connect(emailInfo);

var jadeOptions = {};
var juiceOptions = {};

var Email = {
  newRoomsGenerator: jade.compileFile('./views/emails/newRooms.jade', jadeOptions),
  archivingGenerator: jade.compileFile('./views/emails/archiving.jade', jadeOptions),
  createdWatcherGenerator: jade.compileFile('./views/emails/createdWatcher.jade', jadeOptions),
  css: fs.readFileSync('./public/css/email.css', 'utf8')
};

Email.sendNewRooms = function(watcher, newIds, newRoomNames) {
  var roomLinks = newIds.map(function (roomId) {
    return buildRoomLink(watcher, roomId);
  });
  var locals = {
    roomLinks: roomLinks,
    roomNames: newRoomNames,
    cancelLink: buildCancelLink(watcher),
    unsubscribe: buildUnsubscribeLink(watcher),
    location: watcher.location
  };
  var html = Email.newRoomsGenerator(locals);
  var subject = newIds.length;
  subject += newIds.length === 1 ? ' new room' : ' new rooms';
  subject += ' found in ' + watcher.location;
  sendEmail(html, watcher.email, subject);
};

Email.sendArchiving = function(watcher) {
  var locals = {
    location: watcher.location,
    unsubscribe: buildUnsubscribeLink(watcher),
    date: watcher.checkin ? watcher.checkin : watcher.checkout
  };
  var html = Email.archivingGenerator(locals);
  var subject = 'Your watcher for ' + watcher.location + ' has expired!';
  sendEmail(html, watcher.email, subject);
};

Email.sendCreatedWatcher = function(watcher) {
  var locals = {
    cancelLink: buildCancelLink(watcher),
    unsubscribe: buildUnsubscribeLink(watcher),
    location: watcher.location
  };
  var html = Email.createdWatcherGenerator(locals);
  var subject = 'A new watcher for ' + watcher.location + ' has been created!';
  sendEmail(html, watcher.email, subject);
};

function sendEmail(html, to, subject) {
  console.log(new Date().toLocaleString() + " Sending email to: " + to + " with subject: " + subject);
  var data = juice.inlineContent(html, Email.css, juiceOptions);
  server.send({
    from: 'Bnb Watcher <info@bnbwatcher.com>',
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
  return 'http://bnbwatcher.com/cancel?' +
      'id=' + watcher.id +
      '&token=' + Crypt.getWatcherToken(watcher);
}

function buildUnsubscribeLink(watcher) {
  return 'http://bnbwatcher.com/unsubscribe?' +
      'email=' + watcher.email +
      '&token=' + Crypt.getUnsubscribeToken(watcher.email);
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
