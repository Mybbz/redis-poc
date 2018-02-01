const PORT = 3000;
const redis = require('redis');
const socketio = require('socket.io');
const app = require('http').createServer().listen(PORT, function(){ console.log(`Broadcast is listening to ${PORT}`) });
const io = socketio.listen(app);

const globalChannels = {};

io.on('connection', function(socketConnection) {
  socketConnection.connectedChannels = {};

  socketConnection.on('subscribe', function(channelName) {
    if (globalChannels.hasOwnProperty(channelName)) {
      globalChannels[channelName].listeners[socketConnection.id] = socketConnection;
    } else {
      globalChannels[channelName] = redis.createClient();
      globalChannels[channelName].subscribe(channelName);
      globalChannels[channelName].listeners = {};

      globalChannels[channelName].listeners[socketConnection.id] = socketConnection;

      globalChannels[channelName].on('message', function(channel, msg) {
        console.log('Broadcast: ' + msg);
        Object.keys(globalChannels[channelName].listeners).forEach(function(key) {
          globalChannels[channelName].listeners[key].send(msg);
        });
      });
    }

    socketConnection.connectedChannels[channelName] = globalChannels[channelName];
  });

  socketConnection.on('unsubscribe', function(channelName) {
    if (socketConnection.connectedChannels.hasOwnProperty(channelName)) {
      delete globalChannels[channelName].listen[socketConnection.id];
      delete socketConnection.connectedChannels[channelName];
    }
  });

  socketConnection.on('disconnect', function() {
    Object.keys(socketConnection.connectedChannels).forEach(function(key) {
      delete globalChannels[key].listeners[socketConnection.id];
    });
  });
});
