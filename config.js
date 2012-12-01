module.exports = {
  title    : 'RepoRage',
  prefix   : '',
  secret   : process.env.SECRET || 'IMMA CHARGIN MAH L4Z0R$',
  salt     : process.env.SALT || 'PEW PEW L4Z0R$',
  host     : (process.env.SUBDOMAIN) ? process.env.SUBDOMAIN + '.jit.su' : 'localhost:3000',
  listen   : '0.0.0.0',
  port     : (process.env.NODE_ENV == 'production') ? 80 : 3000,
  mongodb: {
    url    : process.env.MONGODB,
    db     : 'nixie'
  },
  github: {
    id     : process.env.GITHUB_ID || require('./keys').github.id,
    secret : process.env.GITHUB_SECRET || require('./keys').github.secret
  },
  game: {
    issues: [
    "StackOverflow",
    "File corrupted",
    "Index out of range",
    "Make it crossplatform",
    "Fix the internet",
    "Port from Java",
    "Port from VB.net",
    "Port from Lisp",
    "Stack corrupted",
    "Memory leak",
    "Optimize",
    "Javascript",
    "Single letter variables refactoring",
    "Refactor",
    "Debugging",
    "SQL injection",
    "Runtime error",
    "Segfault",
    "Make it IE6 compatible",
    "Race conditions",
    "Compiler warnings",
    "This wasn't supposed to happen"
    ],

    guns: {
      PlayerFastPewPew: 0,
      PlayerParrallelFastPewPew: 250,
      PlayerFastPewPewSplit3: 500,
      PlayerFastPewPewSplit5: 750,
      PlayerMelee: 1000,
      PlayerHomingPewPew: 1337,
      PlayerFireBigPewPew: 3000,
      PlayerForkYou: 9001
    },

    powerups: {
      HealPowerup: 300,
      ShieldPowerup: 250
    }
  }
};
