import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { config } from './config';
import prisma from './config/db';

const app = createApp();

export default app;

if (require.main === module) {
  const server = app.listen(config.port, () => {
    console.log(`GearUp API running on http://localhost:${config.port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received. Shutting down...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err);
  });
}
