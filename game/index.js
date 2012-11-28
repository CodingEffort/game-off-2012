var Branch = require('./branch');
var Player = require('./player');

module.exports = function(sockets, db, config) {
  var self = this;

  this.sockets = sockets;
  this.db = db;
  this.config = config;
  this.repo = {
    master: new Branch(self.sockets, 'master')
  };

  this.sockets.on('connection', function(socket) {
    var client = new Player(socket, '#00FF00', 'PlayerMelee');
    client.init(self.repo['master']);
  });
};

