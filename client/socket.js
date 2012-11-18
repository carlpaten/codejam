function start_socket(server, start_app) {
  var io = require('socket.io').listen(server);

  io.sockets.on('connection', function(s) {
     
    
    s.emit('news', { hello: 'world' });
    s.on('my other event', function (data) {
      console.log(data);
    });
  
    start_app(s);
  });

}

exports.start = start_socket;