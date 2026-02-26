---
created: 2026-02-26T07:34:53.016Z
title: Make Content block background full width
area: ui
files:
  - components/layout/section.tsx
  - components/blocks/content.tsx
---

## Problem

In the CMS, "Content" blocks (e.g., "My Mission" on the About Me page) can have a background color (like Teal), but this background is currently limited by the `max-w-7xl` width of the section. This results in white space (or the default background) appearing on the left and right sides on wide screens, instead of the background color spanning the full width of the viewport.

## Solution

Modify the `Section` component in `components/layout/section.tsx` to allow the background container to span the full width while keeping the content centered within the `max-w-7xl` container.

The current structure in `Section` is:
```tsx
<div className={cn('relative overflow-hidden', bgClass)}>
  <section className={cn('py-12 mx-auto max-w-7xl px-6 relative z-10', ...)}>
    {children}
  </section>
</div>
```

The `bgClass` is on the outer `div`, which *should* be full width unless its parent has a constraint. However, if the `Section` itself is being wrapped or if there's a global constraint, it might be restricted. 

Investigation shows `Section` is indeed the wrapper. The issue might be that `main` in `components/layout/layout.tsx` or some other parent is restricting the width, or that the user expects the *content* to be able to go full-width too, or just the background.

Actually, in `Section`, the `bgClass` is on the outer `div`. If this outer `div` is not spanning full width, we need to ensure the parent containers don't have `max-w` or `container` classes that are too restrictive.

Also, check if `Content` block or other blocks are being wrapped in a container before `Section` is called. In `components/blocks/index.tsx`, they are wrapped in a `div` with `data-tina-field`.

TBD:
- Ensure `main` and all parent containers of `Blocks` are full-width (`w-full`).
- Verify if any global CSS is applying a `max-width` to `section` or `div` tags.
- The user specifically mentioned the "My Mission" block on "About Me" page.
