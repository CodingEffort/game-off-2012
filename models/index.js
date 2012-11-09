var config = require('../config');

var mongoose = require('mongoose'),
    mongo    = mongoose.createConnection(config.mongo.host || '127.0.0.1', config.mongo.port || 27017),
    Schema   = mongoose.Schema;

