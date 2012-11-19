module.exports = {
  title    : 'Nixie',
  subtitle : '',
  prefix   : '',
  secret   : 'keyboard cat',
  host     : process.env.OPENSHIFT_APP_DNS || 'localhost:3000',
  listen   : process.env.OPENSHIFT_INTERNAL_IP || '0.0.0.0',
  port     : Number(process.env.OPENSHIFT_INTERNAL_PORT) || 3000,
  mongodb: {
    url    : (process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME),
    db     : 'nixie'
  },
  github: {
    id     : 'GITHUB CLIENTID',
    secret : 'GITHUB SECRET',
  },
  game: {
  
  }
};
