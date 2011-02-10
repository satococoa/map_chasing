(function($){
  var host = location.hostname;
  var url = 'ws://'+host+':8080/';
  var ws = new WebSocket(url);
  var $ws = $(ws);
  $(function(){
    $ws.bind('open', function(){
    });
    $ws.bind('close', function(){
    });
    $(window).unload(function(){
      ws.close();
    });
  });

  // load google map
  $('#page-map').live('pagecreate', function(){
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
        title: '',
        draggable: true
      });

      var ibLabel = new InfoBox(labelOpt);

      $('#set-message').unbind();
      $('#set-message').bind('click', function(){
        marker.setTitle($('#message').val());
        ibLabel.setContent($('#message').val());
        ibLabel.open(map);
        $('#message').val('');
        $.mobile.changePage($('#page-map'), 'pop', true, false);
        ws.send(marker.getTitle()+':'+marker.getPosition().toString());
      });

      google.maps.event.addListener(marker, 'click', function(){
        ibLabel.open(map);
      });
    }); // map.doubleclick

    $(ws).bind('message', function(event){
      var msg = event.originalEvent.data;
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
