---
created: 2026-02-26T13:47:55.146Z
title: Fix blurred Search icon in Security Audit tool
area: ui
files:
  - components/tools/security-audit/security-audit-component.tsx
---

## Problem

The `Search` icon (from `lucide-react`) inside the search input field of the Security Audit tool is completely blurred and not visible as a clear icon.

## Solution

Investigate the `SecurityAuditComponent` in `components/tools/security-audit/security-audit-component.tsx`.

The icon is rendered here:
```tsx
<div className='relative flex-1 group/input'>
  <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-primary transition-colors' />
  <input ... />
</div>
```

Potential causes:
- A parent component like `TextEffect` or `ProgressiveBlur` (both used in the same file) might be applying a filter that is leaking or affecting the icon's rendering.
- `TextEffect` with `preset='fade-in-blur'` is used in the header and might be affecting global styles if not scoped correctly.
- `ProgressiveBlur` is used in the results section and might be overlapping if there are layout issues.
- Conflicting CSS classes or backdrop filters in the `input` or its wrapper.

Steps:
1. Reproduce the issue by visiting the Security Audit tool page.
2. Use browser dev tools to inspect the `Search` icon and see if any `filter: blur(...)` or `backdrop-filter` is being applied.
3. Check if removing `backdrop-blur-sm` from the `input` field fixes the issue.
4. Ensure no absolute positioned elements with blur are overlapping the search input.
