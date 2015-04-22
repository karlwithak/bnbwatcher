var express = require('express');
var router = express.Router();
var pg = require('pg');
var conString = "postgres://airbnbwatch_user:airbnbwatch_pass@localhost/airbnbwatch_dev";

/* Post new watcher. */
router.post('/', function(req, res, next) {
  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query('INSERT INTO watchers (email, city) ' +
                 'VALUES ($1, $2)',
        [req.body.email, req.body.city],
        function(err, result) {
          if(err) {
            return console.error('error running query', err);
          }
          client.end();
        }
    );
  });

  res.send('success' + req.body.city);
});

module.exports = router;
