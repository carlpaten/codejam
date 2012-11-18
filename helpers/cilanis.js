var https = require('https');

function send_report(data, callback) {
  
  var options = {
    
    host: 'stage-api.e-signlive.com',
    path: '/aws/rest/services/codejam',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    },
    auth: 'Basic Y29kZWphbTpBRkxpdGw0TEEyQWQx',
    method: 'POST'
  };
  
  var req = https.request(options, function(res) {
    console.log("statusCode: ", res.statusCode);
    console.log("headers: ", res.headers);
  
    res.on('data', function(d) {
      console.log(d);
    });
  });
  req.end();
  
  req.on('error', function(e) {
    console.error(e);
  });
  
}

