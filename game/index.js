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
    self.repo[b.id] = b;
    return b;
  };

  this.increaseDifficulty = function() {
    for (var b in self.repo) {
      self.repo[b].difficultymod *= 1.05;
    }
    self.revision++;
    if (self.revision > 9) { self.revision = 0; self.minor++; }
    if (self.minor > 9) { self.minor = 0; self.major++; }
    self.sockets.emit('msg', {msg: "Brace yourselves,"});
    self.sockets.emit('msg', {msg: "You're now working on the new release version " + self.major + "." + self.minor + "." + self.revision});
  };

  this.broadcastBranches = function() {
    for (var id in self.players) {
      self.players[id].updateBranches();
    }
  };

  this.removeBranch = function(branch) {
    for (var id in self.repo) {
      if (self.repo[id].parent && self.repo[id].parent.id == branch.id) {
        self.repo[id].parent = branch.parent;
      }
      for (var i = self.repo[id].path.length - 1; i >= 0; --i) {
        if (self.repo[id].path[i].id == branch.id) {
          self.repo[id].path.splice(i, 1);
          self.repo[id].broadcast('path', { path: self.repo[id].serializePath() });
          break;
        }
      }
    }
    for (var id in self.players) {
      if (self.players[id].user.branch == branch.id) {
        self.players[id].user.branch = branch.parent.id;
        if (self.players[id].user.lockout.indexOf(branch.parent.id) !== -1) {
          self.players[id].user.lockout.splice(self.players[id].user.lockout.indexOf(branch.parent.id), 1);
        }
        self.players[id].user.save();
      }
    }
    branch.destroy();
    delete self.repo[branch.id];
    delete branch;
    self.broadcastBranches();
  };
};

