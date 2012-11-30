module.exports = function(socket, color, gun) {
  var self = this;

  this.id = socket.id;
  this.socket = socket;
  this.user = {};
  this.latency = 0;
  this.dt = null;

  this.branch = null;
  this.health = 100;
  this.pos = { x: 350, y: 300 };
  this.gun = gun;
  this.score = 0;
  this.cash = 0;
  this.powerups = {};
  this.shooting = false;
  this.killvotes = [];
  this.color = color;

  this.serialize = function() {
    return {
      id: self.id,
      dt: self.dt,
      color: self.color,
      //username: self.user.username,
      //branch: (self.branch) ? self.branch.serialize() : null,
      health: self.health,
      pos: self.pos,
      gun: self.gun/*.serialize()*/,
      //score: self.score,
      cash: self.cash
    };
  };

  this.init = function(branch) {
    self.socket.emit('setup', { player: self.serialize() });
    self.gainCash(0);
    branch.addPlayer(self);
    //this.socket.emit('ping', { t: Number(new Date()) });
  };

  this.gainCash = function(amount) {
    self.cash += amount;
    self.socket.emit('cash', { cash: self.cash });
  };

  this.socket.on('pong', function(data) {
    // TODO
  });

  this.socket.on('disconnect', function() {
    if (self.branch) self.branch.removePlayer(self);
  });

  this.socket.on('despawn', function(data) {
    if (data.type && data.id) {
      if (data.type == 'player' || data.type == 'enemy') {
        self.branch.voteKill(data.type, data.id, self.id, !!data.killed);
      } else if (data.type == 'powerup' && data.player) {
        self.branch.voteTakePowerup(data.id, data.playeri, self.id, !!data.killed);
      }
    }
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

  this.socket.on('health', function(data) {
    if (self.branch && data.type && data.id && data.health) {
      if (data.type == 'enemy') {
        self.branch.enemyHealth(data.id, data.health, self.id);
      }
    }
  });
};

