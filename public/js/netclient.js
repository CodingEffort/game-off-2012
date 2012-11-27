function NetClient() {
  var self = this;

  // Attributes
  this.socket = null;
  this.player = null;

  // Flow control
  this.positionTimeout = null;
  this.positionBuffer = null;

  // Events
  this.events = {
    connected: null,
    spawn: null,
    despawn: null,
    shooting: null,
    position: null,
    powerup: null,
    health: null,
    money: null,
    score: null,
    gun: null,
    dt: null
  };

  // Event management
  this.bind = function(event, callback) {
    if (event in self.events) {
      self.events[event] = callback;
    }
  };

  this.unbind = function(event) {
    if (event in self.events) {
      self.events[event] = null;
    }
  };

  this.connect = function() {
    // Connection boostrapping
    self.socket = io.connect();

    self.socket.on('setup', function(data) {
      self.player = data.player;
      if (self.events.connected) self.events.connected(self.player);
    });

    self.socket.on('ping', function(data) {
      self.socket.emit('pong', { t: Number(new Date()), rx: new Date() - data.t });
    });

    self.socket.on('dt', function(data) {
      if (self.events.dt) self.events.dt(data.dt);
    });

    // Rx
    self.socket.on('spawn', function(data) {
      if (self.events.spawn) self.events.spawn(data.type, data.spawn);
    });

    self.socket.on('despawn', function(data) {
      if (self.events.despawn) self.events.despawn(data.type, data.despawn);
    });

    self.socket.on('shooting', function(data) {
      if (data.player !== self.player.id && self.events.shooting) self.events.shooting(data.player, data.shooting);
    });

    self.socket.on('position', function(data) {
      if (data.player !== self.player.id && self.events.position) self.events.position(data.player, data.pos);
    });

    self.socket.on('powerup', function(data) {
      if (self.events.powerup) self.events.powerup(data.player, data.powerup);
    });

    self.socket.on('money', function(data) {
      if (self.events.money) self.events.money(data.money);
    });

    self.socket.on('score', function(data) {
      if (self.events.score) self.events.score(data.score);
    });

    self.socket.on('gun', function(data) {
      if (self.events.gun) self.events.gun(data.player, data.gun);
    });
  };

  // Tx
  this.position = function(x, y) {
    if (self.player) {
      self.player.pos = { x: Math.round(x), y: Math.round(y) };
      if (self.positionTimeout === null) {
        self.socket.emit('position', self.player.pos);
        self.positionTimeout = setTimeout(function() {
          if (self.positionBuffer) {
            self.socket.emit('position', { pos: self.positionBuffer });
            self.positionBuffer = null;
          }
          self.positionTimeout = null;
        }, 100);
      } else {
        self.positionBuffer = self.player.pos;
      }
    }
  };
  this.shooting = function(shooting) {
    self.player.shooting = shooting;
    self.socket.emit('shooting', { shooting: shooting });
  };
  // Temp Tx, to be removed
  this.powerup = function(powerup) {
    self.socket.emit('powerup', { powerup: powerup });
  };
  this.despawn = function(despawnType, obj) {
    self.socket.emit('despawn', { type: despawnType, despawn: obj });
  };
}

