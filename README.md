## VisionBoard – Task Management System

VisionBoard is a simplified task management system that helps you organize projects and tasks in one place.
Users can sign up/sign in, create projects with deadlines, add tasks per project, assign tasks to team members, and track progress via a dashboard.

The frontend is a React + Vite single-page app, and the backend is a NestJS API backed by a MySQL database via Prisma.

## Features

- **User accounts**
	- Email + password sign up/sign in.
	- Account info stored in the database; frontend keeps the current user in localStorage.
- **Projects**
	- Create projects with a name, description, and due date.
	- Each project tracks total tasks and how many are completed.
	- Projects can’t be deleted while they have incomplete tasks (enforced on the backend).
- **Tasks**
	- Create tasks under a project with title, description, status, priority, assignee, and deadline.
	- Status is normalized between UI and database (e.g. "in-progress" vs "in_progress") and overdue tasks are detected based on due date.
	- Deadlines are validated against the project deadline in the UI.
- **Dashboard**
	- High-level stats: total projects, total tasks, completed projects, completed tasks, overdue tasks.
	- Recent projects and upcoming task deadlines.
- **Team management (client-side)**
	- Lightweight team member list stored in localStorage.
	- Tasks can be assigned to team members; project "teams" and task assignees are persisted in the browser.

## Tech Stack

- Frontend: React 19 + Vite, Tailwind-style utility classes.
- Backend: NestJS, Prisma, MySQL.
- Auth: Email + password (bcrypt-hashed), no JWT yet.
- Tooling: ESLint, Jest (backend), Prisma migrations.

## Getting Started

### Prerequisites

- Node.js (LTS)
- A running MySQL instance
- Configure the backend `.env` in `vision-backend` with your DB URL, for example:

```env
DATABASE_URL="mysql://user:password@localhost:3306/visionboard"
PORT=3000
```

### 1. Install Dependencies

From the project root (where `package.json` lives):

```bash
npm install
```

Then install backend dependencies:

```bash
cd vision-backend
npm install
cd ..
```

### 2. Set Up the Database

From `vision-backend` run Prisma migrations against your MySQL database:

```bash
cd vision-backend
npx prisma migrate deploy
cd ..
```

> For local development you can use `npx prisma migrate dev` instead.

### 3. Run in Development

- Frontend only (Vite, no API):

```bash
npm run dev
```

- Backend only (NestJS API):

```bash
cd vision-backend
npm run start:dev
```

- Full stack (frontend + backend, recommended):

```bash
npm run dev:full
```

By default, the frontend talks to the backend at `http://localhost:3000`.
Make sure `PORT` in `vision-backend/.env` matches this value, or set `VITE_API_URL` in a `.env` at the root if you change it.

### 4. Production-style Run

Build the frontend bundle:

```bash
npm run build
```

Build the backend:

```bash
cd vision-backend
npm run build
```

Start the backend in production mode (it will serve the built frontend from `dist/`):

```bash
npm run start:prod
```
