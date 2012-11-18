module.exports = function(app, db, prefix, passport) {
  app.get(prefix + '/login', function(req, res) {
    res.render('layout', { partials: { content: 'lagin' } });
  });
  app.post(prefix + '/auth/local', passport.authenticate('local', {
    successRedirect: prefix + '/',
    failureRedirect: prefix + '/login',
    failureFlash: true
  }));

  app.get(prefix + '/auth/google', passport.authenticate('google'));
  app.get(prefix + '/auth/google/return', passport.authenticate('google', {
    successRedirect: prefix + '/',
    failureRedirect: prefix + '/login'
  }));
};
