---
created: 2026-02-26T20:22:49.615Z
title: Create Table of Contents block for Tina CMS
area: ui
files:
  - components/blocks/table-of-contents.tsx
  - tina/collection/page.ts
  - tina/collection/post.tsx
---

## Problem

Long pages and blog posts lack easy navigation. Users need an automated way to generate a Table of Contents (TOC) that can be inserted via Tina CMS, with the ability to specify which heading levels to include (e.g., skip h1 as it's the page title).

## Solution

1. Create a new `TableOfContents` component in `components/blocks/table-of-contents.tsx`.
2. The component should scan the document's structure for `h2`, `h3`, etc. and render them as a nested list of links.
3. Add a `levels` field to the block schema (default to 2: h2 and h3) to allow users to control the depth of the TOC.
4. Register the new block in `tina/collection/page.ts` and `tina/collection/post.tsx`.
5. Ensure the styling matches the "Architect" aesthetic (minimalistic, clear typography).
