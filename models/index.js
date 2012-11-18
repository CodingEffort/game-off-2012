var config = require('../config');

var mongoose = require('mongoose'),
    mongo    = mongoose.createConnection(config.mongodb.url || 'mongodb://localhost:27017/' + config.mongodb.db),
    Schema   = mongoose.Schema;

var User = new Schema({
  username : { type: String, index: { unique: true } },
  password : String,
  email    : { type: String, index: { unique: true } }
});
require('./user')(User);

exports.user = mongo.model('user', User);

