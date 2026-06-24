import express, { type Express } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { createScoreRouter } from './modules/scores/score.routes';
import { createScoreController } from './modules/scores/score.controller';
import { createScoreService } from './modules/scores/score.service';
import { createPrismaScoreRepository } from './modules/scores/score.repository';
import { getPrismaClient } from './shared/prisma';
import { errorHandler } from './shared/middlewares/errorHandler';
import { notFoundHandler } from './shared/middlewares/notFound';
import type { IScoreRepository } from './modules/scores/score.repository';
import type { IScoreService } from './modules/scores/score.service';

export interface AppDependencies {
  repository?: IScoreRepository;
  service?: IScoreService;
}

export const createApp = (deps: AppDependencies = {}): Express => {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());

  const prisma = getPrismaClient();
  const repository = deps.repository ?? createPrismaScoreRepository(prisma);
  const service = deps.service ?? createScoreService(repository);
  const controller = createScoreController(service);

  app.get('/health', controller.health);
  app.use('/api/scores', createScoreRouter(service));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
