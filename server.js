/**
 * server.js
 * William Turner
 */

var parseCookie = require('connect').utils.parseCookie,
    express = require('express'),
      http = require('http'),
      https = require('https'),
      path = require('path'),
      cons = require('consolidate'),
      flash = require('connect-flash'),
      passport = require('passport'),
        LocalStrategy = require('passport-local').Strategy,
        GoogleStrategy = require('passport-google').Strategy,
        GitHubStrategy = require('passport-github').Strategy,
    sio = require('socket.io'),
      passportSio = require('passport.socketio'),
    db = require('./models'),
    Game = require('./game');

var config = require('./config');

var app = express();
var sessions = new express.session.MemoryStore();

/*
passport.use(new LocalStrategy(function(username, password, done) {
  password = db.user.hashPassword(password);
  db.user.getByUsername(username, function(user) {
    if (user) {
      if (password && user.password === password) {
        done(null, user);
      } else {
        done(null, false, { loginerror: true });
      }
    } else {
      db.user.getByEmail(username, function(user) {
        if (user) {
          if (password && user.password === password) {
            done(null, user);
          } else {
            done(null, false, { loginerror: true });
          }
        } else {
          done(null, false, { loginerror: true });
        }
      });
    }
  });
}));
*/

passport.use(new GoogleStrategy({
  returnURL: 'http://' + config.host + config.prefix + '/auth/google/callback',
  realm: 'http://' + config.host + config.prefix + '/'
}, function(identifier, profile, done) {
  db.user.getByEmail(profile.emails[0].value, function(user) {
    if (user) {
      done(null, user);
    } else {
      var user = new db.user();
      user.email = profile.emails[0].value;
      user.save(function(err) {
        done(null, (!err) ? user : false, (!err) ? { oautherror: true } : null);
      });
    }
  });
}));

passport.use(new GitHubStrategy({
  clientID: config.github.id,
  clientSecret: config.github.secret,
  callbackURL: 'http://' + config.host + config.prefix + '/auth/github/callback',
  scope: 'user'
}, function(accessToken, refreshToken, profile, done) {
  // Yeah, ofc, don't provide the e-mail in the `profile`
  // and OFC, require `profile update` perms to access it
  https.get('https://api.github.com/user/emails?access_token=' + accessToken, function(res) {
    if (res.statusCode == 200) {
      var data = '';
      res.on('data', function(chunk) {
        data += chunk;
      });
      res.on('end', function() {
        profile.emails[0].value = JSON.parse(data)[0];
        db.user.getByEmail(profile.emails[0].value, function(user) {
          if (user) {
            done(null, user);
          } else {
            var user = new db.user();
            user.email = profile.emails[0].value;
            user.save(function(err) {
              done(null, (!err) ? user : false, (!err) ? { oautherror: true } : null);
            });
          }
        });
      });
    } else {
      done(null, false, { githuberror: true });
    }
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});
passport.deserializeUser(function(id, done) {
  db.user.getById(id, function(user) {
    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

app.configure(function(){
  app.engine('hjs', cons.hogan);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hjs');
  app.locals({ title: config.title || '', prefix: config.prefix || '', bodytags: '' });
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(config.secret));
  app.use(express.session({ store: sessions, secret: config.secret, key: 'express.sid' }));
  app.use(flash());
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

var server = http.createServer(app).listen(config.port || 3000, config.listen || '0.0.0.0', function() {
  console.log("Project Nixie worker listening on " + (config.listen || '0.0.0.0') + ":" + (config.port || 3000));
});

var io = sio.listen(server);
io.enable('browser client minification');  // send minified client
io.enable('browser client etag');          // apply etag caching logic based on version number
io.enable('browser client gzip');    
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
io.set('transports', ['websocket', 'flashsocket']);
io.set('log level', 1);

var game = new Game(io.sockets, db, config.game);

