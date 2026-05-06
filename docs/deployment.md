# Deployment Guide

Deploy in this order — each service depends on the ones before it.

1. **Inngest** — get production keys
2. **Scraper** — Railway container, needs no upstream deps
3. **Next.js** — Vercel, needs all keys including scraper URL
4. **Expo / TestFlight** — EAS build, needs the Vercel URL

---

## 1. Inngest

Inngest has no infrastructure to deploy — you just register your app with the cloud.

1. Sign up at [app.inngest.com](https://app.inngest.com)
2. Create a new app
3. Go to **Settings → API Keys** and copy:
   - `INNGEST_EVENT_KEY`
   - `INNGEST_SIGNING_KEY`
4. Add both to your Vercel env vars (step 3 below)
5. After deploying Next.js, register your endpoint in the Inngest dashboard:
   - Go to **Apps → Register**
   - URL: `https://your-vercel-domain.vercel.app/api/inngest`

> Inngest will sync your functions automatically on each deploy once the endpoint is registered.

---

## 2. Scraper service (Railway)

The scraper runs as a Docker container. Railway is the easiest host.

### Deploy

1. Sign up at [railway.app](https://railway.app)
2. New project → **Deploy from GitHub repo**
3. Select the `vandu` repo, set the **root directory** to `apps/scraper`
4. Railway will detect the `Dockerfile` automatically

### Environment variables

Set these in the Railway service settings:

| Variable | Value |
|---|---|
| `SCRAPER_API_KEY` | A strong random secret (e.g. `openssl rand -hex 32`) |
| `PORT` | `3001` |

### After deploy

1. Copy the Railway public URL (e.g. `https://scraper-production-xxxx.up.railway.app`)
2. Add it to Vercel as `SCRAPER_SERVICE_URL`
3. Add the same `SCRAPER_API_KEY` to Vercel

### Verify

```sh
curl https://your-scraper-url.up.railway.app/health
# → {"ok":true}
```

---

## 3. Next.js web server (Vercel)

### Deploy

1. Sign up at [vercel.com](https://vercel.com)
2. Import the GitHub repo
3. Set the **root directory** to `apps/web`
4. Framework preset: **Next.js** (auto-detected)

### Environment variables

Add all of these in the Vercel project settings under **Settings → Environment Variables**:

```
DATABASE_URL
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_WEBHOOK_SIGNING_SECRET
ANTHROPIC_API_KEY
INNGEST_EVENT_KEY
INNGEST_SIGNING_KEY
CF_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_PUBLIC_URL
SCRAPER_SERVICE_URL
SCRAPER_API_KEY
```

### After deploy

**Wire up the Clerk webhook:**
1. Clerk Dashboard → **Webhooks → Add Endpoint**
2. URL: `https://your-vercel-domain.vercel.app/api/webhooks/clerk`
3. Events: `user.created`, `user.updated`, `user.deleted`
4. Copy the signing secret → set as `CLERK_WEBHOOK_SIGNING_SECRET` in Vercel

**Run the DB migration** (first deploy only):
```sh
pnpm --filter @vandu/db db:push
```

---

## 4. Expo app (TestFlight)

### Prerequisites

- Apple Developer account (paid, $99/year) — required for TestFlight
- EAS CLI installed and logged in:

```sh
npm install -g eas-cli
eas login
```

### One-time EAS setup

```sh
cd apps/mobile
eas init   # creates an EAS project linked to your Expo account
```

This adds an `extra.eas.projectId` to `app.json`.

### Configure `eas.json`

Create `apps/mobile/eas.json`:

```json
{
  "cli": {
    "version": ">= 16.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@apple.id",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

### Set production env vars in EAS

EAS reads from `.env` locally but for cloud builds you need to set secrets:

```sh
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://your-vercel-domain.vercel.app
eas secret:create --scope project --name EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY --value pk_live_xxxx
```

### Build for TestFlight

```sh
# Build production iOS binary
cd apps/mobile
eas build --platform ios --profile production
```

EAS will:
- Prompt you to sign in to your Apple Developer account
- Generate or reuse signing credentials automatically
- Build in the cloud (~10–15 min)
- Output a `.ipa` ready to submit

### Submit to TestFlight

```sh
eas submit --platform ios --profile production
```

This uploads the `.ipa` to App Store Connect. Once processed (~5 min), go to **App Store Connect → TestFlight** and add internal or external testers.

---

## Environment variable checklist

| Variable | Inngest | Railway | Vercel | EAS |
|---|---|---|---|---|
| `DATABASE_URL` | | | ✓ | |
| `CLERK_SECRET_KEY` | | | ✓ | |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | | | ✓ | |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | | | | ✓ |
| `CLERK_WEBHOOK_SIGNING_SECRET` | | | ✓ | |
| `ANTHROPIC_API_KEY` | | | ✓ | |
| `INNGEST_EVENT_KEY` | | | ✓ | |
| `INNGEST_SIGNING_KEY` | | | ✓ | |
| `CF_ACCOUNT_ID` | | | ✓ | |
| `R2_ACCESS_KEY_ID` | | | ✓ | |
| `R2_SECRET_ACCESS_KEY` | | | ✓ | |
| `R2_BUCKET_NAME` | | | ✓ | |
| `R2_PUBLIC_URL` | | | ✓ | |
| `SCRAPER_SERVICE_URL` | | | ✓ | |
| `SCRAPER_API_KEY` | | ✓ | ✓ | |
| `EXPO_PUBLIC_API_URL` | | | | ✓ |
