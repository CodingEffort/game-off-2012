var players = {};

function Player(socket) {
  var self = this;

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

  this.serialize = function() {
    return {
      id: self.id,
      //username: self.user.username,
      health: self.health,
      pos: self.pos,
      gun: (self.gun) ? self.gun.serialize() : null,
      score: self.score,
      money: self.money
    };
  };

  this.socket.emit('setup', { player: this.serialize() });

  this.socket.on('shooting', function(data) {
    self.socket.broadcast.emit('shooting', { player: self.id, shooting: data.shooting });
  });
  this.socket.on('position', function(data) {
    self.pos = data.pos;
    self.socket.broadcast.emit('position', { player: self.id, pos: self.pos });
  });
}

module.exports = function(sockets, db, config) {
  sockets.on('connection', function(socket) {
    var client = new Player(socket);
    players[client.id] = client;
  });
};

