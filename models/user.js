module.exports = function(User) {
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
};

