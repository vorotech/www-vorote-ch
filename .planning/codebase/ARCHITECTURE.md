# Architecture

**Analysis Date:** 2025-02-17

## Pattern Overview

**Overall:** Headless CMS with Next.js (App Router) and Serverless Edge Deployment.

**Key Characteristics:**
- **Static-First with ISR:** Leverages Next.js Incremental Static Regeneration for fast performance with up-to-date content.
- **Visual Editing:** Integrates TinaCMS for real-time, on-page content management using Markdown/JSON as a data source.
- **Block-Based UI:** Content is structured into reusable, configurable blocks that map directly from the CMS schema to React components.

## Layers

**Content Layer:**
- Purpose: Source of truth for all site content.
- Location: `content/`
- Contains: Markdown (`.md`), MDX (`.mdx`), and JSON (`.json`) files organized by collection (posts, pages, authors, etc.).
- Depends on: None.
- Used by: TinaCMS and Next.js data fetching.

**Data Access Layer (CMS):**
- Purpose: Provides a typed interface for querying content files.
- Location: `tina/`
- Contains: Schema definitions in `tina/config.tsx` and generated client in `tina/__generated__/`.
- Depends on: Content Layer.
- Used by: Next.js Server Components and dynamic routes.

**Component Layer:**
- Purpose: Renders the UI based on content and state.
- Location: `components/`
- Contains: Reusable UI primitives (`components/ui/`) and content-driven blocks (`components/blocks/`).
- Depends on: Data Access Layer (for types) and Tailwind CSS.
- Used by: Next.js Pages and Layouts.

**Routing & Orchestration Layer:**
- Purpose: Maps URLs to content and coordinates data fetching.
- Location: `app/`
- Contains: Next.js App Router files (layouts, pages, loading states, error boundaries).
- Depends on: Data Access Layer, Component Layer.
- Used by: End users.

## Data Flow

**Page Rendering Flow:**

1. **Request:** User requests a URL (e.g., `/posts/my-post`).
2. **Fetch:** Next.js Server Component in `app/posts/[...urlSegments]/page.tsx` calls `client.queries.post()` from the generated TinaCMS client.
3. **Parse:** TinaCMS parses the corresponding file in `content/posts/` based on the query.
4. **Hydrate:** The page component passes the fetched data to a client-side `ClientPage` component.
5. **Real-time Sync:** The `useTina` hook in the `ClientPage` enables real-time updates when the user is in the TinaCMS editor.
6. **Render:** The `Blocks` component iterates over the page data and renders the appropriate React components from `components/blocks/`.

**State Management:**
- **Content State:** Managed by TinaCMS with local file persistence.
- **UI State:** Handled via React `useState`/`useContext` in `components/layout/layout-context.tsx`.
- **Global Themes:** Managed by `next-themes` and `components/theme-toggle.tsx`.

## Key Abstractions

**Blocks:**
- Purpose: High-level UI sections that can be ordered and configured by content editors.
- Examples: `components/blocks/hero.tsx`, `components/blocks/content.tsx`, `components/blocks/features.tsx`.
- Pattern: Strategy pattern for rendering different block types in `components/blocks/index.tsx`.

**Tina Collections:**
- Purpose: Defines the schema and storage rules for different types of content.
- Examples: `tina/collection/post.ts`, `tina/collection/page.ts`.
- Pattern: Schema-driven development.

## Entry Points

**Main Application:**
- Location: `app/layout.tsx`
- Triggers: All page requests.
- Responsibilities: Setting up the root HTML structure, fonts, global providers, and layouts.

**TinaCMS Config:**
- Location: `tina/config.tsx`
- Triggers: Build process and TinaCMS admin interface.
- Responsibilities: Defining the content schema, collections, and CMS behaviors.

**Static Page Entry:**
- Location: `app/page.tsx`
- Triggers: Root URL (`/`) request.
- Responsibilities: Fetching and rendering the home page content from `content/pages/home.mdx`.

## Error Handling

**Strategy:** Hierarchical error boundaries and fallback UI.

**Patterns:**
- **Route-level Boundaries:** Next.js `error.tsx` for handling runtime errors within specific routes.
- **Component-level Boundaries:** `components/error-boundary.tsx` used in `ClientPage` to prevent a single block from crashing the entire page.
- **Graceful Fallbacks:** `app/not-found.tsx` for 404 errors.

## Cross-Cutting Concerns

**Logging:** custom logger in `lib/logger.ts` for consistent server-side and client-side logging.
**Validation:** Zod (implicitly via TinaCMS schema) and TypeScript for type safety.
**Authentication:** TinaCMS handles its own auth for the `/admin` route.
**Email:** Centralized email sending service in `lib/email/sender.ts` using Resend.

---

*Architecture analysis: 2025-02-17*
