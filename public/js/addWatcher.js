$(function(){
  $('#signUp').submit(function (e) {
    e.preventDefault();
    var form = $('form#signUp');
    $.post('/add-watcher/', form.serialize(), function (data) {
      console.log('response: ' + data)
    })
  });

  var millisecondsInYear = 1000*60*60*24*365;
  var now = new Date();
  var nowPlusTwo = new Date(now.getTime() + (millisecondsInYear * 2));

  var picker1 = new Pikaday({
    field: $('input[name=moveIn]')[0],
    minDate: now,
    maxDate: nowPlusTwo,
    container: $("#moveInContainer")[0]
  });

  var picker2 = new Pikaday({
    field: $('input[name=moveOut]')[0],
    minDate: now,
    maxDate: nowPlusTwo,
    container: $("#moveOutContainer")[0]
  });
});