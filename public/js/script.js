(function($){
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
    pusher.subscribe('test_channel');

    // load GMap
    var mapOptions = {
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDoubleClickZoom: true
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    var initialLocation;
    navigator.geolocation.getCurrentPosition(function(position){
      initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
      map.setCenter(initialLocation);
    });

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

    google.maps.event.addListener(map, 'dblclick', function(event){
      $.mobile.changePage($('#page-message'), 'pop', false, false);

      var marker = new google.maps.Marker({
        position: event.latLng,
        map: map,
        title: ''
      });

      $('#set-message').unbind();
      $('#set-message').bind('click', function(){
        var msg = $('#message').val();
        marker.setTitle(msg);

        var ibLabel = new InfoBox(labelOpt);
        ibLabel.setContent(msg);
        ibLabel.setPosition(marker.getPosition());
        ibLabel.open(map);

        $('#message').val('');
        $.mobile.changePage($('#page-map'), 'pop', true, false);
        var data = marker.getTitle()+':'+marker.getPosition().toString();
        $.post('/push', {msg: data, socket_id: socket_id});
      });
    }); // map.doubleclick

    pusher.bind('my_event', function(data) {
      var msg = data.msg;
      if (!msg.match(/(.+):\((.+), (.+)\)/)) {
        return;
      }
      var title = RegExp.$1;
      var lat = RegExp.$2;
      var lng = RegExp.$3;
      var latlng = new google.maps.LatLng(lat, lng);
      var marker = new google.maps.Marker({
        title: title,
        position: latlng,
        map: map
      });
      var ibLabel = new InfoBox(labelOpt);
      ibLabel.setContent(title);
      ibLabel.setPosition(latlng);
      ibLabel.open(map);
    });
  });

})(jQuery);
