var enemyId = 0;

module.exports = function(startX, startY, type, gun, path, dtStart, cash, difficultymod) {
  var self = this;

  this.id = ++enemyId;

  this.type = type;
  this.health = 0;
  this.pos = { x: startX, y: startY };
  this.gun = gun;
  this.path = path;
  this.cash = cash;
  this.speedmod = (Math.random()*(0.2)) + 0.9;
  this.dtStart = dtStart;
  this.killvotes = [];
  this.healthvotes = {};
  this.difficultymod = difficultymod;

  this.serialize = function() {
    return {
      id: self.id,
      type: self.type,
      health: self.health,
      pos: self.pos,
      gun: self.gun/*.serialize()*/,
      path: self.path,
      cash: self.cash,
      speedmod: self.speedmod,
      dtStart: self.dtStart,
      difficultymod: self.difficultymod
    };
  };

  this.updateHealth = function() {
    var values = [];
    for (var i in self.healthvotes) {
      values.push(self.healthvotes[i]);
    }
    if (values.length > 1) {
      values.sort(function(a, b) { return a - b; });
      self.health = Math.round((values[Math.floor(values.length / 2)] + values[Math.ceil(values.length / 2)]) / 2);
    } else {
      self.health = Math.round(values[0]);
    }
  };
};

