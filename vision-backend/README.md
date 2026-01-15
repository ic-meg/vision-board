## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
Vision Board — Backend
=======================

This repository contains the backend for the Vision Board application. It is a NestJS (TypeScript) application that implements REST APIs for users, projects and tasks. The project uses Prisma as the ORM and expects a PostgreSQL database in development.

This README documents quick setup, configuration, running, testing, and basic API usage.

Contents
--------
- Requirements
- Environment variables
- Setup
- Database (Prisma)
- Running the application
- Testing
- Linting & building
- Project structure
- API examples
- Troubleshooting & notes

Requirements
------------
- Node.js 18+ (or the Node.js version configured in the project)
- npm (or pnpm/yarn if you prefer, but examples use npm)
- PostgreSQL for local development (or any database supported by Prisma and configured in the schema)

Environment variables
---------------------
Create a .env file at the project root (next to package.json) with the values below. Adjust values to match your local/Postgres setup.

Required variables (example):

DATABASE_URL="postgresql://postgres:password@localhost:5432/vision_db?schema=public"
JWT_SECRET="a-strong-secret"
JWT_EXPIRES_IN="3600s"

If you add more services (email, cloud storage, etc.), add appropriate variables and update configuration files.

Setup
-----
1. Install dependencies

   npm install

2. Generate Prisma client (after setting DATABASE_URL)

   npx prisma generate

3. Apply migrations to the database (development)

   npx prisma migrate deploy

   If you prefer to create and run a new migration in development, use:

   npx prisma migrate dev --name init

Database (Prisma)
------------------
- The Prisma schema is located at ./prisma/schema.prisma.
- Migrations are stored in ./prisma/migrations.
- The project includes migration files; when you run `prisma migrate deploy` Prisma will apply them to the target database.

Running the application
-----------------------
- Development (watch mode):

  npm run start:dev

- Production:

  npm run build
  npm run start:prod

- Quick run (single command):

  npm run start

By default Nest listens on the port configured in the application (check `src/main.ts` for the exact port or environment variable usage).

Testing
-------
- Unit tests:

  npm run test

- End-to-end tests:

  npm run test:e2e

- Test coverage report:

  npm run test:cov

Linting & building
------------------
- Lint:

  npm run lint

- Build (TypeScript -> JavaScript):

  npm run build

Project structure
-----------------
Key folders and files:
- src/ - Nest application source
  - auth/ - authentication controller/service and DTOs
  - project/ - project module, controllers, services, DTOs
  - task/ - task module, controllers, services, DTOs
  - prisma/ - Prisma provider and exception filter
  - dashboard/ - dashboard endpoints and logic
  - main.ts - application bootstrap
- prisma/ - Prisma schema and migrations
- package.json - scripts and dependencies

API examples
------------
Below are example requests. Adjust base URL and port depending on your setup (for local development assume http://localhost:3000).

Authentication (sign up / sign in)
- POST /auth/sign-up
  - body: { "email": "alice@example.com", "password": "securepass", "name": "Alice" }
  - response: created user (without password) or an access token depending on implementation

- POST /auth/sign-in
  - body: { "email": "alice@example.com", "password": "securepass" }
  - response: { "accessToken": "..." }

Protected endpoints require Authorization: Bearer <token> header.

Projects
- GET /projects - list projects the authenticated user has access to
- POST /projects - create a project
  - body: { "title": "My Project", "description": "..." }
- GET /projects/:id - get a specific project
- PUT /projects/:id - update project
- DELETE /projects/:id - delete project

Tasks
- GET /projects/:projectId/tasks - list tasks for a project
- POST /projects/:projectId/tasks - create task
  - body: { "title": "Task 1", "description": "...", "dueDate": "2026-01-15T00:00:00.000Z" }
- PATCH /tasks/:id - update task status or fields

Troubleshooting & notes
-----------------------
- If Prisma cannot connect, verify DATABASE_URL and that Postgres is running and accepting connections.
- If migrations fail, inspect ./prisma/migrations and the generated SQL files to resolve conflicts.
- For CORS or environment-specific config, check the Nest application bootstrap and modules for allowed origins and settings.

Contributing
------------
- Follow existing code style and patterns in the repository.
- Create feature branches and open pull requests against master.
- Run tests and lint before opening a PR.

License
-------
This project does not include an explicit license in this repository. If you want to add one, create a LICENSE file.

Contact
-------
For questions about this backend, check the source code in `vision-backend/src` or open an issue in the repository.
