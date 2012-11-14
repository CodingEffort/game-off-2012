var players = {};

function Player(socket) {
  this.id = socket.id;
  this.socket = socket;
  this.user = {};

  this.health = 0;
  this.pos = { x: 0, y: 0 };

  // TODO: Join correct dimension
  socket.join('A');

  socket.emit('start');
}

module.exports = function(sockets, db, config) {
  sockets.on('connection', function(socket) {
    var client = new Player(socket);
    players[client.id] = client;
    io.sockets.in('A').emit('join', { id: client.id });
  });
};

