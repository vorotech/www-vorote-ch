---
created: 2026-02-26T09:59:24.747Z
title: Fix saving error in Tina Features component
area: ui
files:
  - components/blocks/features.tsx
  - tina/fields/icon.tsx
---

## Problem

Adding the "Features" component to a page in Tina CMS and attempting to save causes an error. This prevents users from adding feature lists to pages like "About Me".

## Solution

Investigate the `featureBlockSchema` in `components/blocks/features.tsx` and the `iconSchema` in `tina/fields/icon.tsx`.

Potential causes:
- Schema mismatch between `defaultItem` and the `fields` definition.
- `IconPickerInput` or `ColorPickerInput` might be throwing errors during the save process if they don't handle empty or malformed values correctly.
- Validation errors that are not being clearly surfaced in the UI.

Steps:
1. Try to reproduce the error in the Tina CMS admin.
2. Check the browser console for specific GraphQL or validation errors during the save attempt.
3. Verify that the `items` list in `Features` schema correctly handles its sub-fields, especially the nested `icon` object.
