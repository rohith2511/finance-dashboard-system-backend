const { createApp } = require('../src/app');
const { connectToDatabase } = require('../src/config/db');

let app;
let dbReady;

async function getApp() {
  if (!dbReady) {
    dbReady = connectToDatabase();
  }
  await dbReady;

  if (!app) {
    app = createApp();
  }

  return app;
}

module.exports = async (req, res) => {
  const expressApp = await getApp();
  return expressApp(req, res);
};
