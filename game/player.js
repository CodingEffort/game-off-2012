module.exports = function(socket, color, gun) {
  var self = this;

  this.id = socket.id;
  this.socket = socket;
  this.user = {};
  this.latency = 0;
  this.dt = undefined;

  this.branch = null;
  this.health = 0;
  this.pos = { x: 350, y: 300 };
  this.gun = gun;
  this.score = 0;
  this.money = 0;
  this.powerups = {};
  this.shooting = false;
  this.color = color;

  this.serialize = function() {
    return {
      id: self.id,
      dt: self.dt,
      color: self.color,
      //username: self.user.username,
      branch: (self.branch) ? self.branch.id : null,
      health: self.health,
      pos: self.pos,
      gun: self.gun/*.serialize()*/,
      score: self.score,
      money: self.money
    };
  };

  this.init = function(branch) {
    this.dt = branch.dt;
    self.socket.emit('setup', { player: self.serialize() });
    branch.addPlayer(self);
    //this.socket.emit('ping', { t: Number(new Date()) });
  };

  this.socket.on('pong', function(data) {
    // TODO
  });

  this.socket.on('disconnect', function() {
    if (self.branch) self.branch.removePlayer(self);
  });

  this.socket.on('shooting', function(data) {
    if (data.shooting !== undefined) {
      self.shooting = !!data.shooting;
      self.socket.broadcast.to(self.branch.id).emit('shooting', { player: self.id, shooting: self.shooting });
    }
  });

  this.socket.on('position', function(data) {
    if (self.branch && data.pos && data.pos.x !== undefined && data.pos.y !== undefined) {
      self.pos.x = Math.round(data.pos.x);
      self.pos.y = Math.round(data.pos.y);
      self.socket.broadcast.to(self.branch.id).emit('position', { player: self.id, pos: self.pos });
    }
  });
};

