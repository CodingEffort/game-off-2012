module.exports = function(app, db, prefix, passport) {
  app.get(prefix + '/login', function(req, res) {
    res.render('layout', { partials: { content: 'login' } });
  });
  app.get(prefix + '/logout', function(req, res) {
    req.logout();
    res.redirect(prefix + '/login');
  });

  app.post(prefix + '/auth/local', passport.authenticate('local', {
    successRedirect: prefix + '/',
    failureRedirect: prefix + '/login',
    failureFlash: true
  }));
  app.post(prefix + '/auth/rgister', function(req, res) {
    
  });

  app.get(prefix + '/auth/google', passport.authenticate('google'));
  app.get(prefix + '/auth/google/return', passport.authenticate('google', {
    successRedirect: prefix + '/',
    failureRedirect: prefix + '/login'
  }));
};
