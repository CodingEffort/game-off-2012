module.exports = {
  title    : '',
  subtitle : '',
  prefix   : '',
  secret   : 'IMMA CHARGIN MAH LAZORS',
  host     : process.env.OPENSHIFT_INTERNAL_IP || '0.0.0.0',
  port     : Number(process.env.OPENSHIFT_INTERNAL_PORT) || 3000,
  mongodb: {
    url    : (process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME),
    db     : 'nixie'
  },
  game: {
  
  }
};
