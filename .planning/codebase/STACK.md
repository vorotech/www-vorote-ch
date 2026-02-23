# Technology Stack

**Analysis Date:** 2025-03-05

## Languages

**Primary:**
- TypeScript v5.9.3 - Used throughout the project (Next.js, Cloudflare Workers, tests).

## Runtime

**Environment:**
- Node.js (v20.9.0+ required by Next.js engine)
- Cloudflare Workers (via OpenNext)

**Package Manager:**
- pnpm v10.30.1
- Lockfile: `pnpm-lock.yaml` present

## Frameworks

**Core:**
- Next.js v16.1.6 - Full-stack React framework.
- React v18.3.1 - Core UI library.

**Testing:**
- Playwright v1.58.2 - E2E testing framework.

**Build/Dev:**
- OpenNext (@opennextjs/cloudflare) v1.16.1 - Bridge for deploying Next.js to Cloudflare.
- TinaCMS v3.5.0 - Headless CMS and content editing interface.
- Biome v1.9.4 - Linting and formatting tool.

## Key Dependencies

**Critical:**
- `tinacms` v3.5.0 - Content management system integrated into the app.
- `tailwindcss` v4.1.18 - Utility-first styling framework.
- `motion` v12.29.2 - Animation engine for React.
- `mermaid` v11.10.0 - Rendering of diagrams and charts.
- `resend` v6.9.1 - Library for email delivery via Resend API.

**Infrastructure:**
- `wrangler` v4.61.1 - Cloudflare CLI and development tool.
- `@opennextjs/cloudflare` v1.16.1 - Cloudflare-specific adapter for Next.js.

## Configuration

**Environment:**
- Configured via `.env` (using `.env.example` as a template).
- Key configs: `NEXT_PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`.

**Build:**
- `next.config.ts` - Next.js configuration.
- `wrangler.jsonc` - Cloudflare Workers configuration.
- `open-next.config.ts` - OpenNext deployment configuration.
- `tina/config.tsx` - TinaCMS schema and media configuration.

## Platform Requirements

**Development:**
- Node.js (>=20.9.0)
- pnpm

**Production:**
- Cloudflare Workers platform.

---

*Stack analysis: 2025-03-05*
