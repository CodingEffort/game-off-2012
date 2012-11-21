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

  this.socket.on('disconnect', function() {
    self.socket.broadcast.emit('despawn', { type: 'player', despawn: self.id });
    delete players[self.id];
  });

  this.socket.emit('setup', { player: this.serialize() });
  this.socket.broadcast.emit('spawn', { type: 'player', spawn: this.serialize() });
  for (var i in players) {
    if (i != this.id) {
      this.socket.emit('spawn', { type: 'player', spawn: players[i].serialize() });
    }
  }

  this.socket.on('shooting', function(data) {
    if (data.shooting !== undefined)
      self.socket.broadcast.emit('shooting', { player: self.id, shooting: data.shooting });
  });
  this.socket.on('position', function(data) {
    if (data.pos && data.pos.x !== undefined && data.pos.y !== undefined) {
      self.pos = data.pos;
      self.pos.x = Math.round(self.pos.x);
      self.pos.y = Math.round(self.pos.y);
      self.socket.broadcast.emit('position', { player: self.id, pos: self.pos });
    }
  });
}

module.exports = function(sockets, db, config) {
  sockets.on('connection', function(socket) {
    var client = new Player(socket);
    players[client.id] = client;
  });
};

