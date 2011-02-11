function User(user) {
  this.uid = user.uid;
  this.nickname = user.nickname;
  this.image = user.image;
  this.lat = user.lat;
  this.long = user.long;
  this.score = user.score;
  // this.created = user.created;
  // this.modified = user.modified;
}

User.prototype = {
  marker: {},
  label: {},
  appear: function(map, lat, lng) {
    var self = this;
    if (lat != undefined) {
      self.lat = lat;
    }
    if (lng != undefined) {
      self.long = lng;
    }
    self.setMarker(map);
    self.setLabel(map);
  },
  setMarker: function(map) {
    var self = this;
    var latlng = new google.maps.LatLng(parseFloat(self.lat), parseFloat(self.long));
    self.marker = new google.maps.Marker({
      position: latlng,
      map: map,
      icon: new google.maps.MarkerImage(self.image),
      title: self.nickname
    });
  },
  setLabel: function(map) {
    var self = this;
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
      position: self.marker.getPosition(),
      closeBoxURL: "",
      isHidden: false,
      pane: "mapPane",
      enableEventPropagation: true
    };

    var self = this;
    self.label = new InfoBox(labelOpt);
    self.label.setContent(self.marker.getTitle());
    self.label.setPosition(self.marker.getPosition());
    self.label.open(map);
  },
  move: function(pos) {
    var self = this;
    self.marker.setPosition(pos);
    self.label.setPosition(pos);
  },
  destroy: function(pos) {
    var self = this;
    self.marker.setMap(null);
    self.label.close();
    delete(self);
  }
};
