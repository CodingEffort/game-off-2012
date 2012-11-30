var crypto = require('crypto');

var Branch = require('./branch');
var Player = require('./player');

module.exports = function(sockets, db, config) {
  var self = this;

  this.sockets = sockets;
  this.db = db;
  this.config = config;
  this.repo = {};
  this.players = {};
  this.major = 0;
  this.minor = 0;
  this.revision = 0;

  this.repo['master'] = new Branch(self.sockets, self, null, 'master', 'master', 'Project Nixie');

  this.sockets.on('connection', function(socket) {
    var client = null;
    if (self.players[socket.handshake.user.id]) {
      client = self.players[socket.handshake.user.id];
      client.socket = socket;
      client.bindSocket();
    } else {
      client = new Player(socket, self);
      self.players[client.id] = client;
    }
    client.init(self.repo[client.user.branch] || self.repo['master']);
  });

  this.makeBranch = function(parent) {
    var md5 = crypto.createHash('md5');
    var id = null;
    while (id === null || id in self.repo) {
      md5.update(Math.random().toString());
      id = md5.digest('hex');
    }
    var b = new Branch(self.sockets, self, parent, id, null, config.issues[Math.floor(Math.random()*(config.issues.length))]);
    this.repo[b.id] = b;
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

