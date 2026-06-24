import { createApp } from './app';
import { env } from './config/env';
import { disposePrismaClient } from './shared/prisma';

const app = createApp();

const server = app.listen(env.API_PORT, () => {
  console.log(
    `[dino-runner-api] listening on port ${env.API_PORT} (env=${env.APP_ENV}, node=${env.NODE_ENV})`,
  );
});

const shutdown = async (signal: string) => {
  console.log(`[dino-runner-api] received ${signal}, shutting down...`);
  server.close(async () => {
    await disposePrismaClient();
    process.exit(0);
  });
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
