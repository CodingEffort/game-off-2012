module.exports = function() {
  var self = this;

  this.id = null;

  this.serialize = function() {
    return {
      id: self.id
    };
  };
};

