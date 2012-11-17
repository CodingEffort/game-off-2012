module.exports = function(app, db, prefix, passport) {
  require('./auth')(app, db, prefix, passport);
};

