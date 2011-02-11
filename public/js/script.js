(function($){
  function random_get_in_tokyo() {
    var long_b = 139.9606977426758;
    var long_d = 139.55832347509767;
    var lat_b = 35.58725649814075;
    var lat_d = 35.76908809589606;

    var lat = lat_b - ((lat_b-lat_d) * Math.random());
    var long = long_b - ((long_b-long_d) * Math.random());

    return {lat: lat, lng:long};
  }

  // load google map
  $('#page-map').live('pagecreate', function(){
    var pusher = new Pusher(window.pusher_key);
    pusher.bind('pusher:connection_established', function(event){
      socket_id = event.socket_id;
    });

    /*
    // Enable pusher logging - don't include this in production
    Pusher.log = function() {
      if (window.console) window.console.log.apply(window.console, arguments);
    };

    // Flash fallback logging - don't include this in production
    WEB_SOCKET_DEBUG = true;
    */
    pusher.subscribe('map-chasing');

    // load GMap
    var mapOptions = {
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDoubleClickZoom: true,
      navigationControl: false,
      scaleControl: false,
      scrollwheel: false,
      streetViewControl: false
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    var defaultLatLng = random_get_in_tokyo();
    var initialLocation = new google.maps.LatLng(defaultLatLng.lat, defaultLatLng.lng);
    map.setCenter(initialLocation);
    /*
    google.maps.event.addListener(map, 'click', function(event){
      console.log(event.latLng.lat(), event.latLng.lng());
    });
    */

    Users[0].appear(map, defaultLatLng.lat, defaultLatLng.lng);
    $.post(
      '/users',
      {lat: defaultLatLng.lat, lng: defaultLatLng.lng, socket_id: socket_id}
    );

    pusher.bind('appear', function(data) {
      if (Users[0].uid == data.uid) return false;
      var uid = data.uid;
      if (!!Users[uid]) {
        var pos = new google.maps.LatLng(data.lat, data.long);
        Users[uid].move(pos);
      } else {
        Users[data.uid] = new User(data);
        Users[data.uid].appear(map);
      }
    });

    pusher.bind('move', function(data) {
      if (Users[0].uid == data.uid) return false;
      var uid = data.uid;
      if (!!Users[uid]) {
        var pos = new google.maps.LatLng(data.lat, data.long);
        Users[uid].move(pos);
      } else {
        Users[data.uid] = new User(data);
        Users[data.uid].appear(map);
      }
    });

    pusher.bind('disappear', function(data) {
      if (Users[0].uid == data.uid) return false;
      var uid = data.uid;
      if (!!Users[uid]) {
        Users[uid].destroy();
      }
    });

    // 設問関連
    var setQuestion = function setQuestion(q) {
      alert('Mission: '+q.name+' を探せ!\nアイコンを重ねると得点になります。');
      $('#page-map h1').text(q.name + ' を探せ!');
      var sw = new google.maps.LatLng(q.sw[0], q.sw[1]);
      var ne = new google.maps.LatLng(q.ne[0], q.ne[1]);
      window.bounds = new google.maps.LatLngBounds(sw, ne);
    }
    setQuestion(q);

    pusher.bind('question', function(data) {
      setQuestion(data);
    });

    pusher.bind('score', function(data) {
      if (!!Users[data.uid]) {
        Users[data.uid].setScore(data.score);
      }
    });

  });

})(jQuery);
