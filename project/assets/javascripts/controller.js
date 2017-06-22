var Controller = (function() {
  function Controller(model) {
    this.model = model;
    this.backgroundMode = false;
    this.backgroundModeDefaults = false;
    this.appStarted = false;
    this.watchPositionID = null;
    this.connectionStatus = null;
    this.connectionStatusTimer = null;
    this.watchPositionTimeout = 10000;
    this.offlineStates = [Connection.UNKNOWN, Connection.CELL, Connection.NONE];
    this.onlineStates = [Connection.ETHERNET, Connection.WIFI, Connection.CELL_2G, Connection.CELL_3G, Connection.CELL_4G];

    EventBus.addEventListener('ON_ERROR', this.onError.bind(this));
    EventBus.addEventListener('ON_START_APP', this.onStartApp.bind(this));
    EventBus.addEventListener('ON_CHANGE_VIEW', this.onChangeView.bind(this));
    EventBus.addEventListener('ON_CHANGE_RADIUS', this.onChangeRadius.bind(this));
    EventBus.addEventListener('ON_CHANGE_POSITION', this.onChangePosition.bind(this));
    EventBus.addEventListener('ON_CHANGE_DESTINY', this.onChangeDestiny.bind(this));
    EventBus.addEventListener('ON_CHECK_COLLISION', this.onCheckCollision.bind(this));
    EventBus.addEventListener('ON_WATCH_POSITION', this.onWatchPosition.bind(this));
    EventBus.addEventListener('ON_UNWATCH_POSITION', this.onUnwatchPosition.bind(this));
    EventBus.addEventListener('ON_WATCH_CONNECTION', this.onWatchConnection.bind(this));
    EventBus.addEventListener('ON_CONNECTION_OFFLINE', this.onConnectionOffline.bind(this));
    EventBus.addEventListener('ON_CONNECTION_ONLINE', this.onConnectionOnline.bind(this));
    EventBus.addEventListener('ON_ENABLE_BACKGROUND_MODE', this.onEnableBackgroundMode.bind(this));
    EventBus.addEventListener('ON_DISABLE_BACKGROUND_MODE', this.onDisableBackgroundMode.bind(this));
  }

  Controller.prototype = {

    getDestiny: function() {
      return this.model.destinyPosition;
    },

    getConnectionStatus: function() {
      var connectionType = navigator.connection.type;
      if (this.offlineStates.indexOf(connectionType) !== -1) {
        EventBus.dispatch('ON_CONNECTION_OFFLINE', connectionType);
      } else if (this.onlineStates.indexOf(connectionType) !== -1) {
        EventBus.dispatch('ON_CONNECTION_ONLINE', connectionType);
      }
    },

    onEnableBackgroundMode: function(event) {
      if (this.backgroundMode === false) {
        this.backgroundMode = true;
        var backgroundModePlugin = cordova.plugins.backgroundMode;
        backgroundModePlugin.enable();
        backgroundModePlugin.on('activate', function() {
          backgroundModePlugin.disableWebViewOptimizations();
        });
        if (!this.backgroundModeDefaults) {
          this.backgroundModeDefaults = true;
          backgroundModePlugin.setDefaults({
            'title': 'Awakeme is running in the background',
            'text': 'So you can relax while you travel!'
          });
        }
      }
    },

    onDisableBackgroundMode: function(event) {
      if (this.backgroundMode === true) {
        this.backgroundMode = false;
        var backgroundModePlugin = cordova.plugins.backgroundMode;
        backgroundModePlugin.disable();
        backgroundModePlugin.un('activate', function() {
          backgroundModePlugin.disableWebViewOptimizations();
        });
      }
    },

    onWatchConnection: function(event) {
      if (this.connectionStatusTimer === null) {
        this.getConnectionStatus();
        this.connectionStatusTimer = setInterval(this.getConnectionStatus.bind(this), 11000);
      }
    },

    onConnectionOffline: function(event) {
      if (this.connectionStatus !== event.target) {
        this.connectionStatus = Connection.NONE;
        EventBus.dispatch('ON_UNWATCH_POSITION');
        EventBus.dispatch('ON_DISABLE_BACKGROUND_MODE');
        EventBus.dispatch('ON_APP_OFFLINE');
      }
    },

    onConnectionOnline: function(event) {
      if (this.connectionStatus !== event.target) {
        this.connectionStatus = navigator.connection.type;
        EventBus.dispatch('ON_ENABLE_BACKGROUND_MODE');
        if (!this.appStarted) {
          EventBus.dispatch('ON_START_APP');
        } else {
          EventBus.dispatch('ON_WATCH_POSITION');
          EventBus.dispatch('ON_APP_ONLINE');
        }
      }
    },

    onError: function(event) {
      EventBus.dispatch('ON_UNWATCH_POSITION');
      EventBus.dispatch('ON_DISABLE_BACKGROUND_MODE');
      EventBus.dispatch('ON_ERROR_SHOW', event.target);
    },

    onStartApp: function(event) {
      navigator.geolocation.getCurrentPosition(function(currentPosition) {
        this.appStarted = true;
        this.model.updatePosition(currentPosition.coords);
        EventBus.dispatch('ON_APP_STARTED', this.model.currentPosition);
      }.bind(this), function(error) {
        EventBus.dispatch('ON_ERROR', 'error-current-position');
      }.bind(this), {
        enableHighAccuracy: true,
        timeout: 20000
      });
    },

    onCheckCollision: function(event) {
      if (this.model.inDistance()) {
        EventBus.dispatch('ON_UNWATCH_POSITION');
        EventBus.dispatch('ON_DESTINY_REACHED');
      }
    },

    onWatchPosition: function(event) {
      this.model.updateDistance();
      if (this.watchPositionID === null) {
        this.watchPositionID = navigator.geolocation.watchPosition(function(newPosition) {
          EventBus.dispatch('ON_CHANGE_POSITION', newPosition.coords);
        }.bind(this), function(error) {
          var errorType = '';
          switch (error.code) {
            case 1:
              errorType = 'error-watch-position-denied';
              break;
            case 2:
              errorType = 'error-watch-position-unavailable';
              break;
            default:
              errorType = 'error-watch-position-unknown';
          }
          EventBus.dispatch('ON_ERROR', errorType);
        }.bind(this), {
          enableHighAccuracy: false,
          timeout: this.watchPositionTimeout
        });
      }
    },

    onUnwatchPosition: function(event) {
      if (this.watchPositionID !== null) {
        navigator.geolocation.clearWatch(this.watchPositionID);
        this.watchPositionID = null;
      }
    },

    onChangePosition: function(event) {
      this.model.updatePosition(event.target);
      this.model.updateDistance();
      EventBus.dispatch('ON_POSITION_CHANGED', {
        currentPosition: this.model.currentPosition,
        currentDistance: this.model.currentDistance,
        totalDistance: this.model.totalDistance
      });
    },

    onChangeRadius: function(event) {
      this.model.updateRadius(event.target);
      EventBus.dispatch('ON_RADIUS_CHANGED', this.model.radius);
    },

    onChangeView: function(event) {
      this.model.updateCurrentView(event.target);
      EventBus.dispatch('ON_VIEW_CHANGED', event.target);
    },

    onChangeDestiny: function(event) {
      this.model.updateDestiny(event.target);
      EventBus.dispatch('ON_DESTINY_CHANGED', {
        address: this.model.address,
        destinyPosition: this.model.destinyPosition
      });
    }
  }

  return Controller;

})();
