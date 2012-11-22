var Worldline = require('./worldline');
var Player = require('./player.js')

module.exports = function(sockets, db, config) {
  var self = this;

  this.sockets = sockets;
  this.db = db;
  this.config = config;
  this.worldlines = {};

  this.worldlines['A'] = new Worldline(self.sockets, 'A');

  this.sockets.on('connection', function(socket) {
    var client = new Player(socket);
    self.worldlines['A'].addPlayer(client);
    client.init();
  });
};

