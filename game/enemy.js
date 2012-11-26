var enemyId = 0;
module.exports = function(startX, startY, type, path, dtStart) {
  var self = this;

  this.id = enemyId++;

  this.type = type;
  this.health = 0;
  this.pos = { x: startX, y: startY };
  this.gun = null;
  this.path = path;
  this.money = 0;
  this.dtStart = dtStart;

  this.serialize = function() {
    return {
      id: self.id,
      type: self.type,
      health: self.health,
      pos: self.pos,
      gun: (self.gun) ? self.gun.serialize() : null,
      path: self.path,
      money: self.money,
      dtStart: self.dtStart
    };
  };
};
