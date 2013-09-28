var Duplex = require('stream').Duplex;
var browserChannel = require('browserchannel').server;
var connect = require('connect');
var livedb = require('livedb');
var livedbMongo = require('livedb-mongo');
var sharejs = require('share');
var shareCodeMirror = require('..');

var webserver = connect(
  connect["static"](__dirname),
  connect["static"](shareCodeMirror.scriptsDir),
  connect["static"](__dirname + '/../node_modules/codemirror/lib'),
  connect["static"](sharejs.scriptsDir)
);

var backend = livedb.client(livedbMongo('localhost:27017/test?auto_reconnect', {
  safe: false
}));

var share = sharejs.server.createClient({backend: backend});

webserver.use(browserChannel({webserver: webserver}, function (client) {
  var stream = new Duplex({objectMode: true});
  console.log('CLIENT');
  stream._write = function (chunk, encoding, callback) {
    if (client.state !== 'closed') {
      client.send(chunk);
    }
    callback();
  };
  stream._read = function () {
  };
  stream.headers = client.headers;
  stream.remoteAddress = stream.address;
  client.on('message', function (data) {
    stream.push(data);
  });
  stream.on('error', function (msg) {
    client.stop();
  });
  client.on('close', function (reason) {
    stream.emit('close');
    stream.emit('end');
    stream.end();
  });
  return share.listen(stream);
}));

webserver.listen(7007);
console.log("Listening on http://localhost:7007/");
