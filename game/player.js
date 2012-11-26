module.exports = function(socket) {
  var self = this;

  this.id = socket.id;
  this.socket = socket;
  this.user = {};
  this.latency = 0;

  this.branch = null;
  this.health = 0;
  this.pos = { x: 0, y: 0 };
  this.gun = null;
  this.score = 0;
  this.money = 0;
  this.powerups = {};
  this.shooting = false;

  this.serialize = function() {
    return {
      id: self.id,
      //username: self.user.username,
      branch: (self.branch) ? self.branch.id : null,
      health: self.health,
      pos: self.pos,
      gun: (self.gun) ? self.gun.serialize() : null,
      score: self.score,
      money: self.money
    };
  };

  this.init = function() {
    self.socket.emit('setup', { player: self.serialize() });
    //this.socket.emit('ping', { t: Number(new Date()) });
  };

  this.socket.on('pong', function(data) {
    // TODO
  });

  this.socket.on('disconnect', function() {
    self.branch.removePlayer(self);
  });

  this.socket.on('shooting', function(data) {
    if (data.shooting !== undefined) {
      self.shooting = !!data.shooting;
      self.socket.broadcast.to(self.branch.id).emit('shooting', { player: self.id, shooting: self.shooting });
    }
  });

  this.socket.on('position', function(data) {
    if (data.pos && data.pos.x !== undefined && data.pos.y !== undefined) {
      self.pos.x = Math.round(data.pos.x);
      self.pos.y = Math.round(data.pos.y);
      self.socket.broadcast.to(self.branch.id).emit('position', { player: self.id, pos: self.pos });
    }
  });
};

