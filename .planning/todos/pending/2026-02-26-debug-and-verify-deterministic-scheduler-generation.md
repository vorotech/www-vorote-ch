---
created: 2026-02-26T22:46:21.972Z
title: Debug and Verify Deterministic Scheduler Generation
area: testing
files:
  - components/tools/scheduler/scheduler.ts
  - tests/scheduler.test.ts
---

## Problem

The On-Call Scheduler generation logic produces imbalanced results that don't seem strictly related to constraints (time off, weekendOnly). In a test case for Feb 2026 with 7 members, some members (Dmytro, Oleksii) consistently get 5 shifts while others (Serhii, Oleksandr) get 3, despite available capacity. The user also noted that previous testing attempts might not have been effective in ensuring deterministic and verifiable results.

### Input Data
Month: 1 (Feb), Year: 2026
Members: 7 (Dmytro, Yaroslav, Lev, Vadym, Serhii, Oleksandr, Oleksii)
Various constraints: 
- Oleksandr: weekendOnly=true, maxWeekendSlots=3
- Serhii: maxWeekendSlots=3, long timeOff (Jan 18-31)
- Others: various timeOffs and allowedWeekdays.

### Actual Stats
- ID 1 (Dmytro): 5 total
- ID 7 (Oleksii): 5 total
- Others: 3-4 total.

## Solution

1. **Reproduction Script**: Create a dedicated test file `tests/scheduler.test.ts` that uses the exact input JSON provided by the user.
2. **Deterministic Verification**: Ensure the solver configuration is deterministic (check if `Math.random()` or solver seeds affect output).
3. **Fairness Analysis**: Investigate why the linear programming solver is favoring certain members. Check the `fairness` objective function and constraint weights.
4. **Testing Approach**:
    - Implement property-based testing (if applicable) or a suite of "Gold Standard" test cases.
    - Add assertions for:
        - Total shift delta (no more than 1 shift difference between members with similar availability).
        - Hard constraint satisfaction (maxWeekendSlots, timeOff).
        - No consecutive shifts (spacing).
5. **Fix**: Adjust the solver logic in `scheduler.ts` to improve distribution balance.
