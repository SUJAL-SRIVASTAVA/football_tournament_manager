# Supabase Setup Guide

This guide will help you set up Supabase for the Football Tournament app.

## 🚀 Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `football-tournament`
   - **Database Password**: Choose a secure password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

## 🔑 Step 2: Get Project Credentials

1. Go to **Settings > API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon public key** (starts with `eyJ`)
   - **service_role secret key** (starts with `eyJ`)

## 📝 Step 3: Create Environment File

Create a `.env.local` file in the project root with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# App Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Replace the placeholders:**
- `your-project-ref` with your actual project reference
- `your_anon_key_here` with your anon public key
- `your_service_role_key_here` with your service role key
- `[YOUR-PASSWORD]` with the database password you set

## 🗄 Step 4: Set Up Database Schema

### Option A: Using Supabase Dashboard (Recommended)

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Click "Run" to execute the migration
4. Copy and paste the contents of `supabase/seed.sql`
5. Click "Run" to seed the database

### Option B: Using Prisma (Alternative)

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database
npm run seed
```

## 🔐 Step 5: Configure Authentication

1. Go to **Authentication > Settings** in Supabase dashboard
2. Configure your site URL:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add `http://localhost:3000/auth/callback`
3. Save changes

## 📡 Step 6: Enable Realtime

1. Go to **Database > Replication** in Supabase dashboard
2. Enable realtime for:
   - `matches` table
   - `goals` table
3. This enables live updates for scores and goals

## 🧪 Step 7: Test the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`

3. Check the browser console for any connection errors

## 🔍 Step 8: Verify Database

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - `profiles`
   - `teams`
   - `players`
   - `matches`
   - `goals`

3. Check that sample data is present in each table

## 🚀 Step 9: Deploy to Production

When deploying to Vercel:

1. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SITE_URL` (your production URL)

2. Update Supabase Authentication settings:
   - **Site URL**: Your production URL
   - **Redirect URLs**: Add your production callback URL

## 🔧 Troubleshooting

### Common Issues:

1. **Connection Error**: Check your `DATABASE_URL` format
2. **RLS Policy Error**: Make sure you're authenticated
3. **Realtime Not Working**: Verify tables are enabled for realtime
4. **CORS Error**: Check your site URL in Supabase settings

### Useful Commands:

```bash
# Check Prisma connection
npx prisma db pull

# Reset database (careful!)
npx prisma db push --force-reset

# View database in browser
npx prisma studio
```

## 📊 Database Schema Overview

The app uses these main tables:

- **profiles**: User accounts with roles (PLAYER/ADMIN)
- **teams**: Tournament teams with group assignments
- **players**: Links profiles to teams
- **matches**: Fixtures with scores and status
- **goals**: Individual goals with scorers

## 🔐 Security Features

- **Row Level Security (RLS)**: All tables have RLS enabled
- **Admin-only operations**: Teams, matches, goals require admin role
- **Public read access**: Anyone can view matches and leaderboards
- **User profile protection**: Users can only update their own profiles

## 📱 Next Steps

After setup, you can:

1. **Test registration**: Visit `/register` to test player signup
2. **Create admin account**: Use the seeded admin user
3. **Add real teams**: Use admin interface to create teams
4. **Schedule matches**: Create fixtures for your tournament
5. **Enable live scoring**: Use the live match interface

---

Your Supabase integration is now ready! 🎉

