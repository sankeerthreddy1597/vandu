# Vandu

A personal recipe-saving app for iOS. Save recipes from anywhere — Instagram reels, any URL on the web, or a photo of a recipe card — and get a clean, structured result with ingredients and step-by-step instructions.

---

## Features

### Saving recipes

- **Instagram** — paste an Instagram reel or post URL and the app extracts the recipe from the caption and comments
- **Recipe URLs** — paste any recipe page URL; the scraper pulls the full page content and the LLM structures it
- **Photo / image** — upload a photo of a recipe card, handwritten notes, or a cookbook page; Claude vision reads it directly

### Processing pipeline

Each save triggers an async pipeline with real-time status updates:

1. **Scraping** — Playwright fetches the URL (tries JSON-LD schema first, falls back to page text)
2. **Extracting** — Claude structures the raw content into typed ingredients and steps using `generateObject`
3. **Done** — recipe is persisted and immediately readable

The mobile app polls for status and updates the UI as each step completes.

### Recipe detail

- Ingredients list with tap-to-check interaction
- Step-by-step instructions
- Source badge (Instagram / URL / Photo)
- Processing status banner while the pipeline runs
- Delete recipe

### Recipes tab

- Full recipe list with search and filter by source type (Instagram, URL, Image)
- "In progress" and "This month" sections
- Pull-to-refresh and infinite scroll

### Home tab

- Personalised greeting and recipe stats
- Recent saves
- Quick search shortcut

---

## Tech stack

| Layer | Technology |
|---|---|
| Mobile app | Expo (React Native) + Expo Router, iOS-first |
| Backend / API | Next.js (App Router) deployed on Vercel |
| Auth | Clerk — session management for Expo and Next.js |
| Database | Neon (serverless Postgres) |
| ORM | Prisma |
| Background jobs | Inngest — durable async pipeline with retries |
| LLM | Anthropic Claude (`claude-sonnet-4-5`) via Vercel AI SDK `generateObject` |
| Scraping | Playwright + Express, deployed as a container on Railway |
| File storage | Cloudflare R2 (S3-compatible, no egress fees) |
| Monorepo | pnpm workspaces + Turborepo |

---

## Monorepo structure

```
/
├── apps/
│   ├── mobile/       # Expo app (iOS)
│   ├── web/          # Next.js API + Inngest functions
│   └── scraper/      # Playwright scraper service (Express)
├── packages/
│   ├── db/           # Prisma schema + generated client
│   ├── types/        # Shared TypeScript types
│   └── validators/   # Shared Zod schemas
└── docs/             # Project documentation
```

---

## Docs

- [Local development guide](local-dev.md) — how to run all services locally
- [Implementation plan](recipe-app-plan.md) — architecture decisions and implementation order
- [Development build guide](development_build.md) — how to create an Expo dev build for the simulator or device
