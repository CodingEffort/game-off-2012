var config = require('../config');

var mongoose = require('mongoose'),
    mongo    = mongoose.createConnection(config.mongo.host || '127.0.0.1', config.mongo.db, config.mongo.port || 27017),
    Schema   = mongoose.Schema;

var User = new Schema({
  username : { type: String, index: { unique: true } },
  password : String,
  email    : { type: String, index: { unique: true } }
});

module.exports.user = mongo.model('user', User);

