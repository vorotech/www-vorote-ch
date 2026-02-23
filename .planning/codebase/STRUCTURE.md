# Codebase Structure

**Analysis Date:** 2025-02-17

## Directory Layout

```
www-vorote-ch/
├── app/                # Next.js App Router (Routes & Pages)
│   ├── api/            # API Route Handlers
│   ├── posts/          # Blog post routes
│   └── tools/          # Tool-specific pages (scheduler, security-audit)
├── components/         # React Components
│   ├── blocks/         # Content-driven CMS blocks
│   ├── layout/         # Navigation, Footer, and Providers
│   ├── ui/             # Reusable UI primitives (shadcn-like)
│   └── magicui/        # Specialized animation/UI components
├── content/            # CMS Data (Markdown, MDX, JSON)
│   ├── posts/          # Blog post content files
│   ├── pages/          # Static page content (home, about)
│   └── global/         # Global site settings
├── lib/                # Shared utilities and services
│   ├── email/          # Resend email integration
│   └── logger.ts       # Centralized logging
├── public/             # Static assets (images, fonts, icons)
├── tina/               # TinaCMS configuration and schema
│   ├── collection/     # Content collection definitions
│   └── __generated__/  # Generated Tina client and types
├── tests/              # Playwright E2E tests
└── docs/               # Technical documentation
```

## Directory Purposes

**app/:**
- Purpose: Application routing and server-side logic.
- Contains: Layouts, pages, and route handlers.
- Key files: `app/layout.tsx`, `app/page.tsx`.

**components/blocks/:**
- Purpose: Building blocks for content pages.
- Contains: Functional components like Hero, Content, Features, etc.
- Key files: `components/blocks/index.tsx` (the block dispatcher).

**content/:**
- Purpose: The "database" of the application.
- Contains: Textual and structural data managed by the CMS.
- Key files: `content/pages/home.mdx`.

**lib/:**
- Purpose: Domain-agnostic utility functions and external service wrappers.
- Contains: Helper functions, email senders, and loggers.

**tina/:**
- Purpose: Headless CMS configuration.
- Contains: Field definitions, collection schemas, and GraphQL-like queries.

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root layout and providers.
- `app/page.tsx`: Homepage entry.
- `tina/config.tsx`: CMS configuration.

**Configuration:**
- `next.config.ts`: Next.js configuration.
- `wrangler.jsonc`: Cloudflare Pages deployment config.
- `tailwind.config.ts`: Tailwind CSS styling rules.
- `biome.json`: Linting and formatting rules.

**Core Logic:**
- `components/blocks/index.tsx`: Main logic for rendering page blocks.
- `lib/email/sender.ts`: Email dispatch logic.

**Testing:**
- `playwright.config.ts`: E2E test configuration.
- `tests/e2e/`: End-to-end test suites.

## Naming Conventions

**Files:**
- Components: PascalCase (`Hero.tsx`, `FeedbackForm.tsx`).
- Routes/Pages: kebab-case or special Next.js names (`page.tsx`, `layout.tsx`).
- Utilities: kebab-case (`utils.ts`, `logger.ts`).

**Directories:**
- Feature/Module folders: kebab-case (`tools/scheduler`, `lib/email`).

## Where to Add New Code

**New Feature (Page):**
- Primary code: `app/[feature-name]/page.tsx`.
- Components: `components/[feature-name]/`.
- Tests: `tests/e2e/[feature-name].test.ts`.

**New CMS Block:**
- Implementation: `components/blocks/[block-name].tsx`.
- Register in: `components/blocks/index.tsx`.
- Schema definition: `tina/collection/page.ts` (or relevant collection).

**Utilities:**
- Shared helpers: `lib/utils.ts` or new file in `lib/`.

## Special Directories

**.planning/:**
- Purpose: GSD codebase documentation and planning state.
- Generated: No (Managed by GSD).
- Committed: Yes.

**tina/__generated__/:**
- Purpose: Auto-generated TypeScript types and GraphQL client.
- Generated: Yes (by `tinacms` CLI).
- Committed: Yes.

---

*Structure analysis: 2025-02-17*
