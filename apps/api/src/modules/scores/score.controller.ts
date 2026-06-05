import type { Request, Response, NextFunction } from 'express';
import type { IScoreService } from './score.service';

export interface ScoreController {
  health(req: Request, res: Response, next: NextFunction): Promise<void>;
  createOrUpdate(req: Request, res: Response, next: NextFunction): Promise<void>;
  getTop(req: Request, res: Response, next: NextFunction): Promise<void>;
  getByNick(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export const createScoreController = (service: IScoreService): ScoreController => ({
  async health(_req, res) {
    res.status(200).json({ status: 'ok', service: 'dino-runner-api' });
  },

  async createOrUpdate(req, res) {
    const { nick, score } = req.body as { nick: string; score: number };
    const outcome = await service.registerOrUpdate({ nick, score });

    if (outcome.status === 'registered') {
      res.status(201).json({ message: 'Score registered', data: outcome.record });
      return;
    }
    if (outcome.status === 'updated') {
      res.status(200).json({ message: 'Score updated', data: outcome.record });
      return;
    }
    res.status(200).json({
      message: 'Existing score is greater or equal. No update applied.',
      data: outcome.record,
    });
  },

  async getTop(req, res) {
    const rawLimit = req.query.limit;
    const limit = rawLimit === undefined ? undefined : Number(rawLimit);
    const top = await service.getTop(limit);
    res.status(200).json({ data: top });
  },

  async getByNick(req, res) {
    const record = await service.getByNick(req.params.nick);
    res.status(200).json({ data: record });
  },
});
