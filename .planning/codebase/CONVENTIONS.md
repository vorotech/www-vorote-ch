# Coding Conventions

## Formatting and Linting
- **Tool:** Biome (`biome.json`)
- **Indentation:** 2-space indentation
- **Quotes:** Single quotes for JSX, consistent style for strings.
- **Semicolons:** Required.

## Naming Conventions
- **Files:** kebab-case (e.g., `feedback-form.tsx`, `scheduler.test.ts`)
- **React Components:** PascalCase (e.g., `FeedbackForm`, `OnCallScheduler`)
- **Exports:** Prefer named exports for components and utilities.

## Patterns and Utilities
- **Class Names:** Uses the `cn` utility from `lib/utils.ts` for conditional Tailwind CSS class merging.
- **Logging:** Custom server-side logger implemented in `lib/logger.ts` with levels: DEBUG, INFO, WARN, ERROR.
- **State Management:** Complex component state (e.g., in `FeedbackForm`) uses `useReducer`.
- **Content:** Tina CMS integration for content management. Use generated types in `tina/__generated__/types.ts`.

## Tech Specifics
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **TypeScript:** Strict mode where possible, though some legacy gaps exist.
