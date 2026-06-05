import type { PrismaClient } from '@prisma/client';
import type { ScoreRankDto } from './score.dto';

export interface IScoreRepository {
  findByNick(nick: string): Promise<ScoreRankDto | null>;
  create(nick: string, score: number): Promise<ScoreRankDto>;
  update(nick: string, score: number): Promise<ScoreRankDto>;
  findTop(limit: number): Promise<ScoreRankDto[]>;
}

export const createPrismaScoreRepository = (prisma: PrismaClient): IScoreRepository => ({
  async findByNick(nick) {
    return prisma.score.findUnique({ where: { nick } });
  },
  async create(nick, score) {
    return prisma.score.create({ data: { nick, score } });
  },
  async update(nick, score) {
    return prisma.score.update({ where: { nick }, data: { score } });
  },
  async findTop(limit) {
    return prisma.score.findMany({
      orderBy: { score: 'desc' },
      take: limit,
    });
  },
});
