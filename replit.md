# QuestInvest Pro

## Overview

QuestInvest Pro is a gamified investment platform where users can invest money, complete daily quests to earn rewards, and play a roulette mini-game to unlock bonuses. The platform targets French-speaking African markets (XOF currency) and combines financial investment mechanics with gaming elements like progression levels, leaderboards, and daily challenges.

**Core Features:**
- User investment with 40% first deposit bonus
- Daily quest system (video watching, quizzes, link clicks, referrals) earning 35% of investment per quest
- Roulette wheel game to unlock locked bonus balances
- Wallet management with deposits and withdrawals
- Gamification: Bronze/Silver/Gold/Platinum member levels and leaderboards
- **NEW: Progressive Web App (PWA) - installable mobile application**
- **NEW: Mobile-optimized navigation with bottom menu bar**

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
- **PWA Support:** Service Worker for offline capabilities and installability

The frontend follows a page-based structure under `client/src/pages/` with shared components in `client/src/components/`. Custom hooks in `client/src/hooks/` handle authentication and investment operations.

**Mobile Improvements (December 30, 2025):**
- Bottom navigation bar on mobile devices for easy thumb access
- Larger touch targets (44px+ minimum) for all interactive elements
- Progressive Web App with installation support on iOS and Android
- Service Worker for offline functionality and performance
- Responsive design with proper padding and spacing on all screen sizes

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

## Recent Changes

### Mobile & PWA Implementation (Dec 30, 2025)

**Files Created:**
- `client/public/manifest.json` - PWA manifest for app installation
- `client/public/sw.js` - Service Worker for offline support and caching

**Files Modified:**
- `client/index.html` - Added PWA meta tags, manifest link, and service worker registration
- `client/src/components/layout-shell.tsx` - Complete redesign for mobile:
  - Added bottom navigation bar on mobile (5 key nav items)
  - Improved button spacing (py-3, px-4) for better touch targets
  - Larger icons (size 20-24) for better visibility
  - Desktop sidebar remains on lg screens
  - Mobile menu header with improved layout
  - Added pb-20 padding on mobile to account for bottom nav
- `client/src/pages/wallet.tsx` - Increased button sizes:
  - Deposit/Withdraw buttons now use size="lg" with py-3
  - Form submission buttons updated for better mobile usability

**PWA Features:**
- Installable on iOS and Android devices
- Offline support via Service Worker
- App splash screen and icons
- Standalone display mode
- Dark theme support with proper meta tags
- Responsive design optimized for all screen sizes

**Mobile Improvements:**
- Bottom navigation bar provides easy access to 5 main features: Dashboard, Quêtes, Roulette, Portefeuille, Classement
- Touch-friendly button sizing (minimum 44x44px recommended)
- Improved spacing and padding on all interactive elements
- Service Worker caching for faster load times
- Proper viewport configuration for mobile browsers
