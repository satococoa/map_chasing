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
    var socket_id;
    pusher.bind('pusher:connection_established', function(event){
      socket_id = event.socket_id;
    });

    // Enable pusher logging - don't include this in production
    Pusher.log = function() {
      if (window.console) window.console.log.apply(window.console, arguments);
    };

    // Flash fallback logging - don't include this in production
    WEB_SOCKET_DEBUG = true;
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

    var labelOpt = {
      content: '',
      boxStyle: {
        border: "1px solid black",
        textAlign: "center",
        fontSize: "8pt",
        width: "100px",
        backgroundColor: 'yellow'
      },
      disableAutoPan: true,
      pixelOffset: new google.maps.Size(-50, 0),
      position: initialLocation,
      closeBoxURL: "",
      isHidden: false,
      pane: "mapPane",
      enableEventPropagation: true
    };

    var marker = new google.maps.Marker({
      position: map.getCenter(),
      map: map,
      icon: new google.maps.MarkerImage(User.image),
      title: User.nickname
    });
    var ibLabel = new InfoBox(labelOpt);
    ibLabel.setContent(marker.getTitle());
    ibLabel.setPosition(marker.getPosition());
    ibLabel.open(map);
    $.post(
      '/users',
      {lat: defaultLatLng.lat, long: defaultLatLng.lng}
    );

    google.maps.event.addListener(map, 'drag', function(event){
      marker.setPosition(map.getCenter());
      ibLabel.setPosition(map.getCenter());
    });
    google.maps.event.addListener(map, 'dragend', function(event){
      marker.setPosition(map.getCenter());
      ibLabel.setPosition(map.getCenter());
    });

    pusher.bind('appear', function(data) {
      var latlng = new google.maps.LatLng(parseFloat(data.lat), parseFloat(data.long));
      var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        icon: new google.maps.MarkerImage(data.image),
        title: data.nickname
      });
      var ibLabel = new InfoBox(labelOpt);
      ibLabel.setContent(marker.getTitle());
      ibLabel.setPosition(marker.getPosition());
      ibLabel.open(map);

      Users[data.uid] = {marker: marker, label: ibLabel};
    });
  });

})(jQuery);
