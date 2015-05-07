$(function(){
  var milliseconsInDay = 1000 * 60 * 60 * 24;
  var millisecondsInYear = milliseconsInDay * 365;
  var now = new Date();
  var twoYearsFromNow = new Date(now.getTime() + (millisecondsInYear * 2));

  var $checkin = $('input[name=checkin]');
  var $checkout = $('input[name=checkout]');
  
  var checkin_picker = new Pikaday({
    field: $checkin[0],
    minDate: now,
    maxDate: twoYearsFromNow,
    container: $('#moveInContainer')[0]
  });

  var checkout_picker = new Pikaday({
    field: $checkout[0],
    minDate: now,
    maxDate: twoYearsFromNow,
    container: $('#moveOutContainer')[0]
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
    updatePriceUnit();
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
    updatePriceUnit();
  });

  function updatePriceUnit() {
    var checkin = new Date($checkin.val());
    var checkout = new Date($checkout.val());
    if (isNaN(checkin.getTime()) || isNaN(checkout.getTime())) {
      return;
    }
    var $price_unit = $('span#price_unit');
    if (checkout - checkin >= 28 * milliseconsInDay) {
      $price_unit.text('(Per Month)');
    } else {
      $price_unit.text('(Per Night)');
    }
  }

  var $price_min = $('input[name=price_min]');
  var $price_max = $('input[name=price_max]');

  $price_max.change(function () {
    if ($price_max.is(':valid')) {
      $price_min.prop('max', $price_max.val());
    }
  });

  $price_min.change(function () {
    if ($price_min.is(':valid')) {
      $price_max.prop('min', $price_min.val());
    }
  });

  var locationService = new google.maps.places.AutocompleteService();
  var $location_field = $('input[name=location]');
  var $prediction_list = $('ul#predictions');
  var $prediction_items = $prediction_list.find("li");

  $location_field.on('input propertychange paste', handleLocationChange);

  function handleLocationChange() {
    if ($location_field.val().length === 0) {
      $prediction_items.hide();
      return;
    } else {
      $prediction_items.show();
    }
    locationService.getPlacePredictions({
          input: $location_field.val(),
          types: ['geocode']
        },
        updateLocationPredictions);
  }

  function updateLocationPredictions(locations, status) {
    if (!locations) return;
    locations.forEach(function (location, index) {
      $prediction_items.eq(index).text(location.description);
    })
  }

  $prediction_items.on('mousedown', function () {
    $location_field.val(this.innerHTML);
  })
}());
