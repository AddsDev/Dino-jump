# Dino Jump

**Dino Jump** es una reinvención premium con temática espacial y astronauta del clásico e icónico juego de carrera infinita sin conexión del navegador Google Chrome. El jugador asume el control de un simpático dinosaurio astronauta que explora la superficie lunar, esquivando obstáculos y acumulando puntos en un entorno dinámico y geométrico.

Este proyecto ha sido diseñado bajo una cuidada dirección artística de estilo **poly-futurista**, con colores sobrios, líneas limpias y una estética de exploración espacial atemporal, alejándose de los destellos y luces de neón del estilo cyberpunk tradicional.

Sirve también como caso práctico de un flujo profesional de **CI/CD** con frontend, backend API REST, base de datos PostgreSQL, Docker, GitHub Actions y manejo de ambientes `dev` / `qa` / `prod`.

---

## 🏛️ Arquitectura

```txt
            ┌──────────────────────┐
            │   Usuario (browser)  │
            └──────────┬───────────┘
                       │ HTTP
                       ▼
            ┌──────────────────────┐
            │  Frontend (Vite SPA) │
            │  apps/web  :5173     │
            └──────────┬───────────┘
                       │ REST (/api/scores)
                       ▼
            ┌──────────────────────┐
            │  Backend (Express)   │
            │  apps/api   :3001    │
            └──────────┬───────────┘
                       │ Prisma
                       ▼
            ┌──────────────────────┐
            │  PostgreSQL 16       │
            │  db         :5432    │
            └──────────────────────┘
```

| Capa | Stack |
|---|---|
| Frontend | React 18, Vite 5, TypeScript 5, Vitest, React Testing Library, Nginx |
| API | Node.js 20, Express 4, TypeScript 5, Prisma 5, PostgreSQL 16, Zod, Jest, Supertest, Testcontainers |
| Infraestructura | Docker, Docker Compose, GitHub Actions, GHCR |

---

## 🚀 ¿En qué consiste el juego?

El objetivo principal es sobrevivir el mayor tiempo posible mientras el dinosaurio astronauta corre de manera automática sobre la superficie lunar:

1. **Pantalla de Bienvenida**: Un panel interactivo con un diseño geométrico sofisticado, que muestra un casco de astronauta minimalista en formato SVG, las instrucciones del juego y un sistema de validación de apodos (nicknames) de entre 3 y 30 caracteres.
2. **Tablero de Clasificación (Leaderboard)**: Muestra los mejores puntajes históricos guardados de manera persistente (local y/o API).
3. **Mecánica de Juego**:
   - **Salto Lunar**: Esquivar rocas y cráteres espaciales en el momento preciso.
   - **Física del Juego**: Incremento progresivo de velocidad y dificultad a medida que aumenta la puntuación para ofrecer un reto competitivo.
   - **Puntuación en tiempo real**: Visualización digital en colores desaturados que registra la puntuación actual.
4. **Pantalla de Fin de Juego (Game Over)**: Si ocurre una colisión, el juego se pausa y presenta una tarjeta interactiva espacial en español para ingresar tu nombre y registrar la nueva marca si supera el puntaje anterior.

### 🎮 Controles
* **Espacio (Space)** o **Flecha Arriba (ArrowUp)**: Realizar un salto lunar.
* **Enter**: Iniciar o reiniciar la partida rápidamente.

---

## 🛠️ Tecnologías Utilizadas

### Frontend (`apps/web`)
* **React 18**, **TypeScript 5**, **Vite 5**.
* **HTML5 Canvas API** para el render 2D en tiempo real.
* **Vanilla CSS** con variables, glassmorphism y tipografías de Google Fonts (`Outfit`, `Share Tech Mono`).
* **LocalStorage API** para persistencia local de récords.
* **Vitest & React Testing Library** para pruebas unitarias.

### Backend (`apps/api`)
* **Node.js 20** + **Express 4** con **TypeScript 5**.
* **Prisma 5** como ORM hacia **PostgreSQL 16**.
* **Zod** para validación de DTOs y variables de entorno.
* **Jest + Supertest** para tests de servicio y rutas.
* **Testcontainers** para tests de integración con PostgreSQL efímero.

### Infraestructura
* **Docker** + **Docker Compose** para los 3 servicios (`web`, `api`, `db`).
* **GitHub Actions** para CI (lint, build, test, artefactos) y publicación de imágenes en **GHCR**.

---

## 📁 Estructura del monorepo

```txt
dino-jumper-ci-cd/
├── apps/
│   ├── web/                        # React + Vite
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── src/
│   └── api/                        # Express + Prisma
│       ├── Dockerfile
│       ├── prisma/schema.prisma
│       └── src/
│           ├── config/
│           ├── modules/scores/
│           ├── shared/
│           └── tests/
├── .github/workflows/
│   ├── ci.yml                      # lint + build + test (web + api)
│   └── docker-build.yml            # publica dino-web y dino-api a GHCR
├── docker-compose.dev.yml
├── .env.example
└── package.json                    # workspaces: apps/web, apps/api
```

---

## 🌿 Ambientes y ramas

| Ambiente | Rama | Base de datos | Imagen Docker |
|---|---|---|---|
| `dev` | `develop` | `dino_dev` | `dino-web:dev-{sha}`, `dino-api:dev-{sha}` |
| `qa` | `release/*` | `dino_qa` | `dino-web:qa-{sha}`, `dino-api:qa-{sha}` |
| `prod` | `main` | `dino_prod` | `dino-web:prod-vX.Y.Z`, `dino-api:prod-vX.Y.Z` |

Convención de commits: **Conventional Commits** (`feat:`, `fix:`, `test:`, `ci:`, `docs:`).

---

## 🧪 Iteraciones

| # | Rama | Estado | Descripción |
|---|---|---|---|
| 1 | `feature/welcome-and-local-score` | ✅ | Bienvenida, juego, score en `localStorage` |
| 2 | `feature/api-scores` | ✅ | API REST de scores con PostgreSQL y Prisma |
| 3 | `feature/frontend-api-integration` | ⏳ | Frontend consume API + ranking |
| 4 | `feature/intentional-score-bug` | ⏳ | Bug controlado + flujo de rollback |
| 5 | `feature/duck-and-plane-obstacle` | ⏳ | Agacharse y obstáculo aéreo |

---

## ⚙️ Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

```env
NODE_ENV=development
APP_ENV=dev

WEB_PORT=5173
API_PORT=3001

VITE_API_BASE_URL=http://localhost:3001

POSTGRES_USER=dino
POSTGRES_PASSWORD=dino
POSTGRES_DB=dino_dev
DATABASE_URL=postgresql://dino:dino@localhost:5432/dino_dev

CORS_ORIGIN=http://localhost:5173
```

> Nunca subas el archivo `.env` real al repositorio.

---

## 🔌 API REST

URL base local: `http://localhost:3001`.

### `GET /health`
Comprueba el estado del servicio.
```bash
curl http://localhost:3001/health
# { "status": "ok", "service": "dino-runner-api" }
```

### `POST /api/scores`
Registra un score nuevo, actualiza si el nuevo es mayor, o conserva el previo.
```bash
curl -X POST http://localhost:3001/api/scores \
  -H "Content-Type: application/json" \
  -d '{ "nick": "player01", "score": 1200 }'
```

**Reglas de validación:**
- `nick`: string, 3-30 caracteres (trim).
- `score`: entero `>= 0`.

**Respuestas:**
- `201` con `message: "Score registered"` cuando el nick es nuevo.
- `200` con `message: "Score updated"` cuando el nuevo score es mayor.
- `200` con `message: "Existing score is greater or equal. No update applied."` cuando se conserva.
- `400` con `code: "VALIDATION_ERROR"` si el payload no cumple las reglas.

### `GET /api/scores/top?limit=10`
Devuelve el ranking ordenado de mayor a menor.
```bash
curl http://localhost:3001/api/scores/top?limit=5
# { "data": [ { "nick": "player01", "score": 1500 }, ... ] }
```

### `GET /api/scores/:nick`
Devuelve el score individual o `404` si el nick no existe.
```bash
curl http://localhost:3001/api/scores/player01
```

---

## 💻 Ejecución local (sin Docker)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Levantar PostgreSQL
Puedes usar Docker para la base de datos rápidamente:
```bash
docker run -d --name dino-postgres \
  -e POSTGRES_USER=dino -e POSTGRES_PASSWORD=dino -e POSTGRES_DB=dino_dev \
  -p 5432:5432 postgres:16-alpine
```

### 3. Configurar Prisma y migrar
```bash
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
```

### 4. Iniciar backend y frontend (en terminales separadas)
```bash
npm run dev:api      # http://localhost:3001
npm run dev          # http://localhost:5173
```

---

## 🐳 Ejecución con Docker Compose

Levanta los servicios (`web`, `api`, `db`, `migrate`) en un solo comando:

```bash
docker compose -f docker-compose.dev.yml up --build
```

| Servicio | Tipo | URL local |
|---|---|---|
| `db` | PostgreSQL 16 (persistente) | `localhost:5432` |
| `migrate` | One-shot: `prisma migrate deploy` | — |
| `api` | API REST Node/Express | http://localhost:3001 |
| `web` | Frontend Vite + Nginx | http://localhost:5173 |

> El servicio `migrate` corre una sola vez, aplica las migraciones pendientes y termina (`Exit 0`). El servicio `api` lo espera con `condition: service_completed_successfully` para arrancar.

Comandos útiles:
```bash
docker compose -f docker-compose.dev.yml ps                 # estado de los servicios
docker compose -f docker-compose.dev.yml logs -f            # logs en vivo
docker compose -f docker-compose.dev.yml logs migrate       # ver qué migración aplicó
docker compose -f docker-compose.dev.yml down               # detener
docker compose -f docker-compose.dev.yml down -v            # detener y borrar volúmenes (BD limpia)
```

### 🛠️ Construcción directa con Docker (sin Compose)

```bash
# Web
docker build -t dino-web:local -f apps/web/Dockerfile .
docker run -d -p 5173:80 --name dino-web-container dino-web:local

# API
docker build -t dino-api:local --target runner -f apps/api/Dockerfile .
docker run -d -p 3001:3001 --name dino-api-container \
  -e DATABASE_URL=postgresql://dino:dino@host.docker.internal:5432/dino_dev \
  dino-api:local

# Migraciones (one-shot)
docker build -t dino-migrate:local --target migrate -f apps/api/Dockerfile .
docker run --rm \
  -e DATABASE_URL=postgresql://dino:dino@host.docker.internal:5432/dino_dev \
  dino-migrate:local
```

---

## 🗄️ Migraciones de base de datos

Las migraciones de Prisma viven versionadas en `apps/api/prisma/migrations/` y forman parte del código fuente.

### Estructura

```txt
apps/api/prisma/
├── schema.prisma
├── migration_lock.toml
└── migrations/
    └── 20260604000000_init/
        └── migration.sql
```

### ¿Cómo se ejecutan?

| Ambiente | Mecanismo | Comando / servicio |
|---|---|---|
| `dev` (local con Compose) | Servicio `migrate` one-shot | `docker compose up migrate` |
| `dev` (local sin Docker) | Script npm | `npm run prisma:deploy` |
| CI (pull request / push) | Paso explícito en `ci.yml` | `npm run prisma:deploy` + `prisma migrate status` |
| `qa` / `prod` (futuro) | Job de GitHub Actions | Workflow dedicado `deploy-qa.yml` / `deploy-prod.yml` |

> Las migraciones **no** se ejecutan dentro del contenedor del API. Eso evita race conditions al escalar horizontalmente y separa "aplicar schema" de "desplegar app".

### ¿Cómo agregar una nueva migración?

Cuando cambies `schema.prisma` (nuevos modelos, columnas, índices, etc.):

```bash
cd apps/api
# Crea el archivo SQL en prisma/migrations/<timestamp>_<nombre>/migration.sql
# y lo aplica a la BD local
npm run prisma:migrate -- --name <nombre_descriptivo>
```

Convenciones:
- Nunca edites una migración que ya esté aplicada en `main`.
- Una migración = un cambio lógico (ej: `add_email_to_scores`, `create_players_table`).
- Commitea el SQL **junto** con el cambio de `schema.prisma` en el mismo PR.
- El CI ejecuta `prisma migrate status` para detectar drift (schema ≠ migraciones aplicadas).

### ¿Cómo aplicarlas manualmente (emergencias)?

```bash
# Aplica todas las migraciones pendientes
npm run prisma:deploy --workspace apps/api

# Ver el estado (qué migraciones están aplicadas / pendientes)
npx prisma migrate status --schema=apps/api/prisma/schema.prisma
```

---

## 🧪 Pruebas

### Frontend
```bash
npm run test --workspace apps/web
```

### Backend
Los tests de integración arrancan un contenedor PostgreSQL efímero con Testcontainers (requiere Docker disponible).
```bash
npm run test --workspace apps/api
```

Para usar una base de datos existente (por ejemplo, en CI con un servicio postgres), exporta:
```bash
USE_EXTERNAL_DB=1 \
DATABASE_URL=postgresql://dino:dino@localhost:5432/dino_test \
npm run test --workspace apps/api
```

### Lint
```bash
npm run lint
```

---

## 🔄 CI/CD

### `ci.yml`
- **Web**: `npm run build` + `npm run test` + artefacto `web-dist-dev`.
- **API**: arranca un servicio `postgres:16` en el runner, aplica migraciones, ejecuta `npm run build` + `npm run test` + artefacto `api-build-dev`.

### `docker-build.yml`
- Construye y publica a **GHCR**:
  - `ghcr.io/<repo>/dino-web:dev-{sha}` (más `dev-latest` en `develop` y `latest` en `main`).
  - `ghcr.io/<repo>/dino-api:dev-{sha}` (más `dev-latest` en `develop` y `latest` en `main`).

---

## 🔁 Rollback

El proyecto está preparado para flujos de rollback (definido en iteración 4) usando tags inmutables de imágenes Docker por SHA. La idea general:

1. Identificar la imagen estable anterior (`dino-api:dev-{sha}` o `dino-web:dev-{sha}`).
2. Redesplegar el servicio con la imagen previa.
3. Aplicar el hotfix correspondiente y volver a desplegar.

---

## 📜 Licencia

ISC
