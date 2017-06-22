var View = (function() {
  function View() {
    this.oldView = null;
    this.currentView = 'loader';
    this.address = null;
    this.radius = 50;
    this.alarm = 1000;
    this.zoom = 15;
    this.googleMap = null;
    this.totalDistance = null;
    this.currentDistance = null;
    this.currentPosition = null;
    this.destinyPosition = null;
    this.searchBoxSettings = null;
    this.searchBoxLanding = null;
    this.activeMarker = null;
    this.googleMapMarkerMain = null;
    this.googleMapMarkerDestiny = null;
    this.googleMapMarkerRadius = null;
    this.currentFocus = null;
    this.mapStarted = false;

    this.cssClass = {
      active: 'active',
      activeView: 'view--active',
      loading: 'view--loading',
      unloading: 'view--unloading',
      appError: 'app--error',
      positionFinished: 'position--finished'
    };

    this.views = {
      loader: {
        main: document.getElementById('view-loader')
      },
      landing: {
        main: document.getElementById('view-landing'),
        searchBox: document.getElementById('view-landing-search'),
        radius: document.getElementById('view-landing-radius'),
        startButton: document.getElementById('view-landing-button'),
        cleanButton: document.getElementById('view-landing-search-clean')
      },
      map: {
        main: document.getElementById('view-map'),
        canvas: document.getElementById('view-map-canvas'),
        menuButton: document.getElementById('map-menu-button'),
        address: document.getElementById('map-address'),
        distance: document.getElementById('map-distance'),
        radius: document.getElementById('map-radius'),
        position: document.getElementById('map-position'),
        lineTotalDistance: document.getElementById('map-line-total-distance'),
        lineCurrentDistance: document.getElementById('map-line-current-distance'),
        markerMain: document.getElementById('map-marker-main'),
        markerMainSign: document.getElementById('map-marker-sign'),
        zoomIn: document.getElementById('view-map-zoom-in'),
        zoomOut: document.getElementById('view-map-zoom-out'),
        markersMain: document.getElementById('view-map-markers-main'),
        markersDestiny: document.getElementById('view-map-markers-destiny'),
      },
      settings: {
        main: document.getElementById('view-settings'),
        menuButton: document.getElementById('view-settings-menu-button'),
        resetButton: document.getElementById('view-settings-reset-button'),
        searchBox: document.getElementById('view-settings-search'),
        radius: document.getElementById('view-settings-radius'),
        alarm: document.getElementById('view-settings-alarm'),
        saveSign: document.getElementById('view-settings-save-sign'),
        position: document.getElementById('view-settings-position'),
        lineTotalDistance: document.getElementById('view-settings-line-total-distance'),
        lineCurrentDistance: document.getElementById('view-settings-line-current-distance'),
        markerMain: document.getElementById('view-settings-marker-main'),
        markerMainSign: document.getElementById('view-settings-marker-sign'),
        cleanButton: document.getElementById('view-settings-search-clean'),
        legalButton: document.getElementById('view-settings-legal')
      },
      ending: {
        main: document.getElementById('view-ending'),
        button: document.getElementById('view-ending-button'),
        address: document.getElementById('view-ending-address')
      },
      noConnection: {
        main: document.getElementById('view-no-connection'),
        button: document.getElementById('view-no-connection-button')
      },
      error: {
        main: document.getElementById('view-error'),
        button: document.getElementById('view-error-button'),
        type: document.getElementById('view-error-type'),
        message: document.getElementById('view-error-message')
      }
    };

    this.views.landing.startButton.addEventListener('touchend', this.onStartTouch.bind(this), false);
    this.views.landing.radius.addEventListener('change', this.onRadiusChange.bind(this), false);
    this.views.landing.cleanButton.addEventListener('touchend', this.onCleanSearchField.bind(this), false);
    this.views.landing.searchBox.addEventListener('focus', this.onSearchFieldFocus.bind(this), false);
    this.views.landing.searchBox.addEventListener('blur', this.onSearchFieldBlur.bind(this), false);

    this.views.map.menuButton.addEventListener('touchend', this.onMapMenuTouch.bind(this), false);
    this.views.map.zoomIn.addEventListener('touchend', this.onZoomIn.bind(this), false);
    this.views.map.zoomOut.addEventListener('touchend', this.onZoomOut.bind(this), false);
    this.views.map.markersMain.addEventListener('touchend', this.onFocusMarkerMain.bind(this), false);
    this.views.map.markersDestiny.addEventListener('touchend', this.onFocusMarkerDestiny.bind(this), false);

    this.views.settings.menuButton.addEventListener('touchend', this.onSettingsMenuTouch.bind(this), false);
    this.views.settings.radius.addEventListener('change', this.onRadiusChange.bind(this), false);
    this.views.settings.alarm.addEventListener('change', this.onAlarmChange.bind(this), false);
    this.views.settings.resetButton.addEventListener('touchend', this.onAppReset.bind(this), false);
    this.views.settings.cleanButton.addEventListener('touchend', this.onCleanSearchField.bind(this), false);
    this.views.settings.searchBox.addEventListener('focus', this.onSearchFieldFocus.bind(this), false);
    this.views.settings.searchBox.addEventListener('blur', this.onSearchFieldBlur.bind(this), false);
    this.views.settings.legalButton.addEventListener('touchend', this.onLegalTouch.bind(this), false);

    this.views.ending.button.addEventListener('touchend', this.onAppReset.bind(this), false);
    this.views.error.button.addEventListener('touchend', this.onAppReload.bind(this), false);

    EventBus.addEventListener('ON_APP_STARTED', this.onAppStarted.bind(this));
    EventBus.addEventListener('ON_ERROR_SHOW', this.onErrorShow.bind(this));
    EventBus.addEventListener('ON_POSITION_CHANGED', this.onPositionChanged.bind(this));
    EventBus.addEventListener('ON_DESTINY_CHANGED', this.onDestinyChanged.bind(this));
    EventBus.addEventListener('ON_DESTINY_REACHED', this.onDestinyReached.bind(this));
    EventBus.addEventListener('ON_RADIUS_CHANGED', this.onRadiusChanged.bind(this));
    EventBus.addEventListener('ON_VIEW_CHANGED', this.onViewChanged.bind(this));
    EventBus.addEventListener('ON_APP_OFFLINE', this.onAppOffline.bind(this));
    EventBus.addEventListener('ON_APP_ONLINE', this.onAppOnline.bind(this));
    EventBus.addEventListener('ON_SETTINGS_SAVED', this.onSettingsSaved.bind(this));
  }

  View.prototype = {

    onLegalTouch: function(event) {
      event.preventDefault();
      this.googleMap.getLicenseInfo(function(txt, txt1) {
        var message = txt || txt1;
        navigator.notification.alert(message, function() {}, 'Legal Notices', 'Done');
      });
    },

    onAppOnline: function(event) {
      EventBus.dispatch('ON_CHANGE_VIEW', this.oldView);
    },

    onAppOffline: function(event) {
      if (this.oldView === null) {
        this.oldView = this.currentView;
      }
      EventBus.dispatch('ON_CHANGE_VIEW', 'noConnection');
    },

    onAppStarted: function(event) {
      this.currentPosition = event.target;

      if (this.searchBoxLanding === null) {
        this.searchBoxLanding = new SearchBox(this.views.landing.searchBox, this);
      }
      if (this.searchBoxSettings === null) {
        this.searchBoxSettings = new SearchBox(this.views.settings.searchBox, this);
      }

      this.googleMap = plugin.google.maps.Map.getMap(this.views.map.canvas);
      this.googleMap.addEventListener(plugin.google.maps.event.MAP_READY, function(map) {
        EventBus.dispatch('ON_CHANGE_RADIUS', this.radius);
        EventBus.dispatch('ON_CHANGE_VIEW', 'landing');
      }.bind(this), false);
    },

    onAppReload: function() {
      // this.execReset();
      EventBus.dispatch('ON_UNWATCH_POSITION');
      EventBus.dispatch('ON_DISABLE_BACKGROUND_MODE');
      location.reload();
      // navigator.app.exitApp();
    },

    onAppReset: function(event) {
      this.execReset();
      EventBus.dispatch('ON_CHANGE_VIEW', 'landing');
    },

    onErrorShow: function(errorType) {
      var title = '';
      var description = '';
      switch (errorType.target) {
        case 'error-vibrate':
          title = 'Please enable vibrations';
          description = 'For a better experience please turn on vibrations';
        case 'error-places':
          title = 'Could not load Google Places';
          description = 'Please restart the app';
          break;
        case 'error-dependencies':
          title = 'Could not load required files';
          description = 'Please restart the app';
          break;
        case 'error-geolocation':
          title = 'No available location';
          description = 'Please enable your location settings';
          break;
        case 'error-connection':
          title = 'Could not connect';
          description = 'Please enable your internet connection';
          break;
        case 'error-googlemaps':
          title = 'Could not load map';
          description = 'Google Maps are currently not available';
          break;
        case 'error-current-position':
          title = 'Cannot establish your position';
          description = 'Please enable your location settings';
          break;
        case 'error-watch-position-denied':
          title = 'Access denied to your position';
          description = 'Please enable your location settings';
          break;
        case 'error-watch-position-unavailable':
          title = 'Your position is unavailable';
          description = 'Please enable your location settings or restart the app';
          break;
        case 'error-watch-position-unknown':
          title = 'Cannot find your position';
          description = 'Please restar the app';
          break;
        default:
          title = 'Unknown error';
          description = 'Please contact support';
      }

      this.views.error.type.innerHTML = title;
      this.views.error.message.innerHTML = description;
      this.transitionIn('error');
    },

    onDestinyReached: function(event) {
      this.dispatchNotification();
      EventBus.dispatch('ON_CHANGE_VIEW', 'ending');
    },

    onStartTouch: function(event) {
      if (this.address === null) {
        this.views.landing.searchBox.parentNode.classList.add(this.cssClass.appError);
      } else {
        this.views.landing.startButton.innerHTML = 'Starting...';
        this.views.landing.searchBox.parentNode.classList.remove(this.cssClass.appError);
        this.views.map.address.innerHTML = this.address;
        this.views.map.radius.innerHTML = this.radius;

        if (this.mapStarted) {
          this.views.map.markersMain.classList.remove(this.cssClass.active);
          this.views.map.markersDestiny.classList.remove(this.cssClass.active);
          this.views.map.address.innerHTML = this.address;
          this.views.map.radius.innerHTML = this.radius;
          this.googleMapMarkerRadius.setRadius(this.radius);
          this.googleMapMarkerDestiny.setPosition(this.setLatLng(this.destinyPosition.latitude, this.destinyPosition.longitude));
          this.googleMap.setCenter(this.setLatLng(this.currentPosition.latitude, this.currentPosition.longitude));
          EventBus.dispatch('ON_WATCH_POSITION');
          EventBus.dispatch('ON_CHANGE_VIEW', 'map');
        } else {
          this.mapStarted = true;
          this.onStartMap(this);
        }
      }
    },

    onStartMap: function() {
      var posLatLng = this.setLatLng(this.currentPosition.latitude, this.currentPosition.longitude);
      this.googleMap.setZoom(this.zoom);
      this.googleMap.setClickable(false);
      this.googleMap.setCenter(posLatLng);

      this.googleMap.addMarker({
        'icon': 'red',
        'title': 'Your position',
        'draggable': false,
        'animation': plugin.google.maps.Animation.DROP
      }, function(marker) {
        this.googleMapMarkerMain = marker;
        this.googleMapMarkerMain.setPosition(posLatLng);
        this.drawRadius();
        this.addDestinyMarker(this.destinyPosition);
      }.bind(this));
    },

    onMapMenuTouch: function(event) {
      this.views.settings.searchBox.value = this.address;
      this.views.settings.radius.value = this.radius;
      this.views.settings.alarm.value = this.alarm;
      EventBus.dispatch('ON_CHANGE_VIEW', 'settings');
    },

    onSettingsMenuTouch: function(event) {
      if (this.address === null) {
        this.views.settings.searchBox.parentNode.classList.add(this.cssClass.appError);
      } else {
        this.views.settings.searchBox.parentNode.classList.remove(this.cssClass.appError);
        this.views.map.address.innerHTML = this.address;
        this.views.map.radius.innerHTML = this.radius;
        this.googleMapMarkerRadius.setRadius(this.radius);
        this.googleMapMarkerDestiny.setPosition(this.setLatLng(this.destinyPosition.latitude, this.destinyPosition.longitude));
        EventBus.dispatch('ON_CHANGE_VIEW', 'map');
      }
    },

    onPositionChanged: function(event) {
      this.totalDistance = event.target.totalDistance;
      this.currentPosition = event.target.currentPosition;
      this.currentDistance = (event.target.currentDistance > this.totalDistance) ? this.totalDistance : event.target.currentDistance;
      EventBus.dispatch('ON_CHECK_COLLISION');

      if (!cordova.plugins.backgroundMode.isActive()) {
        if (this.currentView === 'map') {
          if (this.googleMapMarkerMain !== null) {
            var newLatLang = this.setLatLng(this.currentPosition.latitude, this.currentPosition.longitude);
            this.googleMapMarkerMain.setPosition(newLatLang);

            if (this.currentFocus !== 'markerDestiny') {
              this.googleMap.setCenter(newLatLang);
            }

            if (this.googleMapMarkerRadius !== null) {
              this.googleMapMarkerRadius.setCenter(newLatLang);
            }
          }
          this.updateMapDistanceGraphic();
        } else if(this.currentView === 'settings') {
          this.updateSettingsDistanceGraphic();
        }
      }
    },

    onDestinyChanged: function(event) {
      this.address = event.target.address;
      this.destinyPosition = event.target.destinyPosition;
      EventBus.dispatch('ON_SETTINGS_SAVED');
    },

    onRadiusChanged: function(event) {
      this.radius = event.target;
    },

    onViewChanged: function(event) {
      this.swapViews(this.currentView, event.target);
    },

    onZoomIn: function(event) {
      if (this.zoom < 20 && this.googleMap !== null) {
        this.zoom += 1;
        this.googleMap.setZoom(this.zoom);
      }
    },

    onZoomOut: function(event) {
      if (this.zoom > 0 && this.googleMap !== null) {
        this.zoom -= 1;
        this.googleMap.setZoom(this.zoom);
      }
    },

    onFocusMarkerMain: function(event) {
      if (this.googleMapMarkerMain !== null) {
        this.currentFocus = 'markerMain';
        this.views.map.markersMain.classList.add(this.cssClass.active);
        this.views.map.markersDestiny.classList.remove(this.cssClass.active);
        this.googleMapMarkerMain.getPosition(function(position) {
          this.googleMap.animateCamera({
            'target': this.setLatLng(position.lat, position.lng),
            'zoom': this.zoom,
            'duration': 500
          });
        }.bind(this));
      }
    },

    onFocusMarkerDestiny: function(event) {
      if (this.googleMapMarkerDestiny !== null) {
        this.currentFocus = 'markerDestiny';
        this.views.map.markersDestiny.classList.add(this.cssClass.active);
        this.views.map.markersMain.classList.remove(this.cssClass.active);
        this.googleMapMarkerDestiny.getPosition(function(position) {
          this.googleMap.animateCamera({
            'target': this.setLatLng(position.lat, position.lng),
            'zoom': this.zoom,
            'duration': 500
          });
        }.bind(this));
      }
    },

    onCleanSearchField: function(event) {
      var field = event.currentTarget.previousElementSibling;
      field.parentNode.classList.remove(this.cssClass.appError);
      field.value = '';
      field.focus();
      EventBus.dispatch('ON_CHANGE_DESTINY', {
        address: null,
        position: null
      });
    },

    onSearchFieldFocus: function(event) {
      if (event.currentTarget.value !== '') {
        var element = event.currentTarget.nextElementSibling;
        element.classList.add(this.cssClass.active);
      }
    },

    onSearchFieldBlur: function(event) {
      var element = event.currentTarget.nextElementSibling;
      element.classList.remove(this.cssClass.active);
    },

    onRadiusChange: function(event) {
      EventBus.dispatch('ON_CHANGE_RADIUS', event.target.value);
      EventBus.dispatch('ON_SETTINGS_SAVED');
    },

    onAlarmChange: function(event) {
      this.alarm = event.target.value;
      EventBus.dispatch('ON_SETTINGS_SAVED');
    },

    onSettingsSaved: function(event) {
      if (this.currentView === 'settings') {
        this.views.settings.saveSign.classList.add(this.cssClass.active);
        setTimeout(function() {
          this.views.settings.saveSign.classList.remove(this.cssClass.active);
        }.bind(this), 2000);
      }
    },

    addDestinyMarker: function(position) {
      this.googleMap.addMarker({
        'icon': 'blue',
        'title': 'Your destiny',
        'draggable': false,
        'animation': plugin.google.maps.Animation.DROP
      }, function(marker) {
        this.googleMapMarkerDestiny = marker;
        this.googleMapMarkerDestiny.setPosition(this.setLatLng(this.destinyPosition.latitude, this.destinyPosition.longitude));
        this.googleMapMarkerDestiny.showInfoWindow();
        EventBus.dispatch('ON_WATCH_POSITION');
        EventBus.dispatch('ON_CHANGE_VIEW', 'map');
      }.bind(this));
    },

    drawRadius: function() {
      this.googleMap.addCircle({
        'fillColor' : '#FFFFFF',
        'strokeColor' : '#009F9D',
        'strokeWidth': 2
      }, function(circle) {
        this.googleMapMarkerMain.getPosition(function(position) {
          this.googleMapMarkerRadius = circle;
          this.googleMapMarkerRadius.setRadius(this.radius);
          this.googleMapMarkerRadius.setCenter(this.setLatLng(this.currentPosition.latitude, this.currentPosition.longitude));
        }.bind(this));
      }.bind(this));
    },

    dispatchNotification: function() {
      navigator.vibrate([this.alarm]);
      if (cordova.plugins.backgroundMode.isActive()) {
        cordova.plugins.notification.local.schedule({
          'id': 1,
          'title': 'You have arrived!',
          'text': 'Have a nice time.'
        });
      }
    },

    clearNotifications: function() {
      cordova.plugins.notification.local.clearAll(function() {});
    },

    execReset: function() {
      this.currentFocus = null;
      this.zoom = 15;
      this.alarm = 1000;
      this.googleMap.setZoom(this.zoom);

      this.views.landing.searchBox.parentNode.classList.remove(this.cssClass.appError);
      this.views.landing.searchBox.value = '';
      this.views.landing.startButton.innerHTML = 'Start';
      this.views.landing.radius.value = 50;

      this.views.map.distance.innerHTML = '';
      this.views.map.lineCurrentDistance.removeAttribute('style');
      this.views.map.markerMain.removeAttribute('style');
      this.views.map.position.classList.remove(this.cssClass.positionFinished);

      this.views.settings.searchBox.parentNode.classList.remove(this.cssClass.appError);
      this.views.settings.searchBox.value = '';
      this.views.settings.markerMainSign.innerHTML = '-';
      this.views.settings.markerMainSign.innerHTML = '-';
      this.views.settings.lineCurrentDistance.removeAttribute('style');
      this.views.settings.markerMain.removeAttribute('style');
      this.views.settings.position.classList.remove(this.cssClass.positionFinished);

      this.clearNotifications();

      EventBus.dispatch('ON_UNWATCH_POSITION');
      EventBus.dispatch('ON_DISABLE_BACKGROUND_MODE');
      EventBus.dispatch('ON_CHANGE_RADIUS', this.views.landing.radius.value);
      EventBus.dispatch('ON_CHANGE_DESTINY', {
        address: null,
        position: null
      });
    },

    updateSettingsDistanceGraphic: function() {
      if (this.currentDistance !== null && !isNaN(this.currentDistance)) {
        var totalWidth = parseInt(this.views.settings.lineTotalDistance.parentNode.clientWidth);
        var markerMiddle = parseInt(this.views.settings.markerMain.clientWidth / 2);
        if (this.currentDistance > this.totalDistance) {
          this.currentDistance = this.totalDistance;
        }

        var currentWidth = parseInt((this.currentDistance * totalWidth) / this.totalDistance);
        if (currentWidth >= totalWidth) {
          currentWidth = totalWidth - markerMiddle;
        }

        this.views.settings.lineCurrentDistance.style.width = (currentWidth + markerMiddle) + 'px';
        this.views.settings.markerMain.style.left = (totalWidth - (currentWidth + markerMiddle)) + 'px';
        this.views.settings.markerMainSign.innerHTML = this.toKilometers(this.currentDistance);

        if (this.currentDistance <= this.radius) {
          this.views.settings.position.classList.add(this.cssClass.positionFinished);
        }
      }
    },

    updateMapDistanceGraphic: function() {
      if (this.currentDistance !== null && !isNaN(this.currentDistance)) {
        var markerHeight = parseInt(this.views.map.markerMain.clientHeight);
        var totalHeight = parseInt(this.views.map.lineTotalDistance.parentNode.clientHeight);
        var position = parseInt((this.currentDistance * totalHeight) / this.totalDistance);

        if (position >= (totalHeight - markerHeight)) {
          position = totalHeight - markerHeight;
        }

        if (this.currentDistance <= this.radius) {
          this.views.map.position.classList.add(this.cssClass.positionFinished);
        } else {
          var distanceInKM = this.toKilometers(this.currentDistance);
          this.views.map.distance.innerHTML = distanceInKM;
          this.views.map.markerMainSign.innerHTML = distanceInKM;
          this.views.map.lineCurrentDistance.style.height = position + 'px';
          this.views.map.markerMain.style.bottom = position + 'px';
        }
      }
    },

    toKilometers: function(distance) {
      if (distance > 1000) {
        return (distance / 1000).toFixed(2) + 'Km';
      } else {
        return distance + 'm';
      }
    },

    setLatLng: function(lat, lng) {
      return new plugin.google.maps.LatLng(lat, lng);
    },

    getTransitionDuration: function(element) {
      return parseFloat(window.getComputedStyle(element).getPropertyValue('transition-duration')) * 1000;
    },

    swapViews: function(viewOut, viewIn, duration, callback) {
      if (viewOut === null && viewIn === null) {
        return;
      }

      if (viewOut === null) {
        viewOutEl = this.views[this.currentView].main;
        viewInEl = this.views[viewIn].main;
      } else if (viewIn === null) {
        viewOutEl = this.views[viewOut].main;
        viewInEl = this.views[this.currentView].main;
      } else {
        viewOutEl = this.views[viewOut].main;
        viewInEl = this.views[viewIn].main;
      }

      viewInEl.classList.add(this.cssClass.loading);
      viewOutEl.classList.add(this.cssClass.unloading);
      viewOutEl.classList.remove(this.cssClass.activeView);

      setTimeout(function() {
        viewOutEl.classList.remove(this.cssClass.unloading);
        viewInEl.classList.remove(this.cssClass.loading);
        viewInEl.classList.add(this.cssClass.activeView);
        this.currentView = viewIn;
        if (callback) {
          callback();
        }
      }.bind(this), (duration && duration != null) ? duration : this.getTransitionDuration(viewOutEl));
    },

    transitionOut: function(view, duration, callback) {
      if (view === null) {
        return;
      }
      view = this.views[view].main;
      view.classList.add(this.cssClass.loading);
      view.classList.add(this.cssClass.activeView);
      setTimeout(function() {
        view.classList.remove(this.cssClass.loading);
        view.classList.remove(this.cssClass.activeView);
        if (callback) {
          callback();
        }
      }.bind(this), (duration && duration != null) ? duration : this.getTransitionDuration(view));
    },

    transitionIn: function(view, duration, callback) {
      if (view === null) {
        return;
      }
      view = this.views[view].main;
      view.classList.add(this.cssClass.loading);
      view.classList.remove(this.cssClass.activeView);
      setTimeout(function() {
        view.classList.remove(this.cssClass.loading);
        view.classList.add(this.cssClass.activeView);
        if (callback) {
          callback();
        }
      }.bind(this), (duration && duration != null) ? duration : this.getTransitionDuration(view));
    }
  }

  return View;
})();
