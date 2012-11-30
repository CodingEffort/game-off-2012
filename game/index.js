var Branch = require('./branch');
var Player = require('./player');

module.exports = function(sockets, db, config) {
  var self = this;

  this.sockets = sockets;
  this.db = db;
  this.config = config;
  this.repo = {};
  this.major = 0;
  this.minor = 0;
  this.revision = 0;
  this.repo['master'] = new Branch(self.sockets, self, null, 'master', 'Project Nixie');

  this.sockets.on('connection', function(socket) {
    var client = new Player(socket, '#00FF00', 'PlayerForkYou');
    client.init(self.repo['master']);
  });

  this.makeBranch = function(parent) {
    var b = new Branch(self.sockets, self, parent);
    self.repo[b.id] = b;
    return b;
  };

  this.increaseDifficulty = function() {
    for (var b in self.repo) {
      self.repo[b].difficultymod += 0.05;
    }
    self.revision++;
    if (self.revision > 9) { self.revision = 0; self.minor++; }
    if (self.minor > 9) { self.minor = 0; self.major++; }
    self.sockets.emit('msg', {msg: "Brace yourselves,"});
    self.sockets.emit('msg', {msg: "You're now working on the new release version " + self.major + "." + self.minor + "." + self.revision});
  };

  this.garbageCollectBranch = function(branch) {
    // TODO: check dependencies, delete branch if orphan
  };
};

