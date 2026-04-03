require('./config/env');

const { createApp } = require('./app');
const { connectToDatabase } = require('./config/db');
const { env } = require('./config/env');

async function start() {
  await connectToDatabase();

  const app = createApp();

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on port ${env.port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});
