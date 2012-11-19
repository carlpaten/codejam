function start_socket(server, start_app) {
  var io = require('socket.io').listen(server, {log: false});

  io.sockets.on('connection', function(s) {
    start_app(s);
  });

}

exports.start = start_socket;