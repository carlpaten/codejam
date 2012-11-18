var http = require('http')
  , url = require('url');
  
function start_server(route, handle, start_socket, start_app) {

  function on_request(request, response) {
    var pathname = url.parse(request.url).pathname;
    
    request.setEncoding("utf8");

    request.addListener("end", function() {
      route(handle, pathname, response);
    });    
 
  }
  
  var server = http.createServer(on_request).listen(8888);
  start_socket(server, start_app);
}

exports.start = start_server;