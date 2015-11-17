var http = require('http');

/// helper functions
module.exports = {

  swap: function swap(array, i, j) {
    var x = array[i]; array[i] = array[j]; array[j] = x;
  },

  do_http: function(options, cb) {
    var req = http.request(options, function(res){
      var body = [];
      res.on('data', function(data){ body.push(data); });
      res.on('end',  function() { cb(null, body.join('')); })
    });
    req.on('error', function(e){ cb(e); });
    req.end();
  },

};
