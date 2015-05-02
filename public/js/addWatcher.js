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
  var twoYearsFromNow = new Date(now.getTime() + (millisecondsInYear * 2));

  var $checkin = $('input[name=checkin]');
  var $checkout = $('input[name=checkout]');
  
  var checkin_picker = new Pikaday({
    field: $checkin[0],
    minDate: now,
    maxDate: twoYearsFromNow,
    container: $("#moveInContainer")[0]
  });

  var checkout_picker = new Pikaday({
    field: $checkout[0],
    minDate: now,
    maxDate: twoYearsFromNow,
    container: $("#moveOutContainer")[0]
  });
  
  $checkin.change(function () {
    var next_date = new Date($checkin.val());
    if (isNaN(next_date.getTime())) {
      checkout_picker.setMinDate(now);
      return;
    }
    next_date.setDate(next_date.getDate() + 1);
    var checkout_date = checkout_picker.getDate();

    if (checkout_date !== null && checkout_date < next_date) {
      checkout_picker.setDate(next_date, false);
    } else if (checkout_date === null) {
      checkout_picker.gotoDate(next_date);
    }
    checkout_picker.setMinDate(next_date);
  });
  
  $checkout.change(function () {
    var prev_date = new Date($checkout.val());
    if (isNaN(prev_date.getTime())) {
      checkin_picker.setMaxDate(twoYearsFromNow);
      return;
    }
    prev_date.setDate(prev_date.getDate() - 1);
    var checkin_date = checkin_picker.getDate();

    if (checkin_date !== null && checkin_date > prev_date) {
      checkin_picker.setDate(prev_date, false);
    } else if (checkin_date === null) {
      checkin_picker.gotoDate(prev_date);
    }
    checkin_picker.setMaxDate(prev_date);
  })
});