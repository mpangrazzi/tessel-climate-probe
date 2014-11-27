
/**
 * Module dependencies
 */

var http = require('http');
var fs = require('fs');
var path = require('path');
var climateLib = require('climate-si7005');
var tessel = require('tessel');

var climate = climateLib.use(tessel.port.B);
var index = fs.readFileSync(path.join(__dirname, './index.html'));

process.setMaxListeners(0); // avoid silly warnings


// http server

var server = http.createServer(function(req, res) {

  if (req.url === '/') {

    console.log('Server - Sending index.html to %s', req.connection.remoteAddress);

    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Date': new Date()
    });

    res.end(index);

  }
  else if (req.url === '/api/climate') {

    console.log('Server - Sending JSON climate data to %s', req.connection.remoteAddress);

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Date': new Date()
    });

    update(function(err, data) {
      if (err) console.error(err);
      res.end(JSON.stringify(data || null));
    });

  }
  else {

    res.writeHead(404, {
      'Content-Type': 'text/plain',
      'Date': new Date()
    });

    res.end('Not found');
  }

});


// Get updated hum / temp values

function update(callback) {
  climate.readTemperature(function(err, temperature) {
    if (err) return callback(err, null);

    climate.readHumidity(function(err, humidity) {
      if (err) return callback(err, null);

      var data = {
        temperature: temperature.toFixed(1),
        humidity: humidity.toFixed(1)
      };

      blink(0); // green
      console.log('Climate - Updated values: %s - %s', temperature, humidity);

      return callback(null, data);

    });
  });
}


// blink led

function blink(led) {
  tessel.led[led].write(1);
  setTimeout(function() {
    tessel.led[led].write(0);
  }, 500);
}


module.exports = server;
