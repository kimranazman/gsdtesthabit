# Deployment

## Infrastructure

- **Hosting**: Vercel (auto-deploys from GitHub `main` branch)
- **Database**: Neon Postgres (via Vercel Storage integration)
- **Repo**: https://github.com/kimranazman/gsdtesthabit

## First-Time Setup (already done)

1. Create Neon Postgres database in Vercel Dashboard → Storage tab
2. Connect the database to the project (injects `POSTGRES_URL` env var)
3. Link locally: `npx vercel link --project gsdtesthabit --yes`
4. Pull env vars: `npx vercel env pull .env.local --yes`
5. Push schema: `set -a && source .env.local && set +a && npx drizzle-kit push`
6. Seed data: `set -a && source .env.local && set +a && npm run db:seed`

## Deploying Changes

After making edits (manually or via `/gsd-full-auto`):

1. Verify build: `npm run build`
2. Stage and commit: `git add -A && git commit -m "description of changes"`
3. Push: `git push origin main`
4. Vercel auto-deploys on push to `main`

## Database Changes

If the schema changes (e.g. new tables or columns in `src/lib/db/schema.ts`):

```bash
set -a && source .env.local && set +a && npx drizzle-kit push
```

## Local Development

```bash
npm run dev          # Start dev server at localhost:3000
npm run db:seed      # Re-seed database (clears existing data)
npm run db:studio    # Open Drizzle Studio to browse data
```

## Environment Variables

Pulled from Vercel via `npx vercel env pull .env.local`. Key vars:

- `POSTGRES_URL` — Pooled Neon connection (used at runtime)
- `DATABASE_URL` — Alias for compatibility
- `POSTGRES_URL_NON_POOLING` — Direct connection (used by drizzle-kit)

Do **not** commit `.env.local` (already in `.gitignore`).
