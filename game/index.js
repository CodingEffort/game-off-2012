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

  this.repo['master'] = new Branch(self.sockets, self, null, 'master', 'master', 'Project Nixie');

  this.sockets.on('connection', function(socket) {
    var client = null;
    if (self.players[socket.handshake.user.id]) {
      client = self.players[socket.handshake.user.id];
      client.socket = socket;
      client.bindSocket();
    } else {
      client = new Player(socket);
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
    var b = new Branch(self.sockets, self, parent, id);
    this.repo[b.id] = b;
    return b;
  };

  this.garbageCollectBranch = function(branch) {
    // TODO: check dependencies, delete branch if orphan
  };
};

