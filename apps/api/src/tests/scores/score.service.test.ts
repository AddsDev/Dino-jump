import { createScoreService } from '../../modules/scores/score.service';
import type { IScoreRepository } from '../../modules/scores/score.repository';
import type { ScoreRankDto } from '../../modules/scores/score.dto';
import { ValidationError } from '../../shared/errors/AppError';

const buildMockRepository = (initial: ScoreRankDto[] = []): IScoreRepository => {
  const store = new Map<string, ScoreRankDto>();
  initial.forEach((s) => store.set(s.nick, { ...s }));

  return {
    async findByNick(nick) {
      return store.get(nick) ?? null;
    },
    async create(nick, score) {
      const now = new Date();
      const record: ScoreRankDto = {
        id: `${store.size + 1}`,
        nick,
        score,
        createdAt: now,
        updatedAt: now,
      };
      store.set(nick, record);
      return record;
    },
    async update(nick, score) {
      const current = store.get(nick);
      if (!current) {
        throw new Error('Record not found in mock');
      }
      const updated: ScoreRankDto = { ...current, score, updatedAt: new Date() };
      store.set(nick, updated);
      return updated;
    },
    async findTop(limit) {
      return [...store.values()]
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    },
  };
};

describe('scoreService', () => {
  describe('registerOrUpdate', () => {
    it('registers a new score when nick does not exist', async () => {
      const repository = buildMockRepository();
      const service = createScoreService(repository);

      const outcome = await service.registerOrUpdate({ nick: 'player01', score: 1200 });

      expect(outcome.status).toBe('registered');
      expect(outcome.record).toEqual({ nick: 'player01', score: 1200 });
    });

    it('updates the score when the new score is greater than the existing one', async () => {
      const repository = buildMockRepository([
        {
          id: '1',
          nick: 'player01',
          score: 1200,
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z'),
        },
      ]);
      const service = createScoreService(repository);

      const outcome = await service.registerOrUpdate({ nick: 'player01', score: 1500 });

      expect(outcome.status).toBe('updated');
      expect(outcome.record).toEqual({ nick: 'player01', score: 1500 });
    });

    it('keeps the previous score when the new score is lower', async () => {
      const repository = buildMockRepository([
        {
          id: '1',
          nick: 'player01',
          score: 1500,
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z'),
        },
      ]);
      const service = createScoreService(repository);

      const outcome = await service.registerOrUpdate({ nick: 'player01', score: 800 });

      expect(outcome.status).toBe('kept');
      expect(outcome.record).toEqual({ nick: 'player01', score: 1500 });
    });

    it('keeps the previous score when the new score is equal', async () => {
      const repository = buildMockRepository([
        {
          id: '1',
          nick: 'player01',
          score: 1500,
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z'),
        },
      ]);
      const service = createScoreService(repository);

      const outcome = await service.registerOrUpdate({ nick: 'player01', score: 1500 });

      expect(outcome.status).toBe('kept');
      expect(outcome.record).toEqual({ nick: 'player01', score: 1500 });
    });
  });

  describe('input validation (delegated to schema)', () => {
    it('does not reject a short nick (validation is performed at the route layer)', async () => {
      const repository = buildMockRepository();
      const service = createScoreService(repository);

      const outcome = await service.registerOrUpdate({
        nick: 'ab',
        score: 100,
      });
      expect(outcome.status).toBe('registered');
    });

    it('does not reject a negative score (validation is performed at the route layer)', async () => {
      const repository = buildMockRepository();
      const service = createScoreService(repository);

      const outcome = await service.registerOrUpdate({
        nick: 'player01',
        score: -1,
      });
      expect(outcome.status).toBe('registered');
    });
  });

  describe('getTop', () => {
    it('returns top scores ordered from highest to lowest', async () => {
      const repository = buildMockRepository([
        {
          id: '1',
          nick: 'low',
          score: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          nick: 'high',
          score: 9999,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          nick: 'mid',
          score: 500,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const service = createScoreService(repository);

      const top = await service.getTop(10);

      expect(top).toEqual([
        { nick: 'high', score: 9999 },
        { nick: 'mid', score: 500 },
        { nick: 'low', score: 100 },
      ]);
    });

    it('limits the number of returned records', async () => {
      const repository = buildMockRepository(
        Array.from({ length: 20 }, (_, i) => ({
          id: String(i + 1),
          nick: `player${i + 1}`,
          score: (i + 1) * 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      );
      const service = createScoreService(repository);

      const top = await service.getTop(5);

      expect(top).toHaveLength(5);
      expect(top[0]).toEqual({ nick: 'player20', score: 200 });
    });

    it('rejects an invalid limit', async () => {
      const repository = buildMockRepository();
      const service = createScoreService(repository);

      await expect(service.getTop(0)).rejects.toBeInstanceOf(ValidationError);
      await expect(service.getTop(101)).rejects.toBeInstanceOf(ValidationError);
    });
  });

  describe('getByNick', () => {
    it('returns the matching score record', async () => {
      const repository = buildMockRepository([
        {
          id: '1',
          nick: 'player01',
          score: 1500,
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z'),
        },
      ]);
      const service = createScoreService(repository);

      const record = await service.getByNick('player01');

      expect(record).toMatchObject({ nick: 'player01', score: 1500 });
    });

    it('throws NotFoundError when the nick does not exist', async () => {
      const repository = buildMockRepository();
      const service = createScoreService(repository);

      await expect(service.getByNick('ghost')).rejects.toMatchObject({
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    });
  });
});
