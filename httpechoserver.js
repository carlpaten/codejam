"use strict";

var http = require('http');

var server = http.createServer(function (request, response) {
	console.log(request);
});

server.listen(8887);