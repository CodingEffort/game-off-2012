module.exports = function(app, db, prefix, passport) {
  app.get(prefix + '/auth/login', function(req, res) {
    res.render('layout', {
      partials: { content: 'login' },
      oautherror: req.flash('oautherror') || false,
      githuberror: req.flash('githuberror') || false,
//      loginerror: req.flash('loginerror') || false,
//      emailerror: req.flash('emailerror') || false,
//      passworderror: req.flash('passworderror') || false
    });
  });
  app.get(prefix + '/auth/logout', function(req, res) {
    req.logout();
    res.redirect(prefix + '/login');
  });
/*
  app.post(prefix + '/auth/local', passport.authenticate('local', {
    successRedirect: prefix + '/auth/finish',
    failureRedirect: prefix + '/auth/login',
    failureFlash: true
  }));
  app.post(prefix + '/auth/register', function(req, res) {
    console.log(req.body);
    if (req.body.email && req.body.password1 && req.body.password2) {
      if (req.body.password1 === req.body.password2) {
        db.user.getByEmail(req.body.email, function(user) {
          if (!user) {
            user = new db.user();
            user.email = req.body.email;
            user.password = req.body.password1;
            user.save();
            res.redirect(prefix + '/auth/finish');
          } else {
            req.flash('emailerror', { msg: 'E-mail is already in use!' });
            res.redirect(prefix + '/auth/login');
          }
        });
      } else {
        req.flash('passworderror', { msg: "Passwords didn't match!" })
      }
    } else {
      req.flash('emailerror', { msg: 'Required!' });
      req.flash('passworderror', { msg: 'Required!' });
      res.redirect(prefix + '/auth/login');
    }
  });
*/
  app.get(prefix + '/auth/google', passport.authenticate('google'));
  app.get(prefix + '/auth/google/callback', passport.authenticate('google', {
    successRedirect: prefix + '/auth/finish',
    failureRedirect: prefix + '/auth/login',
    failureFlash: true
  }));

  app.get(prefix + '/auth/github', passport.authenticate('github'));
  app.get(prefix + '/auth/github/callback', passport.authenticate('github', {
    successRedirect: prefix + '/auth/finish',
    failureRedirect: prefix + '/auth/login',
    failureFlash: true
  }));

  app.get(prefix + '/auth/finish', function(req, res) {
    if (req.user && (!req.user.username || !req.user.color)) {
      res.render('layout', {
        partials: { content: 'finish' },
        username: req.flash('username') || '',
        color: req.flash('color') || '#00FF00',
        usererror: req.flash('usererror') || false,
        colorerror: req.flash('colorerror') || false,
      });
    } else {
      res.redirect(prefix + '/');
    }
  });
  app.post(prefix + '/auth/finish', function(req, res) {
    req.flash('username', req.body.username);
    req.flash('color', req.body.color);
    if (req.body.username && req.body.color) {
      if (/#[0-9A-F]{6}/i.test(req.body.color)) {
        db.user.getByUsername(req.body.username, function(user) {
          if (!user) {
            req.user.username = req.body.username;
            req.user.color = req.body.color;
            req.user.save();
            res.redirect(prefix + '/');
          } else {
            req.flash('usererror', { msg: 'Username is already in use!' });
            res.redirect(prefix + '/auth/finish');
          }
        });
      } else {
        req.flash('colorerror', { msg: 'Invalid color!' });
      }
    } else {
      req.flash('usererror', { msg: 'Required!' });
      req.flash('colorerror', { msg: 'Required!' });
      res.redirect(prefix + '/auth/finish');
    }
  });
};
