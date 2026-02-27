# Codebase Concerns

## Technical Debt

### Component Complexity
- [x] **Scheduler Tool:** `OnCallScheduler` refactored into `useScheduler` hook and modular sub-components. Removed `@ts-nocheck`.
- [x] **Prop Types:** `RawRenderer` and `Icon` components now have proper TypeScript interfaces. Removed `@ts-ignore` and unnecessary `any` usages.

## Security Risks

### Input Validation
- [x] **Audit Tool:** `app/api/security-audit/route.ts` now validates `advisoryId` using regex to prevent SSRF or unexpected API calls.
- [x] **Feedback Email:** `app/api/feedback/route.ts` now uses `escapeHtml` to sanitize user messages before injecting into HTML templates.

## Architectural Fragility

### CMS Coupling
- **Tina CMS:** Tight coupling between Tina schema definitions and UI blocks. Schema changes can be risky.
- **Status:** Ongoing. Improved by using more explicit typing in components consuming Tina data.

## Testing Gaps
- **Granularity:** Lack of unit tests for `components/blocks/*.tsx` and `components/ui/*.tsx`. UI regressions are mostly caught in E2E.
