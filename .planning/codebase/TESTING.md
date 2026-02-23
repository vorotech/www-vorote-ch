# Testing Practices

## E2E Testing
- **Framework:** Playwright
- **Location:** `tests/e2e/`
- **Command:** `pnpm test:e2e`
- **Coverage:** Core user flows (Home, About, Blog, Scheduler).

## Logic and Simulation Testing
- **Approach:** Custom test runners for logic-heavy business logic.
- **Example:** `components/tools/scheduler/scheduler.test.ts` is a standalone script run via `tsx`.
- **Command:** `pnpm test:scheduler`
- **Purpose:** Verifies complex algorithms (like the on-call scheduler) without full browser overhead.

## Test Gaps
- **UI Components:** Lack of granular unit tests for individual React components and Tina blocks.
- **API Routes:** API routes are primarily tested via E2E integration tests.
