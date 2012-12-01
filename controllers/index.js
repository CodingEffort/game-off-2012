module.exports = function(app, db, prefix, passport) {
  require('./auth')(app, db, prefix, passport);

  app.get(prefix + '/', function(req, res) {
    if (!req.user) {
      res.redirect(prefix + '/auth/login')
    }  else {
      res.render('layout', { partials: { content: 'index' }, bodystyle: 'background: #000000;' });
    }
  });
};

