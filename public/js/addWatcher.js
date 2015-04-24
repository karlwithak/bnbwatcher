$(function(){
  $('#signUp').submit(function (e) {
    e.preventDefault();
    var form = $('form#signUp');
    $.post('/add-watcher/', form.serialize(), function (data) {
      console.log('response: ' + data)
    })
  });

  var picker1 = new Pikaday({
    field: $('input[name=moveIn]')[0],
    firstDay: 1,
    minDate: new Date('2000-01-01'),
    maxDate: new Date('2020-12-31'),
    yearRange: [2000,2020],
    container: $("#moveInContainer")[0]
  });

  var picker2 = new Pikaday({
    field: $('input[name=moveOut]')[0],
    firstDay: 1,
    minDate: new Date('2000-01-01'),
    maxDate: new Date('2020-12-31'),
    yearRange: [2000,2020],
    container: $("#moveOutContainer")[0]
  });
});