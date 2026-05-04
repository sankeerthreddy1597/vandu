# Local Development

How to run the full Vandu stack locally.

---

## Prerequisites (one-time setup)

```sh
# 1. Install dependencies
pnpm install

# 2. Generate Prisma client
pnpm --filter @vandu/db db:generate

# 3. Push schema to Neon DB (creates tables)
pnpm --filter @vandu/db db:push

# 4. Install Playwright's Chromium for the scraper
cd apps/scraper && npx playwright install chromium && cd ../..
```

Make sure your root `.env` is filled in — copy from `.env.example` if you haven't already.

---

## Services

You need four terminal tabs running simultaneously.

### Tab 1 — Next.js web server (port 3000)

```sh
pnpm --filter @vandu/web dev
```

Runs the API routes, Clerk auth, and Inngest endpoint.

### Tab 2 — Inngest dev server (port 8288)

```sh
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
```

Connects to the Next.js app, discovers your functions, and runs them locally when events fire.
Open **http://localhost:8288** to inspect runs, trigger events manually, and replay failures.

> The Inngest dev server must start **after** Next.js is up, so it can reach `/api/inngest` on first connect.

### Tab 3 — Scraper service (port 3001)

```sh
pnpm --filter @vandu/scraper dev
```

Playwright-based scraper that the Inngest pipeline calls when processing recipe URLs.

### Tab 4 — Clerk webhook forwarding

```sh
npx clerk webhook forward --url http://localhost:3000/api/webhooks/clerk
```

Forwards Clerk user lifecycle events (created, updated, deleted) to your local server so users are synced to the DB on sign-up.

---

## Mobile app

Run after the web server is up. Builds and installs a dev client on the booted iOS simulator.

```sh
# First run — builds native dev client (~5 min)
pnpm --filter @vandu/mobile ios

# Subsequent runs — JS only, no rebuild needed
pnpm --filter @vandu/mobile start
```

Make sure `EXPO_PUBLIC_API_URL=http://localhost:3000` is set in your `.env`.

---

## Port reference

| Service         | Port  |
|-----------------|-------|
| Next.js         | 3000  |
| Inngest UI      | 8288  |
| Scraper         | 3001  |
| Expo Metro      | 8081  |

---

## Common issues

**Prisma: `Cannot find module '../generated/client'`**
Run `pnpm --filter @vandu/db db:generate`.

**Inngest functions not appearing in the UI**
Make sure Next.js is running first, then start the Inngest dev server.

**Scraper returning 401**
Check that `SCRAPER_API_KEY` is set in your `.env` and matches what the web app sends in `X-Api-Key`.

**Mobile stuck on loading indicator**
Fonts may have failed to load — the app will still work with system fonts. Check that `pnpm install` has been run since the last `package.json` change.
