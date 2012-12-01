var Enemy = require('./enemy');
var wave = require('./waves_content');

var branchId = 0;

function isEmpty(obj) {
  for (var key in obj) if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
  return true;
}

module.exports = function(sockets, game, parent, id, name, desc) {
  var self = this;

  this.sockets = sockets;
  this.game = game;
  this.parent = parent;

  ++branchId;
  this.id = id;
  this.players = {};
  this.powerups = {};
  this.enemies = {};
  this.votes = {};
  this.dt = 0;
  this.path = (parent) ? parent.path.slice(0) : [];
  this.waveTimer = {};
  this.waveDelay = 3000;
  this.waveCount = 0;
  this.population = 0;
  this.name = name || 'Issue #' + branchId;
  this.desc = desc || 'Fix Issue #' + branchId;
  this.bossWave = false;
  this.finalBoss = false;
  this.difficultymod = (parent) ? parent.difficultymod * 0.9 : 1;

  this.path.push(self);

  var p = 'New branch: ';
  for (var i = 0; i < self.path.length; ++i) {
    p += self.path[i].name + ((i < self.path.length - 1) ? ' > ' : '');
  }
  console.log(p);

  this.serialize = function() {
    return {
      id: self.id,
      name: self.name,
      pop: self.population
    };
  };

  this.serializePath = function() {
    var p = [];
    for (var i = 0; i < self.path.length; ++i) {
      p.push(self.path[i].serialize());
    }
    return p;
  };

  this.doFrame = function() {
    if (self.population > 0) {
      ++self.dt;
      if (self.dt % 10 === 0) { // broad cast every n frames the current dt (refucktor me please, just makin' it work for now)
        self.broadcast('dt', { dt: self.dt });
        var c = 0;
        for (var id in self.players) ++c;
        self.population = c;
      }
    }
  };

  this.frameInterval = setInterval(self.doFrame, 1000/30);

  this.destroy = function() {
    clearInterval(self.frameInterval);
    if (self.waveTimer) clearTimeout(self.waveTimer);
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
      player.user.branch = self.id;
      if (player.user.lockout.indexOf(self.id) !== -1) {
        player.user.lockout.splice(player.user.lockout.indexOf(self.id), 1);
      }
      player.user.save();
      player.dt = self.dt;
      player.killvotes = [];
      player.healthvotes = {};
      self.players[player.id] = player;
      ++self.population;
      player.socket.emit('branch', { player: player.serialize() });
      player.socket.emit('path', { path: self.serializePath() });
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
        if (self.enemies[id].healthvotes[player.id] !== undefined) delete self.enemies[id].healthvotes[player.id];
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

  this.playerHealth = function(playerId, health, voter) {
    if (self.hasPlayer(playerId) && self.hasPlayer(voter)) {
      self.players[playerId].healthvotes[voter] = health;
      self.players[playerId].updateHealth();
      if (health <= 0) {
        self.voteKill('player', playerId, voter);
      }
    }
  }

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

  this.enemyHealth = function(enemyId, health, voter) {
    if (self.hasEnemy(enemyId) && self.hasPlayer(voter)) {
      self.enemies[enemyId].healthvotes[voter] = health;
      self.enemies[enemyId].updateHealth();
      if (health <= 0) {
        self.voteKill('enemy', enemyId, voter, true);
      }
    }
  };

  this.voteKill = function(type, id, voter, killed) {
    if (self.hasPlayer(voter)) {
      if (type == 'player' && self.hasPlayer(id)) {
        if (self.players[id].killvotes.indexOf(voter) === -1) self.players[id].killvotes.push(voter);
        if (self.players[id].killvotes.length >= Math.floor(self.population / 2) + 1) {
          self.players[id].health = self.players[id].user.health;
          self.players[id].user.lockout.push(self.id);
          self.players[id].user.save();
          var b = self.game.makeBranch(self);
          self.broadcast('msg', { msg: self.players[id].user.username + ' made a branch to work on issue "' + b.desc + '"'});
          b.addPlayer(self.players[id]);
          self.game.broadcastBranches();
        }
      } else if (type == 'enemy' && self.hasEnemy(id) && self.enemies[id].killvotes.indexOf(id) === -1) {
        self.enemies[id].killvotes.push(voter);
        if (self.enemies[id].killvotes.length >= Math.floor(self.population / 2) + 1) {
          if (killed) {
            for (var pid in self.players) {
              self.players[pid].gainCash(self.enemies[id].cash);
            }
          }
          self.removeEnemy(id);
          if (isEmpty(self.enemies)) {
            if (self.bossWave && self.parent) {
              for (var idp in self.players) {
                self.parent.addPlayer(self.players[idp]);
              }
              self.parent.broadcast('msg', { msg: self.name + ' was merged back into ' + self.parent.name + '!' });
              self.waveCount = 0;
              self.game.removeBranch(self);
            } else {
              if (self.finalBoss) {
                self.waveCount = 0;
                self.game.increaseDifficulty();
              }
              self.waveTimer = setTimeout(self.spawnWave, self.waveDelay);
            }
          }
        }
      }
    }
  };

  // Returns the index of the wave that we should pick.
  // The maths are a little special with this one, but it handles the even distribution
  // of the wave spawning chances, as the game goes further ahead.
  this.getWaveIndex = function() {
    var PROBABILITY_PEAK = 100; // the peak of the highest probability (the probability of the most likely wave). The probabilities are not "normalized" (they're not really probabilities), so any number works here
    var AVERAGE_TOTAL_WAVES = 20; // the desired amount of waves on average to reach the last wave

    var wavesSoFar = this.waveCount; // the amount of waves that we have encountred so far
    var wavesCount = wave.waves.length; // the total amount of possible waves

    // We find we've reached what progress (percentage) of the waves to hit the desired average total waves
    var totalAverageProgress = wavesSoFar / AVERAGE_TOTAL_WAVES;

    var probabilityFunc = function(waveIndex) {
      var a = PROBABILITY_PEAK/2; // our max is peak, our min is 0. A = max-min, or peak. |a| = A/2 = peak/2. a is positive (start high)
      var b = Math.PI / wavesCount; // We use 2(totalwaves) as the Frequence, p = 1/F = 1/2n. p = 2PI/b, b = 2PI(2n)
      var k = PROBABILITY_PEAK/2; // k = (max+min)/2, or (peak+0)/2, peak/2
      var h = totalAverageProgress * wavesCount; // the more we advance towards the average, the more chance we have to get the last wave
      return -1/(wavesCount*2) * (waveIndex * waveIndex - h) + 1.0 * // The multiplier to encourage wave indices close to the peak
        a * Math.cos(b * (waveIndex-h)) + k;
    };

    // Right now we want fast branch gameplay. So, if we busted the max waves count, simply throw the last wave
    if (totalAverageProgress >= 1) return wavesCount-1;

    // Otherwise, we go and find the sum of all the possible waves, to be able to scale our random number accordingly up to the highest probability
    var probabilitySum = 0;
    for (var i = 0; i < wavesCount; ++i)
    {
      //console.log("Prob("+i+")="+probabilityFunc(i)); // To observe the probability distribution
      probabilitySum += probabilityFunc(i);
    }

    // We then choose our probability sum at random from all the possible sums.
    var desiredProbabilitySum = Math.random() * probabilitySum;

    // And find the right wave accordingly:
    for (var w = 0; w < wavesCount; ++w)
    {
      var waveProbability = probabilityFunc(w);
      if (desiredProbabilitySum <= waveProbability) // is this the wave?
        return w;
      else
        desiredProbabilitySum -= waveProbability; // keep checking with the other waves
    }

    // Couldn't find anything? Well, that's weird. Here, take a final boss.
    return wavesCount-1;
  };

  this.spawnWave = function() {
    var waveIndex = self.getWaveIndex(self.waveCount);

    ++self.waveCount;
    console.log("Branch " + self.name + ": Wave #" + self.waveCount + " (index " + waveIndex + ")");

    var w = wave.waves[waveIndex];
    self.waveDelay = w.pause;
    for (var i in w.enemies) {
      var path = wave.getWaveParamValue(w.enemies[i].path);
      var pos = wave.getStartPosForPath(path)();
      var gun = wave.getWaveParamValue(w.enemies[i].gun);
      var cash = wave.getWaveParamValue(w.enemies[i].cash);
      self.bossWave = !!w.boss;
      self.finalBoss = !!w.finalBoss;
      var enemy = new Enemy(pos.x, pos.y, wave.getWaveParamValue(w.enemies[i].type), gun, path,
        self.dt, cash*self.difficultymod, self.difficultymod);
      console.log(enemy.type + ", (" + pos.x + "," + pos.y + "), " + path);
      self.addEnemy(enemy);
    }
    if (self.bossWave && self.parent) {
      self.broadcast('msg', { msg: "IT'S MERGING TIME!", merge: true });
    }
  };
};

