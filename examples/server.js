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
  connect["static"](__dirname + '/../node_modules/tinycolor2/dist'),
  connect["static"](__dirname + '/../node_modules/lodash/dist'),
  connect["static"](sharejs.scriptsDir)
);

var backend = livedb.client(livedbMongo('localhost:27017/test?auto_reconnect', {
  safe: false
}));

var share = sharejs.server.createClient({backend: backend});

var clientsById = {};

webserver.use(browserChannel({webserver: webserver, sessionTimeoutInterval: 5000}, function (client) {
  clientsById[client.id] = client;
  //client.send({_type: 'connectionId', connectionId: client.id});

  var stream = new Duplex({objectMode: true});
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
    console.log('ERROR', msg, client.id);
    client.stop();
  });
  client.on('close', function (reason) {
    console.log('CLOSE', reason, client.id);
    stream.emit('close');
    stream.emit('end');
    stream.end();
    delete clientsById[client.id];
  });
  return share.listen(stream);
}));

webserver.listen(7007);
console.log("Listening on http://localhost:7007/");
