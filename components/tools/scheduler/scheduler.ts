export interface TimeOff {
  start: string | Date;
  end: string | Date;
}

export interface Member {
  id: number;
  name: string;
  timeOffs: TimeOff[];
  weekendOnly: boolean;
  maxWeekendSlots: number | null;
  allowedWeekdays: number[];
}

export interface ScheduleSlot {
  date: Date;
  member: Member | null;
}

export const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();

export const isWeekend = (date: Date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const isOnTimeOff = (member: Member, date: Date) => {
  return member.timeOffs.some((timeOff) => {
    const start = new Date(timeOff.start);
    const end = new Date(timeOff.end);
    return date >= start && date <= end;
  });
};

// Helper to get a simple week index for distribution (0-52)
// We use ISO-like logic (Mon start) or simple division?
// Simple aligned week number for the year is sufficient to group "current week".
const getWeekNumber = (d: Date) => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

export const generateScheduleData = (month: number, year: number, members: Member[]) => {
  const daysInMonth = getDaysInMonth(month, year);
  const newSchedule: ScheduleSlot[] = [];
  const memberSlots: Record<number, { total: number; weekday: number; weekend: number }> = {};
  const memberWeekendSlots: Record<number, number> = {};

  members.forEach((m) => {
    memberSlots[m.id] = { total: 0, weekday: 0, weekend: 0 };
    memberWeekendSlots[m.id] = 0;
  });

  const dates: Date[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    dates.push(new Date(year, month, d));
  }

  const weekendDates = dates.filter((d) => isWeekend(d));
  const weekdayDates = dates.filter((d) => !isWeekend(d));

  // Helper to check if a member is assigned on a specific date
  const isAssignedOnDate = (memberId: number, dateToCheck: Date) => {
    return newSchedule.some(
      (s) =>
        s.member?.id === memberId &&
        s.date.getDate() === dateToCheck.getDate() &&
        s.date.getMonth() === dateToCheck.getMonth() &&
        s.date.getFullYear() === dateToCheck.getFullYear()
    );
  };

  // Helper to count shifts in the specific week of the target date
  const getShiftsInTargetWeek = (memberId: number, targetDate: Date) => {
    const targetWeek = getWeekNumber(targetDate);
    return newSchedule.filter((s) => s.member?.id === memberId && getWeekNumber(s.date) === targetWeek).length;
  };

  // Helper to select best candidate from a list
  const selectCandidate = (candidates: Member[], date: Date, isWeekendSlot: boolean) => {
    if (candidates.length === 0) return null;

    // Shuffle for random tie-breaking
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    // Sort by:
    // 1. Shifts in CURRENT WEEK (Spread across weeks) - Lowest first
    // 2. Total Shifts (Fairness) - Lowest first
    candidates.sort((a, b) => {
      const weekLoadA = getShiftsInTargetWeek(a.id, date);
      const weekLoadB = getShiftsInTargetWeek(b.id, date);

      if (weekLoadA !== weekLoadB) {
        return weekLoadA - weekLoadB;
      }

      return memberSlots[a.id].total - memberSlots[b.id].total;
    });

    return candidates[0];
  };

  // --- PASS 1: ASSIGN WEEKENDS ---
  for (const date of weekendDates) {
    const currentWeekday = date.getDay();
    const prevDate = new Date(date);
    prevDate.setDate(date.getDate() - 1);
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    // Filter valid candidates
    const validCandidates = members.filter((m) => {
      if (isOnTimeOff(m, date)) return false;
      if (m.maxWeekendSlots && memberWeekendSlots[m.id] >= m.maxWeekendSlots) return false;
      if (m.allowedWeekdays.length > 0 && !m.allowedWeekdays.includes(currentWeekday)) return false;

      // Spacing check: Check yesterday and tomorrow
      // Note: In weekend pass, tomorrow is not filled yet (if we go chronological).
      // BUT: If we fill Sat, then Sun checks Sat.
      // Sat checks Fri (which is empty in this pass).
      if (isAssignedOnDate(m.id, prevDate)) return false;
      // We generally don't check tomorrow in chronological pass, but if we did random order we would need to.
      // Following chronological order Sat -> Sun safe to just check prevDate?
      // Yes, for preventing "Sat+Sun".

      return true;
    });

    // Split into Priority groups
    const weekendOnlyCandidates = validCandidates.filter((m) => m.weekendOnly);
    const otherCandidates = validCandidates.filter((m) => !m.weekendOnly);

    let selected: Member | null = null;

    // Try filling with Weekend Only members first
    // But only if we have them.
    if (weekendOnlyCandidates.length > 0) {
      selected = selectCandidate(weekendOnlyCandidates, date, true);
    }

    // If no weekend member found (or we want to balance), try others?
    // User wants: "chosen to have a weekeds only shoudl be prioritixed first... and then distribute among other members"
    // So strict priority seems correct. Only fall back if NO weekenders available.
    if (!selected && otherCandidates.length > 0) {
      selected = selectCandidate(otherCandidates, date, true);
    }

    // Emergency Fallback: If strict 1-day spacing makes it impossible, relax it?
    if (!selected) {
      // Try again without spacing check?
      const relaxedCandidates = members.filter((m) => {
        if (isOnTimeOff(m, date)) return false;
        if (m.maxWeekendSlots && memberWeekendSlots[m.id] >= m.maxWeekendSlots) return false;
        if (m.allowedWeekdays.length > 0 && !m.allowedWeekdays.includes(currentWeekday)) return false;
        // Omit spacing check
        return true;
      });
      // Still prioritize weekenders?
      const relaxWeekenders = relaxedCandidates.filter((m) => m.weekendOnly);
      const relaxOthers = relaxedCandidates.filter((m) => !m.weekendOnly);

      if (relaxWeekenders.length > 0) selected = selectCandidate(relaxWeekenders, date, true);
      else if (relaxOthers.length > 0) selected = selectCandidate(relaxOthers, date, true);
    }

    newSchedule.push({ date, member: selected });

    if (selected) {
      memberSlots[selected.id].total++;
      memberSlots[selected.id].weekend++;
      memberWeekendSlots[selected.id]++;
    }
  }

  // --- PASS 2: ASSIGN WEEKDAYS ---
  for (const date of weekdayDates) {
    const currentWeekday = date.getDay();
    const prevDate = new Date(date);
    prevDate.setDate(date.getDate() - 1);
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    const validCandidates = members.filter((m) => {
      if (m.weekendOnly) return false; // Weekdays are not for weekend-only members
      if (isOnTimeOff(m, date)) return false;
      if (m.allowedWeekdays.length > 0 && !m.allowedWeekdays.includes(currentWeekday)) return false;

      // Spacing check
      // Must check Prev (yesterday) AND Next (tomorrow)
      // Because weekends are already filled!
      // Example: Fri. Next is Sat (filled).
      // Example: Mon. Prev is Sun (filled).
      if (isAssignedOnDate(m.id, prevDate)) return false;
      if (isAssignedOnDate(m.id, nextDate)) return false;

      return true;
    });

    let selected = selectCandidate(validCandidates, date, false);

    // Emergency fallback? Relax spacing?
    if (!selected) {
      const relaxedCandidates = members.filter((m) => {
        if (m.weekendOnly) return false;
        if (isOnTimeOff(m, date)) return false;
        if (m.allowedWeekdays.length > 0 && !m.allowedWeekdays.includes(currentWeekday)) return false;
        // Relax spacing
        return true;
      });
      selected = selectCandidate(relaxedCandidates, date, false);
    }

    newSchedule.push({ date, member: selected || null });

    if (selected) {
      memberSlots[selected.id].total++;
      memberSlots[selected.id].weekday++;
    }
  }

  // Sort combined schedule by date
  newSchedule.sort((a, b) => a.date.getTime() - b.date.getTime());

  return { schedule: newSchedule, stats: memberSlots };
};
