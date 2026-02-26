---
created: 2026-02-26T13:52:02.820Z
title: Fix On-Call Scheduler Generate button overflow on mobile
area: ui
files:
  - components/tools/scheduler/scheduler-component.tsx
---

## Problem

In the On-Call Scheduler tool, the "Generate" (and potentially "Settings") buttons overflow the boundary of their container panel on mobile vertical screens. This is likely due to the combined width of the icon and text within the buttons.

## Solution

Update the button rendering in `components/tools/scheduler/scheduler-component.tsx` to hide icons on small screens (mobile).

Specifically, for the "Generate" and "Show/Hide Member Configuration" buttons:
- Apply `hidden md:inline` or similar Tailwind classes to the `Lucide` icons within these buttons.
- This will reduce the horizontal space required on narrow viewports while maintaining the full label and icon on larger screens.

Example:
```tsx
<button ...>
  <RefreshCw className='w-5 h-5 hidden md:inline' />
  <span>Generate Schedule</span>
</button>
```

Wait, currently the icons are visible but the text is partially hidden with `hidden md:inline`. The user wants to *remove icons* to save space for text or just reduce overall width.

Re-evaluating based on user request: "remove the icons from button for mobile verical screens".

Updated Solution:
- Hide the icons on mobile and only show them on `md` screens and above.
- Ensure the button padding and layout still look good without icons on mobile.
