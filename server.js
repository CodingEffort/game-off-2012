/**
 * server.js
 * William Turner
 */

var parseCookie = require('connect').utils.parseCookie,
    express = require('express'),
      http = require('http'),
      path = require('path'),
      cons = require('consolidate'),
      passport = require('passport'),
        LocalStrategy = require('passport-local').Strategy,
        GoogleStrategy = require('passport-google').Strategy,
    sio = require('socket.io'),
      passportSio = require('passport.socketio'),
    db = require('./models');

var config = require('./config');

var app = express();
var sessions = new express.session.MemoryStore();

passport.use(new LocalStrategy(function(username, password, done) {
  var user = new db.user();
  // TODO: find user
  done(null, user);
}));
passport.use(new GoogleStrategy({
  returnURL: 'http://localhost:3000' + config.prefix + '/auth/google/return',
  realm: 'http://localhost:3000' + config.prefix + '/'
}, function(identifier, profile, done) {
  console.log(identifier);
  console.log(profile);
  var user = new db.user();
  // TODO: find or create user
  done(null, user);
}));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});
passport.deserializeUser(function(id, done) {
  // TODO: find user
  done(null, new db.user());
});

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
  app.use(express.session({ store: sessions, secret: config.secret, key: 'express.sid' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// http://madhums.me/2012/07/19/breaking-down-app-js-file-nodejs-express-mongoose/
require('./controllers')(app, db, config.prefix, passport);

var server = http.createServer(app).listen(config.port || 3000, config.host || '0.0.0.0', function() {
  console.log("Project Nixie worker listening on " + (config.host || '0.0.0.0') + ":" + (config.port || 3000));
});

var io = sio.listen(server);
io.set('authorization', passportSio.authorize({
  sessionKey: 'express.sid',
  sessionStore: sessions,
  sessionSecret: config.secret,
  fail: function(data, accept) {
    accept(null, false);
  },
  success: function(data, accept) {
    accept(null, true);
  }
}));
require('./game')(io.sockets, db, config.game);

