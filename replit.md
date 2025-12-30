# QuestInvest Pro

## Overview

QuestInvest Pro is a gamified investment platform where users can invest money, complete daily quests to earn rewards, and play a roulette mini-game to unlock bonuses. The platform targets French-speaking African markets (XOF currency) and combines financial investment mechanics with gaming elements like progression levels, leaderboards, and daily challenges.

**Core Features:**
- User investment with 40% first deposit bonus
- Daily quest system (video watching, quizzes, link clicks, referrals) earning 35% of investment per quest
- Roulette wheel game to unlock locked bonus balances
- Wallet management with deposits and withdrawals
- Gamification: Bronze/Silver/Gold/Platinum member levels and leaderboards

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight React router)
- **State Management:** TanStack React Query for server state
- **Styling:** Tailwind CSS with custom dark theme (financial/gaming hybrid)
- **UI Components:** shadcn/ui component library (Radix UI primitives)
- **Animations:** Framer Motion for roulette wheel and transitions
- **Build Tool:** Vite with hot module replacement

The frontend follows a page-based structure under `client/src/pages/` with shared components in `client/src/components/`. Custom hooks in `client/src/hooks/` handle authentication and investment operations.

### Backend Architecture
- **Runtime:** Node.js with Express
- **Language:** TypeScript (ESM modules)
- **Authentication:** Passport.js with local strategy, session-based auth
- **Session Storage:** PostgreSQL via connect-pg-simple
- **Password Hashing:** Node crypto scrypt

API routes are defined in `server/routes.ts` with a typed API contract in `shared/routes.ts` using Zod schemas. The storage layer (`server/storage.ts`) abstracts database operations.

### Data Storage
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM with drizzle-zod for schema validation
- **Schema Location:** `shared/schema.ts`

**Core Tables:**
- `users` - User accounts with investment/wallet/bonus balances and membership level
- `daily_quests` - Daily quest assignments per user with completion status
- `transactions` - Financial transaction history (deposits, withdrawals, quest rewards)

### API Design Pattern
The project uses a typed API contract pattern where routes are defined in `shared/routes.ts` with Zod schemas for request/response validation. This provides type safety between frontend and backend.

### Build System
- Development: Vite dev server with Express backend (tsx for TypeScript execution)
- Production: Vite builds frontend to `dist/public`, esbuild bundles server to `dist/index.cjs`
- Database migrations: Drizzle Kit with `db:push` command

## External Dependencies

### Database
- **PostgreSQL** - Primary database, connection via `DATABASE_URL` environment variable
- Drizzle ORM for type-safe queries and schema management

### Frontend Libraries
- **Radix UI** - Headless UI primitives (dialogs, dropdowns, tabs, etc.)
- **TanStack React Query** - Server state management and caching
- **Framer Motion** - Animation library for roulette wheel
- **Lucide React** - Icon library
- **date-fns** - Date formatting utilities

### Backend Libraries
- **Passport.js** - Authentication middleware
- **express-session** - Session management
- **connect-pg-simple** - PostgreSQL session store

### Development Tools
- **Vite** - Frontend build tool and dev server
- **esbuild** - Server bundling for production
- **Drizzle Kit** - Database migration tooling

### Replit-Specific
- `@replit/vite-plugin-runtime-error-modal` - Error overlay in development
- `@replit/vite-plugin-cartographer` - Dev tooling (development only)