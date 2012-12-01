var crypto = require('crypto');

module.exports = function(User, config) {
  User.path('password').set(function(password) {
    return this.model('user').hashPassword(password);
  });

  User.statics.hashPassword = function(password) {
    var shasum = crypto.createHash('sha512');
    shasum.update(config.salt + password + config.salt);
    return shasum.digest('hex');
  };

  User.statics.getById = function(id, callback) {
    this.findOne({ _id: id }).exec(function(err, doc) {
      if (!err && doc) {
        if (callback) callback(doc);
      } else if (callback) callback(null);
    });
  };

  User.statics.getByUsername = function(username, callback) {
    this.findOne({ username: username }).exec(function(err, doc) {
      if (!err && doc) {
        if (callback) callback(doc);
      } else if (callback) callback(null);
    });
  };

  User.statics.getByEmail = function(email, callback) {
    this.findOne({ email: email }).exec(function(err, doc) {
      if (!err && doc) {
        if (callback) callback(doc);
      } else if (callback) callback(null);
    });
  };

  User.statics.getByBranch = function(branch, callback) {
    this.find({ branch: branch }).exec(function(err, docs) {
      if (!err && docs && docs.length) {
        if (callback) callback(docs);
      } else if (callback) callback([]);
    });
  };
};

