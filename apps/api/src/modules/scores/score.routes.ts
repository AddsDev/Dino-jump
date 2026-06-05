import { Router } from 'express';
import type { IScoreService } from './score.service';
import { createScoreController } from './score.controller';
import { createScoreSchema, nickParamSchema, topQuerySchema } from './score.validation';

export const createScoreRouter = (service: IScoreService) => {
  const router = Router();
  const controller = createScoreController(service);

  router.get('/top', (req, res, next) => {
    const parsed = topQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }
    req.query.limit = String(parsed.data.limit);
    controller.getTop(req, res, next);
  });

  router.get('/:nick', (req, res, next) => {
    const parsed = nickParamSchema.safeParse(req.params);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }
    controller.getByNick(req, res, next);
  });

  router.post('/', (req, res, next) => {
    const parsed = createScoreSchema.safeParse(req.body);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }
    req.body = parsed.data;
    controller.createOrUpdate(req, res, next);
  });

  return router;
};
