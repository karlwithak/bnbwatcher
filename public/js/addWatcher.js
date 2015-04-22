$(function(){
  $('#signUp').submit(function (e) {
    console.log("test");
    e.preventDefault();
    var city = $('#city').val();
    var email = $('#email').val();
    console.log('Submit with city: ' + city);
    $.post('/add-watcher/', {city : city, email : email}, function (data) {
      console.log('response: ' + data)
    })
  });
});
