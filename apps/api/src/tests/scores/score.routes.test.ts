import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';

let container: StartedPostgreSqlContainer | undefined;
let prisma: PrismaClient | undefined;
let databaseUrl: string | undefined;
let ownsContainer = false;

const detectDocker = async (): Promise<boolean> => {
  try {
    const probe = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('dino_probe')
      .withUsername('probe')
      .withPassword('probe')
      .start();
    await probe.stop();
    return true;
  } catch {
    return false;
  }
};

const setupDatabase = async () => {
  process.env.NODE_ENV = 'test';
  process.env.APP_ENV = 'dev';
  process.env.API_PORT = '0';
  process.env.CORS_ORIGIN = 'http://localhost:5173';

  if (process.env.DATABASE_URL && process.env.USE_EXTERNAL_DB === '1') {
    databaseUrl = process.env.DATABASE_URL;
    ownsContainer = false;
  } else {
    container = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('dino_test')
      .withUsername('dino')
      .withPassword('dino')
      .start();
    databaseUrl = container.getConnectionUri();
    ownsContainer = true;
  }

  process.env.DATABASE_URL = databaseUrl;

  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'pipe',
  });

  prisma = new PrismaClient({ datasourceUrl: databaseUrl });
  await prisma.$connect();
};

const teardownDatabase = async () => {
  if (prisma) {
    await prisma.score.deleteMany().catch(() => undefined);
    await prisma.$disconnect().catch(() => undefined);
  }
  if (ownsContainer && container) {
    await container.stop().catch(() => undefined);
  }
};

let app: Awaited<ReturnType<typeof import('../../app').createApp>>;
let dockerAvailable = false;

const itIfDocker = dockerAvailable ? it : it.skip;

describe('Score API routes (integration with PostgreSQL)', () => {
  beforeAll(async () => {
    dockerAvailable = await detectDocker();
    if (!dockerAvailable) {
      console.warn(
        '[score.routes.test] Docker daemon unavailable. Skipping integration tests. ' +
          'Start Docker Desktop to enable these tests, or set USE_EXTERNAL_DB=1 with a reachable DATABASE_URL.',
      );
      return;
    }
    await setupDatabase();
    const { createApp } = await import('../../app');
    app = createApp();
  }, 180000);

  afterAll(async () => {
    if (dockerAvailable) {
      await teardownDatabase();
    }
  });

  beforeEach(async () => {
    if (!dockerAvailable || !prisma) return;
    await prisma.score.deleteMany();
  });

  describe('GET /health', () => {
    itIfDocker('returns ok status with the service name', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok', service: 'dino-runner-api' });
    });
  });

  describe('POST /api/scores', () => {
    itIfDocker('registers a new score with 201 and a "registered" message', async () => {
      const res = await request(app)
        .post('/api/scores')
        .send({ nick: 'player01', score: 1200 });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        message: 'Score registered',
        data: { nick: 'player01', score: 1200 },
      });
    });

    itIfDocker('updates the score when the new one is greater and returns 200', async () => {
      await request(app).post('/api/scores').send({ nick: 'player01', score: 1200 });

      const res = await request(app)
        .post('/api/scores')
        .send({ nick: 'player01', score: 1500 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: 'Score updated',
        data: { nick: 'player01', score: 1500 },
      });
    });

    itIfDocker('keeps the previous score when the new one is lower and returns 200', async () => {
      await request(app).post('/api/scores').send({ nick: 'player01', score: 1500 });

      const res = await request(app)
        .post('/api/scores')
        .send({ nick: 'player01', score: 800 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: 'Existing score is greater or equal. No update applied.',
        data: { nick: 'player01', score: 1500 },
      });
    });

    itIfDocker('keeps the previous score when equal and returns 200', async () => {
      await request(app).post('/api/scores').send({ nick: 'player01', score: 1500 });

      const res = await request(app)
        .post('/api/scores')
        .send({ nick: 'player01', score: 1500 });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Existing score is greater or equal. No update applied.');
      expect(res.body.data).toEqual({ nick: 'player01', score: 1500 });
    });

    itIfDocker('rejects empty nick with 400', async () => {
      const res = await request(app).post('/api/scores').send({ nick: '', score: 100 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    itIfDocker('rejects nick shorter than 3 chars with 400', async () => {
      const res = await request(app).post('/api/scores').send({ nick: 'ab', score: 100 });

      expect(res.status).toBe(400);
    });

    itIfDocker('rejects nick longer than 30 chars with 400', async () => {
      const res = await request(app)
        .post('/api/scores')
        .send({ nick: 'a'.repeat(31), score: 100 });

      expect(res.status).toBe(400);
    });

    itIfDocker('rejects negative score with 400', async () => {
      const res = await request(app).post('/api/scores').send({ nick: 'player01', score: -5 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    itIfDocker('rejects non-integer score with 400', async () => {
      const res = await request(app)
        .post('/api/scores')
        .send({ nick: 'player01', score: 1.5 });

      expect(res.status).toBe(400);
    });

    itIfDocker('rejects missing score field with 400', async () => {
      const res = await request(app).post('/api/scores').send({ nick: 'player01' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/scores/top', () => {
    beforeEach(async () => {
      if (!dockerAvailable || !prisma) return;
      await prisma.score.createMany({
        data: [
          { nick: 'low', score: 100 },
          { nick: 'mid', score: 500 },
          { nick: 'high', score: 9999 },
        ],
      });
    });

    itIfDocker('returns scores ordered from highest to lowest', async () => {
      const res = await request(app).get('/api/scores/top');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([
        { nick: 'high', score: 9999 },
        { nick: 'mid', score: 500 },
        { nick: 'low', score: 100 },
      ]);
    });

    itIfDocker('honors the limit query param', async () => {
      const res = await request(app).get('/api/scores/top?limit=2');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0]).toEqual({ nick: 'high', score: 9999 });
    });

    itIfDocker('rejects invalid limit values', async () => {
      const res = await request(app).get('/api/scores/top?limit=0');

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/scores/:nick', () => {
    beforeEach(async () => {
      if (!dockerAvailable || !prisma) return;
      await prisma.score.create({
        data: { nick: 'player01', score: 1500 },
      });
    });

    itIfDocker('returns the matching score record', async () => {
      const res = await request(app).get('/api/scores/player01');

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ nick: 'player01', score: 1500 });
      expect(res.body.data).toHaveProperty('createdAt');
      expect(res.body.data).toHaveProperty('updatedAt');
    });

    itIfDocker('returns 404 when the nick does not exist', async () => {
      const res = await request(app).get('/api/scores/ghost');

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
    });
  });

  describe('Unknown routes', () => {
    itIfDocker('responds with 404 and a descriptive message', async () => {
      const res = await request(app).get('/api/unknown');

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
    });
  });
});
