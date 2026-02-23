# Codebase Concerns

## Technical Debt

### Component Complexity
- **Scheduler Tool:** `OnCallScheduler` (`components/tools/scheduler/scheduler-component.tsx`) is over 800 lines with complex state and logic mixed with UI. Uses `@ts-nocheck`.
- **Prop Types:** Multiple components (`raw-renderer.tsx`, `icon.tsx`) use `@ts-ignore` or `any` for props.

## Security Risks

### Input Validation
- **Audit Tool:** `app/api/security-audit/route.ts` fetches from external registries based on user input. While validated with regex, it remains a high-surface area for SSRF or injection.
- **Feedback Email:** `app/api/feedback/route.ts` injects user messages into HTML templates without explicit sanitization.

## Architectural Fragility

### CMS Coupling
- **Tina CMS:** Tight coupling between Tina schema definitions and UI blocks. Schema changes can be risky.
- **Solution:** Lean more on generated types from `tina/__generated__/types.ts`.

## Testing Gaps
- **Granularity:** Lack of unit tests for `components/blocks/*.tsx` and `components/ui/*.tsx`. UI regressions are mostly caught in E2E.
