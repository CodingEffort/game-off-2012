module.exports = function(socket) {
  var self = this;

  this.id = socket.handshake.user.id;
  this.socket = socket;
  this.user = socket.handshake.user;
  this.latency = 0;
  this.dt = null;

  this.branch = null;
  this.health = this.user.health;
  this.pos = { x: 350, y: 300 };
  this.powerups = {};
  this.shooting = false;
  this.killvotes = [];
  this.healthvotes = {};

  this.serialize = function() {
    return {
      id: self.id,
      dt: self.dt,
      color: self.user.color,
      username: self.user.username,
      //branch: (self.branch) ? self.branch.serialize() : null,
      health: self.health,
      maxhealth: self.user.health,
      pos: self.pos,
      gun: self.user.gun,
      //score: self.user.score,
      cash: self.user.cash
    };
  };

  this.init = function(branch) {
    self.socket.emit('setup', { player: self.serialize() });
    self.gainCash(0);
    branch.addPlayer(self);
    //this.socket.emit('ping', { t: Number(new Date()) });
  };

  this.gainCash = function(amount) {
    self.user.cash += amount;
    self.socket.emit('cash', { cash: self.user.cash });
    self.user.save();
  };

  this.updateHealth = function() {
    var values = [];
    for (var i in self.healthvotes) {
      values.push(self.healthvotes[i]);
    }
    if (values.length > 1) {
      values.sort(function (a, b) { return a - b; });
      self.health = Math.round((values[Math.floor(values.length / 2)] + values[Math.ceil(values.length / 2)]) / 2);
    } else {
      self.health = Math.round(values[0]);
    }
  };

  this.bindSocket = function() {
    self.socket.on('pong', function(data) {
      // TODO
    });

    self.socket.on('disconnect', function() {
      if (self.branch) self.branch.removePlayer(self);
    });

    self.socket.on('despawn', function(data) {
      if (data.type && data.id) {
        if (data.type == 'player' || data.type == 'enemy') {
          self.branch.voteKill(data.type, data.id, self.id, !!data.killed);
        } else if (data.type == 'powerup' && data.player) {
          self.branch.voteTakePowerup(data.id, data.playeri, self.id, !!data.killed);
        }
      }
    });

    self.socket.on('shooting', function(data) {
      if (data.shooting !== undefined) {
        self.shooting = !!data.shooting;
        self.socket.broadcast.to(self.branch.id).emit('shooting', { player: self.id, shooting: self.shooting });
      }
    });

    self.socket.on('position', function(data) {
      if (self.branch && data.pos && data.pos.x !== undefined && data.pos.y !== undefined) {
        self.pos.x = Math.round(data.pos.x);
        self.pos.y = Math.round(data.pos.y);
        self.socket.broadcast.to(self.branch.id).emit('position', { player: self.id, pos: self.pos });
      }
    });

    self.socket.on('health', function(data) {
      if (self.branch && data.type && data.id && data.health) {
        if (data.type == 'enemy') {
          self.branch.enemyHealth(data.id, data.health, self.id);
        } else if (data.type == 'player') {
          
        }
      }
    });
  };

  this.bindSocket();
};

