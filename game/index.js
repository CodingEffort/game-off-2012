var players = {};

function Player(socket) {
  this.id = socket.id;
  this.socket = socket;
  this.user = {};
  this.latency = 0;

  this.worldline = 'A';
  this.health = 0;
  this.pos = { x: 0, y: 0 };
  this.gun = null;
  this.score = 0;
  this.money = 0;


}

module.exports = function(sockets, db, config) {
  sockets.on('connection', function(socket) {
    var client = new Player(socket);
    players[client.id] = client;
    sockets.in('A').emit('join', { id: client.id });
  });
};

