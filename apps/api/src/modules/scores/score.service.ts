import type { IScoreRepository } from './score.repository';
import type { CreateScoreInput } from './score.validation';
import type { ScoreOutcome, ScoreResponseDto, ScoreRankDto } from './score.dto';
import { NotFoundError, ValidationError } from '../../shared/errors/AppError';

export const RANK_DEFAULT_LIMIT = 10;
export const RANK_MAX_LIMIT = 100;

export interface IScoreService {
  registerOrUpdate(input: CreateScoreInput): Promise<ScoreOutcome>;
  getTop(limit?: number): Promise<ScoreResponseDto[]>;
  getByNick(nick: string): Promise<ScoreRankDto>;
}

export const createScoreService = (repository: IScoreRepository): IScoreService => ({
  async registerOrUpdate({ nick, score }) {
    const existing = await repository.findByNick(nick);

    if (!existing) {
      const created = await repository.create(nick, score);
      return { status: 'registered', record: { nick: created.nick, score: created.score } };
    }

    if (score > existing.score) {
      const updated = await repository.update(nick, score);
      return { status: 'updated', record: { nick: updated.nick, score: updated.score } };
    }

    return { status: 'kept', record: { nick: existing.nick, score: existing.score } };
  },

  async getTop(limit = RANK_DEFAULT_LIMIT) {
    if (!Number.isInteger(limit) || limit <= 0 || limit > RANK_MAX_LIMIT) {
      throw new ValidationError(
        `Limit must be an integer between 1 and ${RANK_MAX_LIMIT}`,
        { limit },
      );
    }
    const records = await repository.findTop(limit);
    return records.map(({ nick, score }) => ({ nick, score }));
  },

  async getByNick(nick) {
    const record = await repository.findByNick(nick);
    if (!record) {
      throw new NotFoundError(`Score for nick "${nick}" not found`);
    }
    return record;
  },
});
