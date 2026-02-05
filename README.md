# Realtime Quiz App

A real-time quiz application built with Next.js, Socket.IO, Prisma, and PostgreSQL.

## Features

- **User Authentication**: Email/password registration and login with cookie-based sessions
- **Role-based Access**: ORGANIZER (create quizzes, host sessions) and PARTICIPANT (join and play)
- **Quiz Management**: Create quizzes with text and image questions, multiple choice options
- **Real-time Sessions**: Live quiz sessions with synchronized timers and instant feedback
- **Live Leaderboard**: Score updates in real-time after each question
- **Results & Analytics**: Detailed session statistics and individual performance tracking

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Socket.IO Server
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod
- **Real-time**: Socket.IO

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- pnpm (recommended) or npm

## Quick Start

### 1. Clone and Setup

```bash
# Copy environment file
cp .env.example .env
```

### 2. Start Database

```bash
# Start PostgreSQL container
pnpm db:up
# or
npm run db:up
```

### 3. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 4. Setup Database

```bash
# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed database with test data
pnpm prisma:seed
```

### 5. Start Development Server

```bash
pnpm dev
```

This starts both Next.js (port 3000) and Socket.IO server (port 3001) concurrently.

## Test Accounts

After seeding, you can use these accounts:

| Role        | Email                | Password |
| ----------- | -------------------- | -------- |
| Organizer   | organizer@test.com   | 123456   |
| Participant | participant@test.com | 123456   |

## Available Scripts

| Script                 | Description                                |
| ---------------------- | ------------------------------------------ |
| `pnpm dev`             | Start Next.js and Socket.IO in development |
| `pnpm build`           | Build for production                       |
| `pnpm start`           | Start production server                    |
| `pnpm db:up`           | Start PostgreSQL container                 |
| `pnpm db:down`         | Stop PostgreSQL container                  |
| `pnpm prisma:generate` | Generate Prisma client                     |
| `pnpm prisma:migrate`  | Run database migrations                    |
| `pnpm prisma:seed`     | Seed database                              |
| `pnpm prisma:studio`   | Open Prisma Studio                         |

## Project Structure

```
/app                    # Next.js App Router pages
  /api                  # API routes
  /auth                 # Login/Register pages
  /dashboard            # User dashboard
  /quizzes              # Quiz management
  /host                 # Host session page
  /join                 # Join session page
  /play                 # Participant play page
  /results              # Results page

/src
  /lib                  # Shared utilities
    auth.ts             # Authentication logic
    prisma.ts           # Database client
    validation.ts       # Zod schemas
    utils.ts            # Helper functions
  /server               # Socket.IO server
    index.ts            # Server entry point
    handlers.ts         # Socket event handlers
    sessionManager.ts   # Session state management
  /features             # Business logic
    /quiz               # Quiz service
    /session            # Session service
    /scoring            # Scoring service
  /ui
    /components         # React components
    /hooks              # Custom hooks (useSocket, useSession)

/prisma
  schema.prisma         # Database schema
  seed.ts               # Seed script
```

## Socket.IO Events

### Client -> Server

| Event                  | Payload                                        | Description            |
| ---------------------- | ---------------------------------------------- | ---------------------- |
| `session:join`         | `{ roomCode }`                                 | Join a session         |
| `session:start`        | `{ sessionId }`                                | Start quiz (host only) |
| `session:nextQuestion` | `{ sessionId }`                                | Next question (host)   |
| `session:revealAnswer` | `{ sessionId }`                                | Reveal answer (host)   |
| `session:finish`       | `{ sessionId }`                                | End session (host)     |
| `answer:submit`        | `{ sessionId, questionId, selectedOptionIds }` | Submit answer          |

### Server -> Client

| Event                 | Payload                                 | Description              |
| --------------------- | --------------------------------------- | ------------------------ |
| `session:joined`      | `{ sessionId }`                         | Successfully joined      |
| `session:lobbyUpdate` | `{ participants }`                      | Participant list updated |
| `session:state`       | `{ status, currentQuestionOrder, ... }` | Session state changed    |
| `question:show`       | Question data                           | New question started     |
| `answer:ack`          | `{ received }`                          | Answer received          |
| `answer:reveal`       | `{ questionId, correctOptionIds }`      | Correct answers revealed |
| `leaderboard:update`  | `{ leaderboard }`                       | Scores updated           |
| `session:finished`    | `{}`                                    | Quiz ended               |

## API Routes

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Quizzes

- `GET /api/quizzes` - List quizzes
- `POST /api/quizzes` - Create quiz
- `GET /api/quizzes/:id` - Get quiz
- `PATCH /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz
- `POST /api/quizzes/:id/questions` - Add question

### Questions

- `PATCH /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Sessions

- `GET /api/sessions` - List sessions
- `POST /api/sessions` - Create session
- `POST /api/sessions/join` - Join by room code
- `GET /api/sessions/:id/results` - Get results

## Environment Variables

| Variable                 | Description                               | Default                 |
| ------------------------ | ----------------------------------------- | ----------------------- |
| `DATABASE_URL`           | PostgreSQL connection string              | -                       |
| `SESSION_SECRET`         | Secret for session encryption (32+ chars) | -                       |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL                      | `http://localhost:3001` |
| `SOCKET_PORT`            | Socket.IO server port                     | `3001`                  |

## License

MIT
