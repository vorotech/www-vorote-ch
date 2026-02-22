// @ts-ignore
import solver from 'javascript-lp-solver';

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

// ==========================================
// 1. HELPER FUNCTIONS
// ==========================================

export const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();

export const isWeekend = (date: Date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const isOnTimeOff = (member: Member, date: Date) => {
  return member.timeOffs.some((timeOff) => {
    const start = new Date(timeOff.start);
    const end = new Date(timeOff.end);
    // Normalize to midnight for accurate day comparison
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    const e = new Date(end);
    e.setHours(0, 0, 0, 0);
    return d >= s && d <= e;
  });
};

const parseDate = (dateStr: string | Date, shiftStartHour: number = 8) => {
  const d = new Date(dateStr);
  d.setHours(shiftStartHour, 0, 0, 0);
  return d;
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// ==========================================
// 2. ADAPTER (Domain -> Solver Model)
// ==========================================

function adaptDomainToSolver(month: number, year: number, members: Member[], shiftStartHour: number = 8) {
  const periodStart = new Date(year, month, 1);
  const periodEnd = new Date(year, month + 1, 0); // Last day of month

  // Normalize times to shift start hour
  periodStart.setHours(shiftStartHour, 0, 0, 0);
  periodEnd.setHours(shiftStartHour, 0, 0, 0);

  const diffTime = Math.abs(periodEnd.getTime() - periodStart.getTime());
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const blockedSet = new Set<string>();

  members.forEach((member) => {
    // 1. TimeOffs
    if (member.timeOffs && member.timeOffs.length > 0) {
      member.timeOffs.forEach((range) => {
        const rangeStart = parseDate(range.start, shiftStartHour);
        const rangeEnd = parseDate(range.end, shiftStartHour);

        const currentDate = new Date(rangeStart);
        while (currentDate <= rangeEnd) {
          if (currentDate >= periodStart && currentDate <= periodEnd) {
            const diff = Math.ceil((currentDate.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            blockedSet.add(`${member.id}_${diff}`);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
    }

    // 2. WeekendOnly & AllowedWeekdays logic
    for (let d = 1; d <= totalDays; d++) {
      const currentDate = addDays(periodStart, d - 1); // d is 1-based
      const dayOfWeek = currentDate.getDay(); // 0 is Sunday

      // If member is weekendOnly, block weekdays
      if (member.weekendOnly) {
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          blockedSet.add(`${member.id}_${d}`);
        }
      }

      // If member has specific allowedWeekdays, block others
      if (member.allowedWeekdays && member.allowedWeekdays.length > 0) {
        if (!member.allowedWeekdays.includes(dayOfWeek)) {
          blockedSet.add(`${member.id}_${d}`);
        }
      }
    }
  });

  return {
    members,
    totalDays,
    blockedSet,
    periodStart,
  };
}

// ==========================================
// 3. SOLVER LOGIC
// ==========================================

// Helper to get number of available people for each day
function getAvailabilityMap(totalDays: number, members: Member[], blockedSet: Set<string>) {
  const availabilityMap: Record<number, number> = {};
  for (let d = 1; d <= totalDays; d++) {
    let count = 0;
    members.forEach((m) => {
      if (!blockedSet.has(`${m.id}_${d}`)) {
        count++;
      }
    });
    availabilityMap[d] = count;
  }
  return availabilityMap;
}

interface SolverResult {
  feasible: boolean;
  [key: string]: any;
}

interface SolverOptions {
  strictFairness: boolean; // If true, enforcing Min/Max = floor/ceil(avg)
  spacingStrength: number; // 1.0 = (Available - 1), 0.0 = 1 (No consec). 0.5 = Half gap.
  enforceWeeklyDistribution: boolean; // If true, limit shifts per week for better spread
  disableFairnessMax?: boolean; // If true, ignores fairness max caps (failsafe for unbalanced availability)
}

function solveWithOpts(solverParams: any, opts: SolverOptions) {
  const { members: untypedMembers, totalDays, blockedSet, periodStart } = solverParams;
  const members = untypedMembers as Member[];

  const model: any = {
    optimize: 'fairness',
    opType: 'max',
    constraints: {},
    variables: {},
    ints: {},
  };

  // Day coverage constraints (Always required)
  for (let d = 1; d <= totalDays; d++) {
    model.constraints[`day_${d}_covered`] = { equal: 1 };
  }

  const memberIds = members.map((m: Member) => m.id);
  const availabilityMap = getAvailabilityMap(totalDays, members, blockedSet);

  // Calculate per-member available days for fairer distribution
  const memberAvailability: Record<number, number> = {};
  members.forEach((member: Member) => {
    let availableDays = 0;
    for (let d = 1; d <= totalDays; d++) {
      if (!blockedSet.has(`${member.id}_${d}`)) {
        availableDays++;
      }
    }
    memberAvailability[member.id] = availableDays;
  });

  // Calculate fair distribution with constraint redistribution
  // Goal: Everyone gets the same number of shifts, but if someone can't due to constraints,
  // redistribute their shortfall to others
  const memberTargets: Record<number, { min: number; max: number }> = {};
  let remainingDays = totalDays;
  let remainingMembers = members.length;

  // First pass: Calculate caps (availability + maxWeekendSlots)
  const memberCaps: Record<number, number> = {};
  members.forEach((member: Member) => {
    let cap = memberAvailability[member.id];
    // maxWeekendSlots is a hard cap for weekend-only members
    if (member.maxWeekendSlots) {
      cap = Math.min(cap, member.maxWeekendSlots);
    }
    memberCaps[member.id] = cap;
  });

  // Iteratively redistribute: give everyone equal shifts, but respect caps
  // Process members with lowest caps first to redistribute their shortfall
  const sorted = [...members].sort((a, b) => memberCaps[a.id] - memberCaps[b.id]);

  sorted.forEach((member) => {
    const idealShare = remainingDays / Math.max(1, remainingMembers);
    const cap = memberCaps[member.id];
    const allocated = Math.min(Math.ceil(idealShare), cap);

    memberTargets[member.id] = {
      min: Math.floor(Math.min(idealShare, cap)),
      max: allocated,
    };

    remainingDays -= allocated;
    remainingMembers -= 1;
  });

  // Dynamic Spacing Constraints
  members.forEach((member: Member) => {
    for (let d = 1; d <= totalDays; d++) {
      const availableCount = availabilityMap[d] || 0;

      const maxGap = Math.max(0, availableCount - 1);

      // Interpolate gap: floor(maxGap * strength)
      let targetGap = Math.floor(maxGap * opts.spacingStrength);

      // Enforce minimum gap of 1 (no consecutive) unless we strictly want 0
      // Fix: Only enforce if spacingStrength is significantly non-zero
      if (opts.spacingStrength > 0.01 && maxGap >= 1 && targetGap < 1) targetGap = 1;

      if (targetGap > 0) {
        model.constraints[`spacing_${member.id}_${d}`] = { max: 1 };
      }
    }

    // Weekend Max (Always a hard cap if set)
    if (member.maxWeekendSlots) {
      model.constraints[`member_${member.id}_weekend_max`] = { max: member.maxWeekendSlots };
    }

    // Fairness Constraints - use calculated targets from redistribution
    const targets = memberTargets[member.id];

    // Apply fairness constraints
    if (opts.strictFairness) {
      if (targets.max > 0) {
        model.constraints[`member_${member.id}_max`] = { max: targets.max };
      }
      if (targets.min > 0 && memberAvailability[member.id] >= targets.min) {
        model.constraints[`member_${member.id}_min`] = { min: targets.min };
      }
    } else if (!opts.disableFairnessMax) {
      // Relaxed: Add buffer to max, but still respect hard caps
      // Increased buffer from 2 to 5 to handle unbalanced availability (e.g. weekdays vs weekends)
      const relaxedMax = Math.min(targets.max + 5, memberCaps[member.id]);
      if (relaxedMax > 0) {
        model.constraints[`member_${member.id}_max`] = { max: relaxedMax };
      }
    }
    // If disableFairnessMax is true, we impose NO specific max constraint
    // (other than natural availability and maxWeekendSlots)
  });

  // Weekly distribution constraints - prevent clustering in same week
  // Only apply if enforced (loop outside member loop to group variables?)
  // Actually, constraints are per member per week.
  // The logic inside members.forEach is simpler.
  if (opts.enforceWeeklyDistribution) {
    const numWeeks = Math.ceil(totalDays / 7);
    members.forEach((member) => {
      const targets = memberTargets[member.id];
      for (let week = 0; week < numWeeks; week++) {
        // For members with 4+ shifts in a month, limit to max 2 per week
        // This prevents clustering while still allowing flexibility
        if (targets.max >= 4) {
          model.constraints[`member_${member.id}_week_${week}_max`] = { max: 2 };
        } else if (targets.max >= 2) {
          // For members with 2-3 shifts, limit to max 1 per week
          model.constraints[`member_${member.id}_week_${week}_max`] = { max: 1 };
        }
      }
    });
  }

  // Variables
  members.forEach((member: Member) => {
    for (let d = 1; d <= totalDays; d++) {
      if (blockedSet.has(`${member.id}_${d}`)) {
        continue;
      }

      const varName = `${member.id}|${d}`;
      const currentDate = addDays(periodStart, d - 1);
      const isWknd = isWeekend(currentDate);

      model.variables[varName] = {
        [`day_${d}_covered`]: 1,
        fairness: 1 + Math.random() * 0.5,
      };

      // Spacing Contribution
      const lookbackLimit = members.length + 5;
      for (let s = Math.max(1, d - lookbackLimit); s <= d; s++) {
        const availableCountS = availabilityMap[s] || 0;
        const maxGapS = Math.max(0, availableCountS - 1);
        let targetGapS = Math.floor(maxGapS * opts.spacingStrength);

        // Fix: Consistency with constraints
        if (opts.spacingStrength > 0.01 && maxGapS >= 1 && targetGapS < 1) targetGapS = 1;

        if (targetGapS > 0 && s + targetGapS >= d) {
          model.variables[varName][`spacing_${member.id}_${s}`] = 1;
        }
      }

      // Weekly distribution contribution
      const weekNumber = Math.floor((d - 1) / 7);
      const weeklyConstraintName = `member_${member.id}_week_${weekNumber}_max`;
      if (model.constraints[weeklyConstraintName]) {
        model.variables[varName][weeklyConstraintName] = 1;
      }

      if (model.constraints[`member_${member.id}_max`]) {
        model.variables[varName][`member_${member.id}_max`] = 1;
      }
      if (model.constraints[`member_${member.id}_min`]) {
        model.variables[varName][`member_${member.id}_min`] = 1;
      }

      if (isWknd && member.maxWeekendSlots) {
        model.variables[varName][`member_${member.id}_weekend_max`] = 1;
      }

      model.ints[varName] = 1;
    }
  });

  return solver.Solve(model) as SolverResult;
}

function solveSchedule(solverParams: any): SolverResult {
  // Strategy: Prioritize fairness (everyone gets their redistributed target) AND weekly distribution
  // Try with weekly distribution constraints first, then relax if needed

  // 1. Ideal: Strict Fairness + Full Spacing + Weekly Distribution
  let result: SolverResult = solveWithOpts(solverParams, { strictFairness: true, spacingStrength: 1.0, enforceWeeklyDistribution: true });
  if (result.feasible) return result;

  // 2. Strict Fairness + Moderate Spacing + Weekly Distribution
  result = solveWithOpts(solverParams, { strictFairness: true, spacingStrength: 0.66, enforceWeeklyDistribution: true });
  if (result.feasible) return result;

  // 3. Strict Fairness + Low Spacing + Weekly Distribution
  result = solveWithOpts(solverParams, { strictFairness: true, spacingStrength: 0.33, enforceWeeklyDistribution: true });
  if (result.feasible) return result;

  // 4. Strict Fairness + Minimal Spacing + Weekly Distribution
  result = solveWithOpts(solverParams, { strictFairness: true, spacingStrength: 0.0, enforceWeeklyDistribution: true });
  if (result.feasible) return result;

  // 5. Relax weekly distribution, keep strict fairness
  result = solveWithOpts(solverParams, { strictFairness: true, spacingStrength: 0.0, enforceWeeklyDistribution: false });
  if (result.feasible) return result;

  // 6. Fallback: Relaxed Fairness + Full Spacing (no weekly constraints)
  result = solveWithOpts(solverParams, { strictFairness: false, spacingStrength: 1.0, enforceWeeklyDistribution: false });
  if (result.feasible) return result;

  // 7. Fallback: Relaxed Fairness + Moderate Spacing
  result = solveWithOpts(solverParams, { strictFairness: false, spacingStrength: 0.66, enforceWeeklyDistribution: false });
  if (result.feasible) return result;

  // 8. Minimal: Relaxed Fairness + No Consecutive (Wait, strength 0 now allows consecutive if < 0.01)
  result = solveWithOpts(solverParams, { strictFairness: false, spacingStrength: 0.0, enforceWeeklyDistribution: false });
  if (result.feasible) return result;

  // 9. Absolute Fallback: No Fairness Caps + No Spacing (Just Cover Days)
  // This is the "Nuclear Option" to ensure output is generated even for very skewed/tight inputs
  return solveWithOpts(solverParams, { strictFairness: false, spacingStrength: 0.0, enforceWeeklyDistribution: false, disableFairnessMax: true });
}

// ==========================================
// 4. GENERATOR (Main Entry Point)
// ==========================================

export const generateScheduleData = (month: number, year: number, members: Member[], shiftStartHour: number = 8) => {
  const solverParams = adaptDomainToSolver(month, year, members, shiftStartHour);
  const result: SolverResult = solveSchedule(solverParams);

  const schedule: ScheduleSlot[] = [];
  const memberSlots: Record<number, { total: number; weekday: number; weekend: number }> = {};

  // Initialize stats
  members.forEach((m) => {
    memberSlots[m.id] = { total: 0, weekday: 0, weekend: 0 };
  });

  const { totalDays, periodStart } = solverParams;

  // Retrieve results
  if (result.feasible) {
    Object.keys(result).forEach((key) => {
      // Look for keys like "1|15" (MemberID|DayIndex)
      if (key.includes('|') && result[key] > 0.5) {
        const [memberIdStr, dayIndexStr] = key.split('|');
        const memberId = parseInt(memberIdStr, 10);
        const dayIndex = parseInt(dayIndexStr, 10);

        const realDate = addDays(periodStart, dayIndex - 1);
        const member = members.find((m) => m.id === memberId) || null;

        if (member) {
          schedule.push({
            date: realDate,
            member: member,
          });

          if (memberSlots[member.id]) {
            memberSlots[member.id].total++;
            if (isWeekend(realDate)) {
              memberSlots[member.id].weekend++;
            } else {
              memberSlots[member.id].weekday++;
            }
          }
        }
      }
    });
  }

  // Sort schedule by date
  schedule.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Fill in any gaps (if solver failed or partial)
  const scheduleMap = new Map(schedule.map((s) => [s.date.getTime(), s]));
  const fullSchedule: ScheduleSlot[] = [];

  for (let d = 1; d <= totalDays; d++) {
    const date = addDays(periodStart, d - 1);
    const existing = scheduleMap.get(date.getTime());
    if (existing) {
      fullSchedule.push(existing);
    } else {
      fullSchedule.push({ date: date, member: null });
    }
  }

  return { schedule: fullSchedule, stats: memberSlots };
};
