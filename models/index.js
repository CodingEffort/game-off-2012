var config = require('../config');

var mongoose = require('mongoose'),
    mongo    = mongoose.createConnection(config.mongodb.url || 'mongodb://localhost:27017/' + config.mongodb.db),
    Schema   = mongoose.Schema;

var User = new Schema({
  username : { type: String, index: { unique: true, sparse: true } },
  password : String,
  email    : { type: String, index: { unique: true, sparse: true } },
  cash     : { type: Number, 'default': 0 },
  health   : { type: Number, 'default': 100 },
  gun      : { type: String, 'default': 'PlayerFastPewPew' },
  guns     : { type: [String], 'default': ['PlayerFastPewPew'] },
  color    : String,
  branch   : { type: String, 'default': 'master' },
  lockout  : [String],
  score    : { type: Number, 'default': 0 }
});
require('./user')(User, config);

exports.user = mongo.model('user', User);

