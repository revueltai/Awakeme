# Awakeme (PoC)
Awakeme - The app to tell you exactly where to get off your train or bus.
Tired of falling asleep on the train or bus and missing your stop? Still checking your phone every two seconds to see if you’re still on track? Just sit back, relax and let Awakeme alert you when you are about to arrive at your destination!

## Description
Awakeme is an Android App that alerts you when you are about to reach a given destination.
It's built on Cordova + HTML, and it's Open Source.

## Requirements
- Apache Cordova & some Plugins:
  - [Google Maps Plugin](https://github.com/mapsplugin/cordova-plugin-googlemaps)
  - [Vibration Plugin](https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-vibration/index.html)
  - [Geolocation](https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-geolocation/index.html)
  - [Push Notifications](https://github.com/katzer/cordova-plugin-local-notifications)
  - [Dialogs](https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-dialogs/)
- SASS/SCSS

## Installation
1. [Install Cordova](https://cordova.apache.org)
2. Install Plugins (See each plugin link for details).
3. Clone the contents of `/project` into your `/www` folder.
4. Replace the `YOUR_API_KEY` value inside `main.js` to enable Google Maps Places.-

## Deployment
- For debugging run: `cordova run android`
- For deploying run: `cordova build android` or `cordova build android --release`
Note: You will need to create a signed APK when deploying. For info on how to do that [check this link](http://stackoverflow.com/questions/26449512/how-to-create-a-signed-apk-file-using-cordova-command-line-interface).

## License
[MIT License](https://opensource.org/licenses/MIT)

* And you need to follow the [Google Maps API Terms of Service](https://developers.google.com/maps/terms)
