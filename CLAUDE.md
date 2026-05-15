# CLAUDE.md — NIL Club Take-Home

> You are a fast, careful implementation partner. I am the senior engineer directing the build.
> Build the smallest solid version that works end-to-end, then polish only what matters for the rubric.

---

## Project

NIL Club athlete earnings tracker. Athletes view brand deal earnings and payment history.
The goal is not a large app. The goal is a clean, runnable, senior-level take-home submission.

Required deliverables:
- Working monorepo
- Real database schema + seed data
- Working API routes
- Two working mobile screens
- Loading / error / retry / pull-to-refresh
- README that works on first try
- Clean commit history

```text
apps/
  api/        - Next.js 16 App Router + Hono + Zod
  mobile/     - Expo SDK 54 + Expo Router + TanStack Query v5
packages/
  database/   - Drizzle ORM schema, queries, seed script
```

Internal package: `@nil-club/database`

---

## Non-Negotiable Stack

Turborepo + pnpm
React Native 0.81 / Expo SDK 54
Next.js 16 App Router
Hono
Zod
Drizzle ORM
`@neondatabase/serverless`
TanStack Query v5
TypeScript strict mode

Use the package versions explicitly required by the prompt where they are provided:
- `expo ~54.0.0`
- `@tanstack/react-query ^5.0.0`
- `drizzle-orm ^0.38.0`
- `drizzle-kit ^0.31.10`
- `@neondatabase/serverless ^0.10.0`
- `hono ^4.6.0`
- `zod ^3.23.0`

For the rest of the Expo and React Native dependency tree:
- choose versions compatible with Expo SDK 54
- prefer the versions Expo itself expects for the installed SDK
- keep related packages aligned with each other
- after changing package versions, always run `pnpm install` before debugging runtime issues

Do not force arbitrary version combos without checking stack compatibility first.
Use versions that are compatible with the required stack and actually boot.

---

## Environment

```bash
# apps/api/.env.local
DATABASE_URL=postgresql://...

# packages/database/.env.local
DATABASE_URL=postgresql://...

# apps/mobile/.env.local
# Use your Mac's local IP, not localhost, when testing on a real phone
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000
```

Rules:
- Never commit `.env.local`
- Mobile on a physical phone cannot use `localhost`
- API URL must match the machine running `next dev`

---

## Critical Rules

**Money is always integer cents. Never float.**
`$5,000 -> 500000`

Display money with:

```ts
new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
}).format(cents / 100)
```

**All server state goes through TanStack Query.**
Never raw `fetch` inside screen components.

**QueryClientProvider wraps root in `app/_layout.tsx`.**
Nowhere else.

**Every screen needs all three states.**

```ts
if (isLoading) return <ActivityIndicator />
if (isError) return <ErrorView onRetry={refetch} />
```

Also include pull-to-refresh:

```tsx
refreshControl={
  <RefreshControl
    refreshing={isRefetching}
    onRefresh={refetch}
  />
}
```

**Do not hide useful errors during development.**
Generic error copy is okay for the final UI, but while building, surface the real fetch error message somewhere visible or log it clearly.

**Neon setup requires:**
`neonConfig.fetchConnectionCache = true`

**API response contract:**

```ts
{ data: T }
{ error: string, message: string }
```

**Validate on the server. Never trust client input.**
- Zod-validate route params
- Zod-validate request bodies if any are added
- Prefer validating response shapes too if time allows

**Wrap API handlers in try/catch and log with context.**

```ts
} catch (error) {
  console.error('[GET /athletes/:id]', error)
  return c.json(
    { error: 'internal_error', message: 'Failed to fetch athlete' },
    500
  )
}
```

**Always implement unhappy paths.**
- Network failure
- API unreachable
- Empty state
- Invalid ID
- 404 not found
- Unexpected response shape

The happy path working is not done.

**Dates: store UTC, display local.**
`createdAt` and `paidAt` are UTC timestamps in the database.

**Flag shortcuts with TODO.**

```ts
// TODO: hardcoded athlete selection for take-home; would come from auth in production
```

---

## API Endpoints

Required endpoints:

| Method | Path | Returns |
|--------|------|---------|
| GET | `/api/athletes` | `Athlete[]` |
| GET | `/api/athletes/:id` | `Athlete` |
| GET | `/api/athletes/:id/deals` | `Deal[]` |
| GET | `/api/athletes/:id/earnings` | `{ totalValueCents, totalPaidCents, totalPendingCents, dealCount }` |
| GET | `/api/deals/:id/payments` | `Payment[]` |

Hono route file:
`apps/api/app/api/[[...route]]/route.ts`

---

## Database

Tables:
- `athletes`
- `deals`
- `payments`

Enums:
- `dealStatus`: `active | completed | pending | cancelled`
- `paymentStatus`: `paid | pending | failed`

Rules:
- UUID primary keys with `defaultRandom()`
- `createdAt` and `updatedAt` on every table
- money stored as integer cents
- foreign keys with correct cascading behavior

Prefer direct query functions in:
`packages/database/src/queries/`

Do not add repository or service abstractions unless truly necessary.

---

## Required Seed Data

Must include:

```text
Marcus Johnson - Basketball, Duke University
  Nike deal: $15,000 total
    Payment 1: $5,000 paid
    Payment 2: $5,000 paid
    Payment 3: $4,500 pending
```

Also include:
- 2 or more additional athletes
- varied deal statuses
- varied payment statuses
- enough data to make the UI feel real

---

## Mobile Expectations

Screen 1: Earnings Overview
- athlete header
- total earnings card
- paid vs pending breakdown
- progress indicator
- bottom tabs
- active deals list
- each deal row should feel complete, not placeholder-only

Screen 2: Deal Detail
- payment history
- amount
- status
- date

Required behavior:
- loading state
- error state with retry
- pull-to-refresh
- navigation from deal row to deal detail

Prefer a clean, intentional UI over flashy styling.
Match the mockup's information hierarchy even if visuals are not exact.

---

## Build Order

Move in vertical slices. Verify each step before continuing.

```text
1. Create monorepo and install dependencies
2. Add env files
3. Define schema + generate/migrate
4. Run seed script
5. Verify seeded data in Neon
6. Build one API endpoint
7. Verify endpoint in browser/curl
8. Build one mobile screen using real API data
9. Add loading/error/retry/refresh
10. Add remaining endpoints
11. Add deal detail screen
12. Polish UI
13. Write README
14. Final run-through from a clean state
```

If something breaks, stop and fix it before stacking more code on top.

---

## Runbook

Always run from the repo root.

Install:

```bash
pnpm install
```

Seed:

```bash
pnpm --filter @nil-club/database db:seed
```

Start API:

```bash
pnpm --filter @nil-club/api dev
```

Start mobile:

```bash
pnpm --filter @nil-club/mobile dev -- --clear
```

Sanity check before opening Expo Go:
- API is running
- `EXPO_PUBLIC_API_URL` matches your local IP
- `http://YOUR_LOCAL_IP:3000/api/athletes` returns JSON in a browser

---

## Debug Checklist

If mobile shows "Something went wrong":
1. Check API server is running
2. Check `EXPO_PUBLIC_API_URL`
3. Confirm phone and laptop are on the same Wi‑Fi
4. Open `/api/athletes` in browser from laptop
5. Retry after restarting Expo with `--clear`

If package versions changed:
1. Update `package.json`
2. Run `pnpm install`
3. Restart dev servers

If Expo Go shows routing/runtime errors:
- suspect package version mismatch first
- prefer versions compatible with Expo SDK 54 and the required stack

Do not use `npx expo` as the main workflow for this monorepo.
Prefer `pnpm` commands from the repo root.

---

## Architecture Guardrails

Before adding any abstraction ask:
**Does this project need it right now?**

Good:
- small hooks
- focused query functions
- straightforward route handlers
- simple utility functions

Bad:
- repository pattern
- generic services
- deep folder hierarchies
- speculative abstractions

Complexity kills take-homes.
Simple, readable, verified code wins.

After every meaningful chunk, self-review:
- Is this more complex than the feature needs?
- Would a senior engineer simplify this?
- Did AI add something clever but unnecessary?

---

## Do Not Build

Do not spend time on:
- auth
- dark mode
- tests unless everything else is done
- deployment
- animations
- extra features not asked for
- over-engineered abstractions

---

## README Requirements

Before calling the project done, README must include:
- install steps
- env setup
- how to start API
- how to start mobile
- how to seed the database
- assumptions / tradeoffs
- any version deviation worth noting

The reviewer should be able to clone the repo and run it on first try.

---

## Submission Checklist

Before final submission confirm:
- app runs end-to-end
- API returns real data
- seed script works
- mobile screens both work
- loading/error/retry/refresh all work
- README is complete
- no broken package overrides
- git history is clean and incremental
- obvious shortcuts are documented

---

## Decisions Log

| Decision | Choice | Reason |
|----------|--------|--------|
| Athlete selection | Hardcode Marcus or first seeded athlete | No auth required by prompt |
| Expo Router version | Use working Expo 54-compatible version | Stable app beats outdated prompt wording |
