module.exports = function(id, startX, startY) {
  var self = this;

  this.id = id;

  this.health = 0;
  this.pos = { x: startX, y: startY };
  this.gun = null;
  this.path = null;
  this.money = 0;
  this.t = 0;

  this.serialize = function() {
    return {
      id: self.id,
      health: self.health,
      pos: self.pos,
      gun: (self.gun) ? self.gun.serialize() : null,
      path: self.path,
      money: self.money,
      t: self.t
    };
  };

  this.init = function() {
    self.socket.emit('setup', { enemy: self.serialize() });
  };
};

