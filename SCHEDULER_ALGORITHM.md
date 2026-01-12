# Scheduler Algorithm: Weekends First Multi-Pass

The On-Call Scheduler uses a specialized multi-pass algorithm designed to prioritize weekend coverage, respect individual constraints, and ensure fair distribution of shifts.

## Core Philosophy

1.  **Weekends are Critical**: Weekend shifts are the hardest to fill and have the most constraints (weekend-only members, max caps). Therefore, they are assigned *first* to ensure optimal resource usage.
2.  **Fairness**: The algorithm constantly re-balances so that the person with the fewest shifts gets priority for the next available slot.
3.  **Human-Centric Constraints**: We strictly avoid assigning the same person to consecutive days (e.g., Saturday AND Sunday) unless absolutely necessary, to prevent burnout.

## The Algorithm

The generation process happens in two distinct passes:

### Pass 1: The Weekend Pass
We iterate through all **Weekend** dates (Saturdays and Sundays) first.

1.  **Identify Candidates**:
    *   Filter out members on **Time Off**.
    *   Filter out members who have reached their `Max Weekend Slots`.
    *   Filter out members who are restricted from working on specific days of the week.
    *   **Constraint Check**: Check if the member worked **Yesterday** or is assigned to work **Tomorrow**. reliable spacing ensures no one works "Sat + Sun" back-to-back.

2.    *   **Prioritization**:
        *   **Priority 1**: **"Weekend Only" Members**. We attempt to fill the slot with a member who *only* works weekends.
        *   **Priority 2**: **All Other Members**.

    *   **Selection**:
        *   From the prioritized group, candidates are sorted by:
            1.  **Weekly Load**: Those with fewer shifts in the *current week* are preferred.
            2.  **Total Load**: Those with fewer shifts *total* are preferred.

### Pass 2: The Weekday Pass
After all weekends are filled, we iterate through the remaining **Weekday** dates (Mon-Fri).

1.  **Identify Candidates**:
    *   Exclude "Weekend Only" members.
    *   Filter out members on **Time Off**.
    *   Filter out members restricted from specific weekdays.
    *   **Constraint Check**: Check if the member worked **Yesterday** or is assigned to work **Tomorrow**.
        *   *Note*: Since weekends are already filled, checking "Tomorrow" on a Friday correctly sees that Saturday is busy, preventing a "Fri + Sat" consecutive run.

2.  **Selection**:
    *   Sort valid candidates by:
        1.  **Weekly Load**: Prefer members who haven't worked much this week.
        2.  **Total Load**: Prefer members with lower total shifts.

## Constraints & Rules

| Constraint | Description |
| :--- | :--- |
| **Weekend Only** | Members marked as "Weekend Only" are *only* considered during the Weekend Pass. |
| **Max Weekend Slots** | Hard cap on how many weekend shifts a "Weekend Only" member can take. |
| **Time Off** | Members are completely unavailable during their time off ranges. |
| **Consecutive Days** | The scheduler actively prevents assigning shifts on `Date` if the member works on `Date-1` or `Date+1`. |
| **Weekly Spread** | The algorithm attempts to distribute shifts evenly across weeks, preventing a member from clustering all their shifts in a single week. |
| **Fairness** | Tie-breaking always favors the member with the least total workload so far. |
