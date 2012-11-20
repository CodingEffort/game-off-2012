function NetClient() {
  // Attributes
  this.socket = io.connect();

  // Events
  this.events = {
    connected: null,
    spawn: null,
    join: null,
    startshoot: null,
    stopshoot: null,
    position: null,
    powerup: null,
    money: null,
    score: null,
    gun: null
  };

  // Event manager
  this.bind = function(event, callback) {
    if (event in this.events) {
      this.events[event] = callback;
    }
  };
  this.unbind = function(event) {
    if (event in this.events) {
      this.events[event] = null;
    }
  };

  // Socket managers
  this.socket.on('connected', function() {
    if (this.events.connected) this.events.connected();
  });
  this.socket.on('ping', function(data) {
    this.socket.emit('pong', { t: new Date(), rx: new Date() - data.t });
  });
  this.socket.on('spawn', function(data) {
    if (this.events.spawn) this.events.spawn(data.enemy);
  });
  this.socket.on('join', function(data) {
    if (this.events.join) this.events.join(data.player);
  });
  this.socket.on('startshoot', function(data) {
    if (this.events.startshoot) this.events.startshoot(data.player);
  });
  this.socket.on('stopshoot', function(data) {
    if (this.events.stopshoot) this.events.stopshoot(data.player);
  });
  this.socket.on('position', function(data) {
    if (this.events.position) this.events.position(data.player);
  });
  this.socket.on('powerup', function(data) {
    if (this.events.powerup) this.events.powerup(data.powerup);
  });
  this.socket.on('money', function(data) {
    if (this.events.money) this.events.money(data.money);
  });
  this.socket.on('score', function(data) {
    if (this.events.score) this.events.score(data.score);
  });
  this.socket.on('gun', function(data) {
    if (this.events.gun) this.events.gun(data.player, data.gun);
  });
}

