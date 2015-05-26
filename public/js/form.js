'use strict';

$(function(){
  var $fields = {
    location     : $('input[name=location]'),
    checkin      : $('input[name=checkin]'),
    checkout     : $('input[name=checkout]'),
    price_min    : $('input[name=price_min]'),
    price_max    : $('input[name=price_max]'),
    currency     : $('select[name=currency]'),
    num_guests   : $('select[name=number_of_guests]'),
    min_beds     : $('select[name=min_beds]'),
    min_bedrooms : $('select[name=min_bedrooms]'),
    min_baths    : $('select[name=min_bathrooms]'),
    room_entire  : $('input[name=room_type_entire]'),
    room_private : $('input[name=room_type_private]'),
    room_shared  : $('input[name=room_type_shared]')
  };
  
  
  // Calendar logic
  var milliseconsInDay = 1000 * 60 * 60 * 24;
  var millisecondsInYear = milliseconsInDay * 365;
  var now = new Date();
  var aYearFromNow = new Date(now.getTime() + millisecondsInYear);

  
  var checkin_picker = new Pikaday({
    field: $fields.checkin[0],
    minDate: now,
    maxDate: aYearFromNow,
    container: $('#moveInContainer')[0]
  });

  var checkout_picker = new Pikaday({
    field: $fields.checkout[0],
    minDate: now,
    maxDate: aYearFromNow,
    container: $('#moveOutContainer')[0]
  });
  
  $fields.checkin.change(function () {
    var next_date = new Date($fields.checkin.val());
    if (isNaN(next_date.getTime())) {
      $fields.checkin.val('');
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
  
  $fields.checkout.change(function () {
    var prev_date = new Date($fields.checkout.val());
    if (isNaN(prev_date.getTime())) {
      checkin_picker.setMaxDate(aYearFromNow);
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
    var checkin = new Date($fields.checkin.val());
    var checkout = new Date($fields.checkout.val());
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


  // Price logic
  $fields.price_max.change(function () {
    if ($fields.price_max.is(':valid')) {
      $fields.price_min.prop('max', $fields.price_max.val());
    }
  });

  $fields.price_min.change(function () {
    if ($fields.price_min.is(':valid')) {
      $fields.price_max.prop('min', $fields.price_min.val());
    }
  });


  // Location logic
  var locationService = new google.maps.places.AutocompleteService();
  var $prediction_list = $('ul#predictions');
  var $prediction_items = $prediction_list.find("li");

  $fields.location.on('input propertychange paste', handleLocationChange);

  function handleLocationChange() {
    if ($fields.location.val().length === 0) {
      $prediction_items.hide();
      return;
    } else {
      $prediction_items.show();
    }
    locationService.getPlacePredictions({
          input: $fields.location.val(),
          types: ['geocode']
        },
        updateLocationPredictions);
  }

  function updateLocationPredictions(locations) {
    if (!locations) return;
    locations.forEach(function (location, index) {
      $prediction_items.eq(index).text(location.description);
    });
  }

  $prediction_items.on('mousedown', function () {
    $fields.location.val(this.innerHTML);
  });


  // Number of current matches logic
  var $currentRooms = $("#currentRooms");
  var $form = $("form#signUp");

  $form.on('change', checkCurrentRooms);

  function checkCurrentRooms() {
    if (!$fields.location.val() || $fields.location.val().length < 1) {
      $currentRooms.text(0);
      return;
    }
    var url = "http://bnbwatcher.com/check-rooms/?" +
        "https://m.airbnb.ca/api/-/v1/listings/search?items_per_page=1";
    if ($fields.location.val()) url += "&location=" + $fields.location.val();
    if ($fields.checkin.val()) url += "&checkin=" + checkin_picker.getDate().toJSON().substr(0, 10);
    if ($fields.checkout.val()) url += "&checkout=" + checkout_picker.getDate().toJSON().substr(0, 10);
    if ($fields.price_min.val()) url += "&price_min=" + $fields.price_min.val();
    if ($fields.price_max.val()) url += "&price_max=" + $fields.price_max.val();
    if ($fields.currency.val()) url += "&currency=" + $fields.currency.val();
    if ($fields.num_guests.val()) url += "&guests=" + $fields.num_guests.val();
    if ($fields.min_beds.val()) url += "&min_beds=" + $fields.min_beds.val();
    if ($fields.min_bedrooms.val()) url += "&min_bedrooms=" + $fields.min_bedrooms.val();
    if ($fields.min_baths.val()) url += "&min_bathrooms=" + $fields.min_baths.val();
    if ($fields.room_entire.prop("checked")) url += "&room_types[]=Entire+home/apt";
    if ($fields.room_private.prop("checked")) url += "&room_types[]=Private+room";
    if ($fields.room_shared.prop("checked")) url += "&room_types[]=Shared+room";

    $.get(url, updateCurrentRooms);
  }

  function updateCurrentRooms(data) {
    var tooFewMatches = $("p#tooFewMatches").hide();
    var tooManyMatches = $("p#tooManyMatches").hide();
    if (!data) return;
    var roomCount = data.listings_count;
    if (roomCount >= 1000) {
      roomCount = "1000+";
      tooManyMatches.show();
    } else if (roomCount < 5) {
      tooFewMatches.show();
    }
    $currentRooms.text(roomCount);
  }
}());
