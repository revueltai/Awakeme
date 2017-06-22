var SearchBox = (function() {
  function SearchBox(htmlEl, view) {
    this.view = view;
    this.box = new google.maps.places.SearchBox(htmlEl);
    this.box.addListener('places_changed', this.onPlacesChanged.bind(this));
  }

  SearchBox.prototype = {
    onPlacesChanged: function() {
      var places = this.box.getPlaces();
      if (places.length == 0) {
        return;
      }
      places.forEach(function(place) {
        if (!place.geometry) {
          return;
        }
        EventBus.dispatch('ON_CHANGE_DESTINY', {
          address: place.formatted_address,
          position: {
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng()
          }
        });
      }.bind(this));
    }
  }

  return SearchBox;

})();
