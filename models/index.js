var config = require('../config');

var mongoose = require('mongoose'),
    mongo    = mongoose.createConnection(config.mongodb.url || 'mongodb://localhost:27017/' + config.mongodb.db),
    Schema   = mongoose.Schema;

var User = new Schema({
  username : { type: String, index: { unique: true } },
  password : String,
  email    : { type: String, index: { unique: true } },
  cash     : { type: Number, 'default': 0 },
  health   : { type: Number, 'default': 100 },
  gun      : { type: String, 'default': 'PlayerFastPewPew' },
  guns     : { type: [String], 'default': ['PlayerFastPewPew'] },
  color    : { type: String, 'default': '#00FF00' },
  branch   : { type: String, 'default': 'master' },
  lockout  : [String],
  score    : { type: Number, 'default': 0 }
});
require('./user')(User);

exports.user = mongo.model('user', User);

