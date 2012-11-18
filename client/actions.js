var fs = require('fs');
var sys = require('sys');

exports.index = function(response) {
  console.log("Index action called!");
  
  fs.readFile('./client/index.html', function (err, data) {
    if (err) console.log(err);
    response.writeHead(200, { 'Content-type': 'text/html', 'Content-Length': data.length });
    response.write(data);
    response.end();
  });
}

exports.static = function(pathname, response) {
  var types = {
    'js': 'text/javascript',
    'png': 'image/png',
    'css': 'text/css'
  }
  fs.readFile('./public' + pathname, function (err, data) {
    var ext = pathname.split('.')[1];
    if (err) console.log(err);
    response.writeHead(200, { 'Content-type': types[ext] });
    response.write(data);
    response.end();
  });
}
