"use strict";

// External Modules

GLOBAL._ = require('underscore');

var net = require('net');

// User Modules

var server = require('./client/server')
  , socket = require('./client/socket')
  , router = require('./client/router')
  , actions = require('./client/actions')
  , strategies = require('./strategies')
  , report = require('./helpers/report');
  // , cilanis = require('./helpers/cilanis');
  
// Globals

var Strategies = strategies.Strategies;
var pricefeed = [];
var crt = -1;
var http_server;
  
// HTTP Server

var time = 0;
var handle = {};

handle['/'] = actions.index;
handle['static'] = actions.static;

server.start(router.route, handle, socket.start, start_app);

function start_app(socket) {
  
  // TCP Server
  
  var price_client = net.connect({ port: 8000 });
  
  socket.on('start', function(data) {
    console.log('Price client connected');
    price_client.write('H\n');
  });
  
  price_client.setEncoding('ascii');
  
  price_client.on('data', function(data) {
  
    var arr = data.toString().split("|");
  
    if(arr.pop() == "C") { //Empty string, except when it's C, then it means the exchange closed
      trade_client.end();
      price_client.end();
    }
  
    arr = arr.map(function(a) { return parseFloat(a); });
  
    _.map(arr, function(val) {
      pricefeed.push(val);
      Strategies.populate(_.last(pricefeed, 21));
      crt++;
      if(crt % 100 == 0) {
        var payload = {'time': crt, 'price': _.last(pricefeed)};
        _.each(['SMA', 'LWMA', 'EMA', 'TMA'], function(scheme) {
          var key = scheme.toLowerCase();
          payload[key] = {};
          payload[key].slow = _.last(Strategies[scheme].slow);
          payload[key].fast = _.last(Strategies[scheme].fast);
        });
        socket.emit('data', payload);
      }
    });
    
    _.each(['SMA', 'LWMA', 'EMA', 'TMA'], function(scheme) {
      xOver(
        _.last(Strategies[scheme].fast),
        _.last(Strategies[scheme].slow),
        Strategies[scheme].name,
        trade_client.buy,
        trade_client.sell
      )
    }); 
    
  });
  
  price_client.on('end', function() {    
    console.log('Price client disconnected');
  });
  
  var fastAboveSlow; //Initialize to the right value!
  
  function xOver(fast, slow, name, buy, sell) {
    if(typeof fastAboveSlow === 'undefined') {
      fastAboveSlow = fast > slow;
      return;
    }
    xOverHelper(fast, slow, name, buy, sell);
  }
  
  function xOverHelper(fast, slow, name, buy, sell) {
    if( fastAboveSlow != (fast > slow) ) {
      fastAboveSlow = !fastAboveSlow;
      
      if(fast > slow) {
        buy( name );
      } else {
        sell( name );
      }
    }
  }
  
  var trade_client = net.connect( {port: 9000} );
  
  trade_client.setEncoding('ascii');
  
  var bstypes = [],
    bsprices = [],
    bsstrategies = [],
    minTimes = [],
    maxTimes = [];
  
  trade_client.buy = function(strategy) {
    if(maxTimes.length <= 32400) {
      trade_client.write('B\n');
      bstypes.push("buy");
      bsstrategies.push(strategy);
      minTimes.push(crt);
    }
  }
  
  trade_client.sell = function(strategy) {
    if(maxTimes.length <= 32400) {
      trade_client.write('S\n');
      bstypes.push("sell");
      bsstrategies.push(strategy);
      minTimes.push(crt);
    }
  }
  
  trade_client.on('data', function(data) {
    if(data.toString() == "E") {
      console.log("E");
    }
    maxTimes.push(crt);
    bsprices.push(data);
  });
  
  
  
  trade_client.on('end', function() {
    var pricesfmt = [];
    _.map(bsprices, function(price) {
      pricesfmt = pricesfmt.concat(
        _.map(price.toString().match(/\d+\.\d{3}/g), parseFloat)
      )
    });
  
    pricesfmt = _.compact(pricesfmt);
  
    var bstimes = _.map(
      _.zip(minTimes, maxTimes, pricesfmt),
      function (arr) {
        return _.find(
          _.range(arr[0], pricefeed.length),
          function(a) {
            return pricefeed[a] == arr[2];
          });
      });
  
    var transactionInfo = report.formatTransactionInfo(bstimes, bstypes, pricesfmt, bsstrategies);
    console.log(transactionInfo);
    socket.emit('report', transactionInfo);
    console.log("reported");
  });
  
}



