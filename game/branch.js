var Enemy = require('./enemy');
var wave = require('./waves_content');

var branchId = 0;

function isEmpty(obj) {
  for (var key in obj) if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
  return true;
}

module.exports = function(sockets, game, path, name, desc) {
  var self = this;

  this.sockets = sockets;
  this.game = game;

  this.id = ++branchId;
  this.players = {};
  this.powerups = {};
  this.enemies = {};
  this.votes = {};
  this.dt = 0;
  this.path = (path || []).slice(0);
  this.waveTimer = {};
  this.waveDelay = 3000;
  this.waveCount = 0;
  this.population = 0;
  this.name = name || 'Issue #' + self.id;
  this.desc = desc || 'Fix Issue #' + self.id;

  this.path.push({
    id: self.id,
    name: self.name,
    desc: self.desc
  });

  var p = 'New branch: ';
  for (var i = 0; i < self.path.length; ++i) {
    p += self.path[i].name + ((i < self.path.length - 1) ? ' > ' : '');
  }
  console.log(p);

  this.doFrame = function() {
    ++self.dt;
    if (self.dt % 10 === 0) { // broad cast every n frames the current dt (refucktor me please, just makin' it work for now)
      self.broadcast('dt', { dt: self.dt });
      var c = 0;
      for (var id in self.players) ++c;
      self.population = c;
    }
  };

  var frameInterval = setInterval(self.doFrame, 1000/30);

  this.destroy = function() {
    frameInterval.clear();
    if (waveTimer) waveTimer.clear();
  };

  this.broadcast = function(event, data) {
    self.sockets.in(self.id).emit(event, data);
  };

  this.addPlayer = function(player) {
    if (!self.hasPlayer(player.id)) {
      if (player.branch) {
        player.branch.removePlayer(player);
      }
      player.socket.join(self.id);
      player.branch = self;
      player.dt = self.dt;
      player.killvotes = [];
      self.players[player.id] = player;
      ++self.population;
      player.socket.emit('branch', { player: player.serialize(), path: self.path });
      self.broadcast('spawn', { type: 'player', spawn: player.serialize() });
      for (var id in self.players) {
        if (id != player.id) player.socket.emit('spawn', { type: 'player', spawn: self.players[id].serialize() });
      }
      for (var eid in self.enemies) {
        player.socket.emit('spawn', { type: 'enemy', spawn: self.enemies[eid].serialize() });
      }

      if (self.population === 1 && isEmpty(self.enemies)) {
        self.waveTimer = setTimeout(self.spawnWave, self.waveDelay);
      }
    }
  };

  this.hasPlayer = function(playerId) {
    return !!self.players[playerId];
  };

  this.removePlayer = function(player) {
    if (self.hasPlayer(player.id)) {
      self.broadcast('despawn', { type: 'player', id: player.id });
      delete self.players[player.id];
      player.socket.leave(self.id);
      for (var id in self.players) {
        if (id !== player.id) player.socket.emit('despawn', { type: 'player', id: id });
      }
      for (var id in self.enemies) {
        player.socket.emit('despawn', { type: 'enemy', id: id });
      }
      for (var id in self.powerups) {
        player.socket.emit('despawn', { type: 'powerup', id: id });
      }
      player.branch = null;
      player.killvotes = [];
      delete self.players[player.id];
      --self.population;
      self.broadcast('despawn', { type: 'player', id: player.id });
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
      self.broadcast('despawn', { type: 'powerup', id: powerupId });
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
      self.broadcast('despawn', { type: 'enemy', id: enemyId });
    }
  };

  this.voteKill = function(type, id, voter) {
    if (type == 'player' && self.hasPlayer(id) && self.players[id].killvotes.indexOf(voter) === -1) {
      self.players[id].killvotes.push(voter);
      if (self.players[id].killvotes.length >= Math.floor(self.population / 2) + 1) {
        var b = self.game.makeBranch(self);
        b.addPlayer(self.players[id]);
      }
    } else if (type == 'enemy' && self.hasEnemy(id) && self.enemies[id].killvotes.indexOf(id) === -1) {
      self.enemies[id].killvotes.push(voter);
      if (self.enemies[id].killvotes.length >= Math.floor(self.population / 2) + 1) {
        // TODO: add cash enemy died
        delete self.enemies[id];
        self.broadcast('despawn', { type: 'enemy', id: id });
        if (isEmpty(self.enemies)) {
          self.waveTimer = setTimeout(self.spawnWave, self.waveDelay);
        }
      }
    }
  };

  this.spawnWave = function() {
    ++self.waveCount;
    console.log("Branch " + self.name + ": Wave #" + self.waveCount);
    var w = wave.waves[Math.floor(Math.random()*wave.waves.length)];
    self.waveDelay = w.pause;
    for (var i in w.enemies) {
      var path = wave.getWaveParamValue(w.enemies[i].path);
      var pos = wave.getStartPosForPath(path)();
      var gun = wave.getWaveParamValue(w.enemies[i].gun);
      var enemy = new Enemy(pos.x, pos.y, wave.getWaveParamValue(w.enemies[i].type), gun, path, self.dt);
      console.log(enemy.type + ", (" + pos.x + "," + pos.y + "), " + path);
      self.addEnemy(enemy);
    }
  };
};

