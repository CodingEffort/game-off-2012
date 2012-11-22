module.exports = function(sockets, id) {
  var self = this;

  this.sockets = sockets;
  this.id = id;
  this.players = {};
  this.powerups = {};
  this,enemies = {};

  this.broadcast = function(event, data) {
    self.sockets.in(self.id).emit(event, data);
    /*for (var id in self.players) {
      if ((data.player && data.player.id && id == data.player.id) || (data.player && id == data.player)) {
          next;
      }
      self.players[id].socket.emit(event, data);
    }*/
  }

  this.addPlayer = function(player) {
    if (player.worldline)
      player.worldline.removePlayer(player);
    player.socket.join(self.id);
    player.worldline = self;
    self.players[player.id] = player;
    self.broadcast('spawn', { type: 'player', spawn: player.serialize() });
    for (var id in self.players) {
      if (id != player.id) player.socket.emit('spawn', { type: 'player', spawn: self.players[id].serialize() });
    }
  };

  this.hasPlayer = function(playerId) {
    return !!self.players[playerId];
  };

  this.removePlayer = function(player) {
    if (self.hasPlayer(player.id)) {
      player.socket.leave(self.id);
      player.worldline = null;
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

  this.addEnemy = function(todo) {
    // TODO
  };

  this.hasEnemey = function(enemyId) {
    return !!self.enemies[enemyId];
  };

  this.removeEnemey = function(enemyId) {
    if (self.hasEnemy(enemyId)) {
      delete self.enemies[enemyId];
      self.broadcast('despawn', { type: 'enemy', despawn: enemyId });
    }
  };
};

