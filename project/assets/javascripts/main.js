var app = {
  initialize: function() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
  },

  includeScript: function(path, callbackSuccess, callbackError) {
    if (!(window.MSApp && window.MSApp.execUnsafeLocalFunction)) {
      var node = document.createElement('script');
      node.src = path;

      var okHandler = function() {
        this.removeEventListener('load', okHandler);
        this.removeEventListener('error', errHandler);
        callbackSuccess();
      };

      var errHandler = function(error) {
        this.removeEventListener('load', okHandler);
        this.removeEventListener('error', errHandler);
        callbackError('Error loading script: ' + path);
      };

      node.addEventListener('load', okHandler);
      node.addEventListener('error', errHandler);
      document.body.appendChild(node);

    } else {
      readLocalFile(path, function(err, result) {
        MSApp.execUnsafeLocalFunction(function() {
          var node = document.createElement('script');
          node.text = result;
          document.body.appendChild(node);
          callbackSuccess();
        });
      });
    }
  },

  onDeviceReady: function() {
    plugin.google.maps.Map.isAvailable(function(isAvailable) {
      if (isAvailable) {
        if ('geolocation' in navigator) {
          var model = new Model();
          var view = new View();
          var controller = new Controller(model);

          if (navigator.connection.type === Connection.NONE) {
            EventBus.dispatch('ON_ERROR', 'error-connection');
          } else {
            this.includeScript('https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places', this.onLoadSuccess.bind(this), this.onLoadFail.bind(this));
          }
        } else {
          EventBus.dispatch('ON_ERROR', 'error-geolocation');
        }

      } else {
        EventBus.dispatch('ON_ERROR', 'error-googlemaps');
      }
    }.bind(this));
  },

  onLoadSuccess: function() {
    this.includeScript('assets/javascripts/searchbox.js', function() {
      EventBus.dispatch('ON_WATCH_CONNECTION');
    }.bind(this), this.onLoadFail.bind(this));
  },

  onLoadFail: function(error) {
    EventBus.dispatch('ON_ERROR', 'error-dependencies');
  }
};

// --------------------

app.initialize();
