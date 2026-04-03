const dotenv = require('dotenv');

dotenv.config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

module.exports = {
  requireEnv,
  env: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT || 3000),
    mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finance_dashboard',
    logFormat: process.env.LOG_FORMAT || 'dev'
  }
};
