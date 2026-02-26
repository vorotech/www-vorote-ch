---
created: 2026-02-26T13:53:15.298Z
title: Refactor FeaturedLink to minimalistic Mention style
area: ui
files:
  - components/blocks/featured-link.tsx
  - content/posts/2025/DefectDojo-Unified-DevSecOps-Security.mdx
---

## Problem

The current `FeaturedLink` component (used for mentioning external tools like DefectDojo in blog posts) is too bulky and doesn't match the minimalistic "Architect" aesthetic of the rest of the site. It uses large banner images and heavy color backgrounds which feel out of place in a professional technical blog.

## Solution

Refactor `FeaturedLink` in `components/blocks/featured-link.tsx` to a more subtle and minimalistic "Mention" block.

Proposed changes:
- Remove the large `aspect-[16/4]` banner image/background requirement.
- Use a clean, compact card design with a subtle border and background (zinc/muted).
- Focus on typography and a small icon/logo rather than a full-width banner.
- Align with the "Architect" style: thin borders, subtle shadows, and clear, readable text.
- Possibly rename the component to `Mention` if it's strictly used for these types of links.
- Ensure it looks good in the `prose` container of blog posts.

Example of new style:
- Small logo or icon on the left.
- Title and short description (optional) in the center/right.
- Subtle hover state with a small translation or border color change.
- No heavy background colors or large images.
