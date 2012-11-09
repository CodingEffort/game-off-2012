/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    cons = require('consolidate'),
    db = require('./models');

var config = require('./config');

var RedisStore = (config.redisStore) ? require('connect-redis')(express) : null;

var app = express();

app.configure(function(){
  app.engine('hjs', cons.hogan);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hjs');
  app.locals({ title: config.title || '', subtitle: config.subtitle || '', prefix: config.prefix || '' });
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(config.secret));
  if (config.redisStore)
    app.use(express.session({ secret: config.secret, store: new RedisStore({ host: config.redis.host || 'localhost', port: config.redis.port || 6379 }) }));
  else
    app.use(express.session({ secret: config.secret }));
  app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    next();
  });
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// http://madhums.me/2012/07/19/breaking-down-app-js-file-nodejs-express-mongoose/
require('./controllers')(app, db, config.prefix);

http.createServer(app).listen(config.port || 3000, config.host || '0.0.0.0', function() {
  console.log("Project Nixie worker listening on " + (config.host || '0.0.0.0') + ":" + (config.port || 3000));
});
