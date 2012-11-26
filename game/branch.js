var Enemy = require('./enemy');
var Waves = require('./waves_content');

module.exports = function(sockets, id) {
  var self = this;

  this.sockets = sockets;
  this.id = id;
  this.players = {};
  this.powerups = {};
  this.enemies = {};
  this.dT = 0;

  this.doFrame = function() {
    ++self.dT;
    if (self.dT % 10 === 0) { // broad cast every n frames the current dT (refucktor me please, just makin' it work for now)
      self.broadcast('updatedt', { dT: self.dT });
    }
  };

  var frameInterval = setInterval(this.doFrame, 1000/30);

  this.destroy = function() {
    frameInterval.clear();
  };

  this.broadcast = function(event, data) {
    self.sockets.in(self.id).emit(event, data);
    /*for (var id in self.players) {
      if ((data.player && data.player.id && id == data.player.id) || (data.player && id == data.player)) {
          next;
      }
      self.players[id].socket.emit(event, data);
    }*/
  };

  this.addPlayer = function(player) {
    if (player.branch)
      player.branch.removePlayer(player);
    player.dT = self.dT;
    player.socket.join(self.id);
    player.branch = self;
    self.players[player.id] = player;
    self.broadcast('spawn', { type: 'player', spawn: player.serialize() });
    for (var id in self.players) {
      if (id != player.id) player.socket.emit('spawn', { type: 'player', spawn: self.players[id].serialize() });
    }

    for (var eid in self.enemies) {
      player.socket.emit('spawn', { type: 'enemy', spawn: self.enemies[eid].serialize() });
    }
    //TESTING ZONE
    self.spawnWave();
  };

  this.hasPlayer = function(playerId) {
    return !!self.players[playerId];
  };

  this.removePlayer = function(player) {
    if (self.hasPlayer(player.id)) {
      player.socket.leave(self.id);
      player.branch = null;
      delete self.players[player.id];
      self.broadcast('despawn', { type: 'player', despawn: player.id });
    }
  };

  this.addPowerup = function(todo) {
    // TODO
  };

  this.hasPowerup = function(powerupId) {
    return !!self.powerups[powerupId];
  };

  this.removePowerup = function(powerupId) {
    if (self.hasPowerup(powerupId)) {
      delete self.powerups[powerupId];
      self.broadcast('despawn', { type: 'powerup', despawn: powerupId });
    }
  };

  this.addEnemy = function(enemy) {
    self.enemies[enemy.id] = enemy;
    self.broadcast('spawn', { type: 'enemy', spawn: enemy.serialize() });
  };

  this.hasEnemy = function(enemyId) {
    return !!self.enemies[enemyId];
  };

  this.removeEnemy = function(enemyId) {
    if (self.hasEnemy(enemyId)) {
      delete self.enemies[enemyId];
      self.broadcast('despawn', { type: 'enemy', despawn: enemyId });
    }
  };

  this.spawnWave = function() {
    var waves = new Waves();
    var enemies = waves.waves[Math.floor(Math.random()*waves.waves.length)];
    for (var i in enemies)
    {
      var path = waves.getWaveParamValue(enemies[i].path);
      var pos = waves.getStartPosForPath(path);
      var enemy = new Enemy(pos.x, pos.y,
        waves.getWaveParamValue(enemies[i].type),
        path,
        self.dT);
      this.addEnemy(enemy);
    }
  };
};

