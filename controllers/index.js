module.exports = function(app, db, prefix, passport) {
  require('./auth')(app, db, prefix, passport);

  app.get(prefix + '/', function(req, res) {
    if (!req.session.user) {
      res.redirect(prefix + '/login')
    } else {
      res.render('layout', { partials: { content: 'index' } });
    }
  });
};

