'use strict';

var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');
var fs = require('fs');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('view options', {
  layout: false
});

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'});
app.use(logger('common', {stream: accessLogStream}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(function(req, res, next) {
  res.setHeader('Cache-Control', 'proxy-revalidate');
  return next();
});
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));
app.use('/create/', require('./routes/createWatcher'));
app.use('/cancel/', require('./routes/cancelWatcher'));
app.use('/unsubscribe/', require('./routes/unsubscribe'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
