var Model = (function() {
  function Model() {
    this.address = null;
    this.totalDistance = null;
    this.currentDistance = null;
    this.currentPosition = null;
    this.destinyPosition = null;
    this.radius = null;
    this.currentView = null;
  }

  Model.prototype = {
    rad: function(x) {
      return x * Math.PI / 180;
    },

    calculateDistance: function(p1, p2) {
      if (p1 !== null && p2 !== null) {
        var R = 6378137;
        var dLat = this.rad(p2.latitude - p1.latitude);
        var dLong = this.rad(p2.longitude - p1.longitude);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.rad(p1.latitude)) * Math.cos(this.rad(p2.latitude)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return parseInt(d);
      }
    },

    updateDistance: function(destinyChanged) {
      var distance = this.calculateDistance(this.currentPosition, this.destinyPosition);
      if (!isNaN(distance)) {
        this.currentDistance = distance;
        if (this.totalDistance === null || destinyChanged === true) {
          this.totalDistance = this.currentDistance;
        }
      }
    },

    inDistance: function() {
      this.updateDistance();
      return (this.currentDistance <= this.radius);
    },

    updatePosition: function(data) {
      this.currentPosition = data;
    },

    updateRadius: function(data) {
      this.radius = data;
    },

    updateCurrentView: function(data) {
      this.currentView = data;
    },

    updateDestiny: function(data) {
      if (data.address !== this.address) {
        this.destinyPosition = data.position;
        this.address = data.address;
        this.updateDistance(true);
      }
    }
  }

  return Model;
})();
