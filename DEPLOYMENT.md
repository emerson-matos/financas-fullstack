# Deployment Guide: Vercel + Shared Supabase

This guide covers deploying the Top Hat Finanças app to Vercel with a shared Supabase instance.

## Prerequisites

- Vercel account
- Access to the shared Supabase project
- Supabase project URL and anon key

---

## Schema Isolation (for Shared Supabase)

This project uses a dedicated `thc` schema to isolate tables from other apps sharing the same Supabase instance. The schema is created automatically by the first migration (`00000000000000_create_thc_schema.sql`).

---

## Vercel Deployment

### Step 1: Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Import your Git repository
3. Vercel will auto-detect Next.js

### Step 2: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` | Your anon key | All |

### Step 3: Deploy

Click "Deploy" - Vercel handles the rest. The build command is just `next build`.

---

## Database Migrations

Migrations are run separately via **GitHub Actions** (not during Vercel build).

### Automatic Migration (Recommended)

When you push changes to `supabase/migrations/**` on the `main` branch, the GitHub Action `.github/workflows/migrations.yml` runs automatically.

**Setup:**
1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add secret: `SUPABASE_DB_URL` with your database connection string

### Manual Migration

Run locally with:
```bash
SUPABASE_DB_URL="postgresql://..." pnpm db:migrate:prod
```

---

## NPM Scripts Reference

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm db:migrate` | Push migrations to local Supabase |
| `pnpm db:migrate:prod` | Push migrations to production (uses `$SUPABASE_DB_URL`) |
| `pnpm db:reset` | Reset local database and run migrations + seed |
| `pnpm db:status` | List migration status |
| `pnpm supabase:start` | Start local Supabase |
| `pnpm supabase:stop` | Stop local Supabase |

---

## Supabase Configuration

### Authentication URLs

In Supabase Dashboard → Authentication → URL Configuration:

1. **Site URL**: `https://your-app.vercel.app`

2. **Redirect URLs** (add all):
   ```
   https://your-app.vercel.app/auth/confirm
   https://your-app.vercel.app/auth/oauth
   ```

3. For preview deployments, add wildcard:
   ```
   https://*-your-team.vercel.app/auth/confirm
   https://*-your-team.vercel.app/auth/oauth
   ```

### Expose thc Schema in Supabase API

In Supabase Dashboard → Settings → API → Exposed schemas:
- Add `thc` to the list of exposed schemas

This allows the Supabase client to query tables in the `thc` schema.

### Database Migration

Migrations run automatically during Vercel build via `pnpm vercel-build`.

For manual migration:
```bash
# Using npm script with SUPABASE_DB_URL env var
pnpm db:migrate:prod

# Or directly with Supabase CLI
supabase db push --db-url "postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
```

---

## Post-Deployment Checklist

- [ ] Environment variables set in Vercel
- [ ] Database migration applied
- [ ] Supabase Auth URLs configured
- [ ] RLS policies active (check in Supabase Dashboard → Database → Tables)
- [ ] Test signup/login flow
- [ ] Test protected routes return 401 when unauthenticated
- [ ] Verify data isolation (users can only see their own data)

---

## Troubleshooting

### "Invalid JWT" or auth errors
- Ensure the anon key matches your Supabase project
- Check that the Supabase URL is correct (no trailing slash)

### "relation does not exist" errors
- Migration not applied, or applied to wrong schema
- Check search_path if using custom schema

### CORS errors
- Add your Vercel domain to Supabase allowed origins

### Users randomly logged out
- The proxy.ts should call `supabase.auth.getUser()` to refresh sessions
- This is already configured in `lib/supabase/proxy.ts`

---

## Local Development

```bash
# Install dependencies
pnpm install

# Start Supabase locally (optional - uses local Docker instance)
pnpm supabase start

# Or use the shared Supabase instance directly
# Create .env.local with your Supabase credentials

# Start dev server
pnpm dev
```
