
/**
 * Module dependencies
 */

var tessel = require('tessel');
var wifi = require('wifi-cc3000');
var climateLib = require('climate-si7005');

var running = 0;
var port = 8080;

var climate = climateLib.use(tessel.port.B);
tessel.led[1].write(0);


// Start!

if (!wifi.isConnected()) {
  console.log('WiFi - Not connected! Connecting now...');
  tryToConnect();
} else {
  console.log('WiFi - Already connected! Starting HTTP server now...');
  startServer();
}


function tryToConnect() {

  if (!wifi.isBusy()) {
    console.log('WiFi - Connecting...');

    wifi.connect(require('./wifi-conf.json'));
  } else {

    var delay = 2000;
    console.log('WiFi - Chip is busy, trying again in %s seconds...', delay / 1000);

    setTimeout(function(){
      tryToConnect();
    }, delay);

  }
}


function startServer() {

  var delay = 5000;

  if (running === 0) {
    running = 1;

    if (wifi.isConnected()) {
      console.log('HTTP - Starting server in %s seconds...', delay / 1000);

      setTimeout(function() {

        require('./server').listen(port, function() {
          console.log('HTTP - Server started on port %s', port);
          tessel.led[1].write(running);
        });

      }, delay);

    } else {
      console.log('WiFi - NOT connected, can\'t start server :(');
    }

  } else {
    console.log('HTTP - Server should be up on port %s (check blue led)', 8080);
  }

}


wifi.on('connect', function(data) {
  console.log('WiFi - Connected %j', data);
  startServer();
});


wifi.on('disconnect', function(err) {
  console.log('WiFi - Disconnected %j', err);
  tryToConnect();
});


wifi.on('timeout', function(err) {
  console.log('WiFi - Timeout reached, reconnecting...');
  if (!wifi.isConnected()) tryToConnect();
});


wifi.on('error', function(err) {
  console.error('WiFi - Error - %j', err);
});
