exports.publish=function(package,readme){

}
var post = function(url, data) {
  var urlObj = Url.parse(url);
  if(data) {
    data = new Buffer(JSON.stringify(data));
    var headers = {
      "Content-Type"   : 'application/json;charset=UTF-8',
      "Content-Length" : data.length
    }
  }
  else {
    headers = {
      "Content-Length" : 0
    }
  }

  var p = new Promise();
  var req = Http.request({
    host    : urlObj.hostname,
    method  : 'post',
    path    : urlObj.path,
    port    : urlObj.port || 80,
    headers : headers
  }, function(res) {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk.toString();
    });
    res.on('end', function() {
      if(res.statusCode == 200) {
        p.resolve(body);
      }
      else {
        if(res.statusCode==500){
          console.warn('500 Error:',url,data);
        }
        p.reject(res.statusCode);
      }
    });
  });

  req.on('error', function(err) {
    var e = new Error('Connect Error for request for ' + url);
    e.name = 'Http Request Error';
    p.reject(e);
  });
  if(data != null)req.write(data);
  req.end();
  return p;
};
