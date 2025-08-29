# Football Tournament Manager

A mobile-first, production-ready football tournament management web app built with Next.js 14, Supabase, and Prisma.

## 🚀 Features

- **Mobile-First Design** - Optimized for mobile with PWA support
- **Real-time Updates** - Live score updates via Supabase Realtime
- **QR Code Registration** - Players scan QR to register
- **Admin Dashboard** - Complete tournament management
- **Live Match Control** - Real-time score editing and goal tracking
- **Group Tables** - Auto-computed standings with tie-breakers
- **Leaderboards** - Top scorers and team rankings
- **Offline Support** - PWA with offline fallback

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL) + Prisma ORM
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Forms**: React Hook Form + Zod validation
- **PWA**: next-pwa
- **Testing**: Vitest + React Testing Library + Playwright

## 📱 Mobile-First UX

- Bottom tab navigation
- Large tap targets (44px minimum)
- Responsive cards over tables
- PWA installable
- Offline support with cached data

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (admin)/           # Admin-only routes
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components
├── lib/                  # Utilities and helpers
│   ├── supabase/         # Supabase clients
│   └── utils.ts          # Utility functions
├── types/                # TypeScript types
└── prisma/               # Database schema
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone and Install

```bash
git clone <repository-url>
cd football-tournament
npm install
```

### 2. Environment Setup

Copy the environment template and fill in your Supabase credentials:

```bash
cp env.example .env.local
```

Required environment variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database
DATABASE_URL=your_supabase_postgres_connection_string

# App Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run seed
```

### 4. Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 🗄 Database Schema

### Core Models

- **Profile**: User profiles with roles (PLAYER/ADMIN)
- **Team**: Tournament teams with group assignments
- **Player**: Links profiles to teams
- **Match**: Fixtures with scores and status
- **Goal**: Individual goals with scorers and minutes

### Key Features

- Case-insensitive username uniqueness
- Proper foreign key constraints
- Enum types for status and roles
- Timestamps for all entities

## 🔐 Authentication & Authorization

### Supabase RLS Policies

- **Profiles**: Users can read all, update own
- **Teams/Matches/Goals**: Read for all, write for admins only
- **Admin Helper Function**: `is_admin()` for role checks

### User Roles

- **PLAYER**: Can view matches, leaderboards, register
- **ADMIN**: Full CRUD access to all entities

## 📱 PWA Features

- **Installable**: Add to home screen
- **Offline Support**: Cached app shell
- **Background Sync**: API cache with stale-while-revalidate
- **Manifest**: Proper app metadata and icons

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Manual Deployment

```bash
npm run build
npm start
```

## 📊 API Endpoints

### Public APIs
- `GET /api/public/matches` - List matches by status
- `GET /api/public/leaderboard` - Top scorers
- `GET /api/public/groups` - Group standings

### Admin APIs
- `POST /api/teams` - Create/update teams
- `POST /api/matches` - Create/update matches
- `POST /api/goals` - Add goals to matches
- `POST /api/assign` - Assign players to teams

## 🔄 Real-time Features

- **Live Score Updates**: All connected clients see score changes
- **Goal Notifications**: Real-time goal announcements
- **Match Status Changes**: Live status transitions
- **Offline Fallback**: Shows last known data when offline

## 📱 Mobile Navigation

Bottom tab navigation with:
- **Home**: Landing page with quick actions
- **Matches**: Upcoming, live, and completed matches
- **Leaderboard**: Top scorers and rankings
- **Groups**: Group stage standings

## 🎯 User Stories

### Player Registration
1. Scan QR code → `/register`
2. Create unique username
3. Enter name and university
4. Auto-created in Supabase Auth + profiles table

### Admin Management
1. Create teams and assign players
2. Schedule matches with venues
3. Live score control during matches
4. Add goals with scorer and minute

### Live Match Experience
1. Real-time score updates
2. Goal-by-goal commentary
3. Match status transitions
4. Offline support with cached data

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes
npm run db:migrate      # Run migrations
npm run seed            # Seed database

# Testing
npm test               # Run unit tests
npm run test:e2e       # Run e2e tests
npm run test:watch     # Watch mode

# Linting
npm run lint           # Run ESLint
npm run lint:fix       # Fix linting issues
```

## 📈 Performance

- **Lighthouse Score**: Target 85+ on mobile
- **Core Web Vitals**: Optimized for mobile
- **Bundle Size**: Tree-shaken and optimized
- **Caching**: Strategic API and asset caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with details

---

Built with ❤️ using Next.js, Supabase, and modern web technologies.
