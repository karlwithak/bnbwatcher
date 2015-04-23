$(function(){
  $('#signUp').submit(function (e) {
    e.preventDefault();
    var form = $('form#signUp');
    $.post('/add-watcher/', form.serialize(), function (data) {
      console.log('response: ' + data)
    })
  });
});
