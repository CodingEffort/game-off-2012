var Branch = require('./branch');
var Player = require('./player');

module.exports = function(sockets, db, config) {
  var self = this;

  this.sockets = sockets;
  this.db = db;
  this.config = config;
  this.repo = {};
  this.repo['master'] = new Branch(self.sockets, self, null, 'master', 'Project Nixie');

  this.sockets.on('connection', function(socket) {
    var client = new Player(socket);
    client.init(self.repo['master']);
  });

  this.makeBranch = function(player, parent) {
    
  }
};

