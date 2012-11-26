var enemyId = 0;
module.exports = function(startX, startY, dTStart) {
  var self = this;

  this.id = enemyId++;

  this.health = 0;
  this.pos = { x: startX, y: startY };
  this.gun = null;
  this.path = null;
  this.money = 0;
  this.dTStart = dTStart;

  this.serialize = function() {
    return {
      id: self.id,
      health: self.health,
      pos: self.pos,
      gun: (self.gun) ? self.gun.serialize() : null,
      path: self.path,
      money: self.money,
      dTStart: self.dTStart
    };
  };

  this.init = function() {
    self.socket.emit('setup', { enemy: self.serialize() });
  };
};

