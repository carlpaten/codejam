exports.route = function(handle, pathname, response) {
  if (typeof handle[pathname] === 'function') {
    handle[pathname](response);
  } else if(/\.(js|png|css)/.test(pathname)) {
    handle['static'](pathname, response)
  } else {
    console.log("No request handler found for " + pathname);
        
    response.writeHead(404, {"Content-type": "text/plain"});
    response.write("404 Not found");
    response.end();
  }
  
}