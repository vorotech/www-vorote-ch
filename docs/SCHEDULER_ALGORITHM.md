# Scheduler Algorithm: Constraint-Based Linear Optimization

The On-Call Scheduler uses a constraint programming approach backed by a Linear Programming (LP) solver (`javascript-lp-solver`). This ensures mathematically optimal fairness while strictly adhering to complex availability rules.

## Core Philosophy

Unlike heuristic approaches (like "greedy" or "round-robin" algorithms) which can paint themselves into corners, this solver looks at the entire month holistically.

1.  **Global Optimization**: The schedule is solved all at once, ensuring that assigning a shift on the 1st of the month doesn't make it impossible to fill a shift on the 31st.
2.  **Strict Fairness**: We calculate exactly how many shifts each person *should* get based on their specific availability, and enforce that target mathematically.
3.  **Iterative Relaxation**: If a "perfect" schedule (fair + well-spaced) is mathematically impossible, the system intelligently relaxes specific non-critical constraints (like "perfect spacing") to prioritize coverage and fairness.

## Key Concepts

### 1. Fairness Redistribution
Fairness isn't just `Total Shifts / Total People`. Some members have constraints (e.g., "Weekend Only", "Time Off") that limit their capacity.

The algorithm uses an **Iterative Redistribution** method:
1.  Calculate each member's theoretical "Cap" (days available - days off).
2.  Calculate the "Ideal Share" for the remaining days.
3.  Assign shifts up to the `min(Ideal Share, Cap)`.
4.  If a member is capped below the Ideal Share, their "unassigned" portion is returned to the pool.
5.  Repeat until all days are allocated.

This gives every member a personalized `Target Min` and `Target Max` shift count.

### 2. The Solver Model
The problem is modeled as a Binary Integer Programming (BIP) problem where every variable is `Member_M_Day_D` (1 if assigned, 0 if not).

#### Hard Constraints (Must always be met)
*   **Coverage**: Exactly **one** person must be assigned to every day of the month.
*   **Unavailable**: A member cannot be assigned if they are on **Time Off**.
*   **Weekend Only**: Members marked as "Weekend Only" cannot be assigned to weekdays.
*   **Allowed Weekdays**: If a member has specific allowed days (e.g., "Only Tuesdays"), they cannot be assigned to other days.
*   **Max Weekend Slots**: "Weekend Only" members cannot exceed their specific weekend shift limit.

#### Soft Constraints (Optimized for)
*   **Spacing**: Members should not work consecutive days. The solver attempts to enforce a dynamic gap between shifts (e.g., "shift, gap, gap, shift").
*   **Weekly Distribution**: Members should not have their shifts clustered in a single week. We enforce a "Max Shifts Per Week" limit based on their total load.
*   **Fairness Targets**: The total shifts for a member must fall within their calculated `Target Min` and `Target Max`.

## Solver Strategy: The "Relaxation Waterfall"
Real-world constraints often make a "textbook perfect" schedule impossible. The scheduler uses a fallback strategy, attempting to solve with the strictest rules first, then gradually relaxing "nice-to-have" constraints until a valid schedule is found.

1.  **Tier 1 (Ideal)**: Strict Fairness + Full Spacing + Weekly Distribution limits.
2.  **Tier 2**: Strict Fairness + Moderate Spacing + Weekly Distribution limits.
3.  **Tier 3**: Strict Fairness + Minimal Spacing + Weekly Distribution limits.
4.  **Tier 4**: Strict Fairness + **No** Spacing + Weekly Distribution limits.
5.  **Tier 5**: Strict Fairness + No Spacing + **No** Weekly limits.
6.  **Tier 6+ (Fallback)**: Relaxed Fairness Targets (allow uneven distribution) to ensure coverage.

## Technical Implementation
Located in: `components/tools/scheduler/scheduler.ts`

The implementation transforms the domain objects (`Member`, `TimeOff`) into a standardized solver model, runs the `javascript-lp-solver`, and maps the binary results back into `ScheduleSlot` objects.
