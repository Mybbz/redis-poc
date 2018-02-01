const io = require('socket.io-client');
const broadcastServerUrl = 'http://localhost:3000';
const conn = io.connect(broadcastServerUrl);

console.log('Client server');
conn.emit('subscribe', 'pocchannel');
conn.on('message', function(msg) {
  console.log(msg);
  conn.emit('unsubscribe', 'pocchannel');
});
