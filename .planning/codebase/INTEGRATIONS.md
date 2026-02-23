# External Integrations

**Analysis Date:** 2025-03-05

## APIs & External Services

**CMS:**
- TinaCMS - Headless CMS used for content management (blog posts, pages, global config).
  - SDK/Client: `tinacms`
  - Auth: `TINA_TOKEN` (Server-side), `NEXT_PUBLIC_TINA_CLIENT_ID` (Client-side)
  - Config: `tina/config.tsx`

**Email:**
- Resend - Used for sending transactional emails (e.g., feedback forms).
  - SDK/Client: `resend`
  - Auth: `RESEND_API_KEY`
  - Implementation: `lib/email/sender.ts`

**Security:**
- Cloudflare Turnstile - Used for bot protection and captcha.
  - Auth: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`

## Data Storage

**Databases:**
- TinaCMS (External/Git-based) - Stores content in Markdown/MDX and JSON files within the repository.
  - Client: `tinacms`
  - Collections: `Page`, `Post`, `Author`, `Tag`, `Global`

**File Storage:**
- Local Filesystem / Git - Media is stored in `public/uploads/` by default.
  - Configured in `tina/config.tsx` under `media.tina`.
- Remote Assets: `assets.tina.io` and `res.cloudinary.com` are allowed remote patterns in `next.config.ts`.

**Caching:**
- Cloudflare Cache - Managed via OpenNext and Next.js revalidation patterns.

## Authentication & Identity

**Auth Provider:**
- TinaCMS Identity - Used for authenticating editors to the CMS dashboard.
  - Implementation: Managed by Tina Cloud.

## Monitoring & Observability

**Error Tracking:**
- Not explicitly detected (e.g., no Sentry found).

**Logs:**
- Custom logging utility in `lib/logger.ts`.
- Supports levels: `DEBUG`, `INFO`, `WARN`, `ERROR`.
- Controlled via `LOG_LEVEL` environment variable.

## CI/CD & Deployment

**Hosting:**
- Cloudflare Workers - Deployed using `opennextjs-cloudflare`.

**CI Pipeline:**
- GitHub Actions - Workflows located in `.github/workflows/`:
  - `osv-scanner.yml`: Security scanning.
  - `pr-open.yml`: Pull request checks.

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_TINA_CLIENT_ID`
- `TINA_TOKEN`
- `RESEND_API_KEY`
- `TURNSTILE_SECRET_KEY`
- `LOG_LEVEL`

**Secrets location:**
- Stored in Cloudflare Dashboard (Secrets) or passed via CI during deployment.

## Webhooks & Callbacks

**Incoming:**
- `/api/feedback` - Receives feedback form submissions.
- `/api/security-audit` - Endpoint for security audit functionality.

**Outgoing:**
- Resend API calls for email delivery.
- Tina Cloud API calls for content syncing.

---

*Integration audit: 2025-03-05*
