module.exports = function(socket, game) {
  var self = this;

  this.id = socket.handshake.user.id;
  this.socket = socket;
  this.game = game;
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
      health: self.health,
      maxhealth: self.user.health,
      pos: self.pos,
      gun: self.user.gun,
      guns: self.user.guns,
      score: self.user.score,
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
    self.user.cash += Math.floor(amount);
    self.socket.emit('cash', { cash: self.user.cash });
    if (amount > 0) self.user.score += Math.floor(amount);
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

  this.updateBranches = function() {
    var branches = [];
    for (var i in self.game.repo) {
      var b = self.game.repo[i].serialize();
      b.lockout = (self.user.lockout.indexOf(b.id) !== -1);
      if (!(i in self.user.lockout)) branches.push(b);
    }
    self.socket.volatile.emit('branches', { branches: branches, current: self.user.branch });
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
        if (data.type == 'player' || data.type == 'enemy' && self.branch) {
          self.branch.voteKill(data.type, data.id, self.id, !!data.killed);
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
          self.branch.playerHealth(data.id, data.health, self.id);
        }
      }
    });

    self.socket.on('shop', function(data) {
      if (data.item) {
        if (data.item in self.game.config.powerups && self.user.cash >= self.game.config.powerups[data.item]) {
          self.gainCash(-self.game.config.powerups[data.item]);
          self.branch.broadcast('powerup', { type: data.item, player: self.id });
        } else if (data.item in self.game.config.guns) {
          if (self.user.guns.indexOf(data.item) === -1) {
            if (self.user.cash >= self.game.config.guns[data.item]) {
              self.gainCash(-self.game.config.guns[data.item]);
              self.user.guns.push(data.item);
            } else {
              return;
            }
          }
          self.user.gun = data.item;
          self.branch.broadcast('gun', { gun: data.item, player: self.id });
          self.user.save();
        } else if (data.item === "MaxHealthPlus") {
          if (self.user.cash >= 500) {
            self.gainCash(-500);
            self.user.health += 10;
            self.user.save();
            self.health += 10;
            self.branch.broadcast('health', { type: 'player', id: self.id, health: self.health, maxhealth: self.user.health });
          }
        }
      }
    });

    self.socket.on('branch', function(data) {
      if (data.branch) {
        if (data.branch in self.game.repo && self.user.lockout.indexOf(data.branch) === -1) {
          self.game.repo[data.branch].addPlayer(self);
          self.updateBranches();
        }
      }
    });

    self.socket.on('branches', function() {
      self.updateBranches();
    });
  };

  this.bindSocket();
};

