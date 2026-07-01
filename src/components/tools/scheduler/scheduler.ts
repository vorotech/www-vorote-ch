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

export const MEMBER_COLORS = [
  {
    bg: 'bg-[#1e66f5]/10 dark:bg-[#8caaee]/10',
    text: 'text-[#1e66f5] dark:text-[#8caaee]',
    border: 'border-[#1e66f5]/50 dark:border-[#8caaee]/50',
    ring: 'focus:ring-[#1e66f5] dark:focus:ring-[#8caaee]',
  }, // Blue
  {
    bg: 'bg-[#40a02b]/10 dark:bg-[#a6d189]/10',
    text: 'text-[#40a02b] dark:text-[#a6d189]',
    border: 'border-[#40a02b]/50 dark:border-[#a6d189]/50',
    ring: 'focus:ring-[#40a02b] dark:focus:ring-[#a6d189]',
  }, // Green
  {
    bg: 'bg-[#8839ef]/10 dark:bg-[#ca9ee6]/10',
    text: 'text-[#8839ef] dark:text-[#ca9ee6]',
    border: 'border-[#8839ef]/50 dark:border-[#ca9ee6]/50',
    ring: 'focus:ring-[#8839ef] dark:focus:ring-[#ca9ee6]',
  }, // Mauve
  {
    bg: 'bg-[#04a5e5]/10 dark:bg-[#99d1db]/10',
    text: 'text-[#04a5e5] dark:text-[#99d1db]',
    border: 'border-[#04a5e5]/50 dark:border-[#99d1db]/50',
    ring: 'focus:ring-[#04a5e5] dark:focus:ring-[#99d1db]',
  }, // Sky
  {
    bg: 'bg-[#ea76cb]/10 dark:bg-[#f4b8e4]/10',
    text: 'text-[#ea76cb] dark:text-[#f4b8e4]',
    border: 'border-[#ea76cb]/50 dark:border-[#f4b8e4]/50',
    ring: 'focus:ring-[#ea76cb] dark:focus:ring-[#f4b8e4]',
  }, // Pink
  {
    bg: 'bg-[#df8e1d]/10 dark:bg-[#e5c890]/10',
    text: 'text-[#df8e1d] dark:text-[#e5c890]',
    border: 'border-[#df8e1d]/50 dark:border-[#e5c890]/50',
    ring: 'focus:ring-[#df8e1d] dark:focus:ring-[#e5c890]',
  }, // Yellow
  {
    bg: 'bg-[#179299]/10 dark:bg-[#81c8be]/10',
    text: 'text-[#179299] dark:text-[#81c8be]',
    border: 'border-[#179299]/50 dark:border-[#81c8be]/50',
    ring: 'focus:ring-[#179299] dark:focus:ring-[#81c8be]',
  }, // Teal
  {
    bg: 'bg-[#fe640b]/10 dark:bg-[#ef9f76]/10',
    text: 'text-[#fe640b] dark:text-[#ef9f76]',
    border: 'border-[#fe640b]/50 dark:border-[#ef9f76]/50',
    ring: 'focus:ring-[#fe640b] dark:focus:ring-[#ef9f76]',
  }, // Peach
  {
    bg: 'bg-[#7287fd]/10 dark:bg-[#babbf1]/10',
    text: 'text-[#7287fd] dark:text-[#babbf1]',
    border: 'border-[#7287fd]/50 dark:border-[#babbf1]/50',
    ring: 'focus:ring-[#7287fd] dark:focus:ring-[#babbf1]',
  }, // Lavender
  {
    bg: 'bg-[#dd7878]/10 dark:bg-[#eebebe]/10',
    text: 'text-[#dd7878] dark:text-[#eebebe]',
    border: 'border-[#dd7878]/50 dark:border-[#eebebe]/50',
    ring: 'focus:ring-[#dd7878] dark:focus:ring-[#eebebe]',
  }, // Flamingo
];

export const getMemberColor = (id: number) => MEMBER_COLORS[(id - 1) % MEMBER_COLORS.length];

// ==========================================
// 1. HELPER FUNCTIONS
// ==========================================

export const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();

function shuffle<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Deterministic pseudo-random swap
    const j = Math.floor(Math.abs(Math.sin(seed + i * 1.5) * 10000)) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRotationScore(memberIndex: number, dayIndex: number, totalMembers: number) {
  // Add a small shift every week to prevent same-day-of-week locking (especially for teams of 7)
  const weekShift = Math.floor((dayIndex - 1) / 7);
  const idealIndex = (dayIndex - 1 + weekShift) % totalMembers;
  
  // Circular distance: how far is this member from their "ideal" turn?
  const dist = Math.min(
    Math.abs(memberIndex - idealIndex),
    totalMembers - Math.abs(memberIndex - idealIndex)
  );
  // Higher score for members closer to their turn (max score if it is their turn)
  return totalMembers - dist;
}

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

function solveWithOpts(solverParams: any, opts: SolverOptions, seed: number = 0, temperature: number = 0.1) {
  const { members: untypedMembers, totalDays, blockedSet, periodStart } = solverParams;
  const members = untypedMembers as Member[];

  const model: any = {
    optimize: 'rotation',
    opType: 'max',
    constraints: {},
    variables: {},
    ints: {},
  };

  // Rotation setup: Shuffle based on seed to get a sequence
  const shuffledMembers = shuffle(members, seed);
  const memberToIndex = new Map(shuffledMembers.map((m, i) => [m.id, i]));

  // Day coverage constraints (Always required)
  for (let d = 1; d <= totalDays; d++) {
    model.constraints[`day_${d}_covered`] = { equal: 1 };
  }

  const memberIds = members.map((m: Member) => m.id);
  const availabilityMap = getAvailabilityMap(totalDays, members, blockedSet);

  // First pass: Calculate caps (availability + maxWeekendSlots) AND Presence (days NOT on time-off)
  const memberCaps: Record<number, number> = {};
  const memberAvailability: Record<number, number> = {};
  const memberPresence: Record<number, number> = {};
  
  members.forEach((member: Member) => {
    let availableWeekdays = 0;
    let availableWeekends = 0;
    let presenceInMonth = 0;

    for (let d = 1; d <= totalDays; d++) {
      const currentDate = addDays(periodStart, d - 1);
      
      // Presence: Are you available for the rotation at all (NOT on time off)?
      if (!isOnTimeOff(member, currentDate)) {
        presenceInMonth++;
      }

      // Available: Are you technically allowed to work this specific day (NOT on time off AND matches role)?
      if (!blockedSet.has(`${member.id}_${d}`)) {
        if (isWeekend(currentDate)) {
          availableWeekends++;
        } else {
          availableWeekdays++;
        }
      }
    }
    
    // Correctly calculate cap: weekdays + restricted weekends
    let cap = availableWeekdays + availableWeekends;
    if (member.maxWeekendSlots !== null && member.maxWeekendSlots !== undefined) {
      cap = availableWeekdays + Math.min(availableWeekends, member.maxWeekendSlots);
    }
    
    memberCaps[member.id] = cap;
    memberAvailability[member.id] = availableWeekdays + availableWeekends;
    memberPresence[member.id] = presenceInMonth;
  });

  // Calculate fair distribution targets based on proportional presence
  // Goal: Share is proportional to presence (days NOT on time-off)
  // Step 1: Calculate raw proportional targets and handle hard caps (availability/maxWeekend)
  const memberTargets: Record<number, { min: number; max: number }> = {};
  const rawShares: Record<number, number> = {};
  
  const totalPresence = Object.values(memberPresence).reduce((sum, val) => sum + val, 0);

  if (totalPresence > 0) {
    // Pass 1: Initial targets
    members.forEach(m => {
      rawShares[m.id] = (memberPresence[m.id] / totalPresence) * totalDays;
    });

    // Pass 2: Iterative redistribution for members whose share exceeds their cap
    let redistributedDays = totalDays;
    let poolPresence = totalPresence;
    const finalized = new Set<number>();
    const finalTargets: Record<number, number> = {};

    // Sort by cap ascending to handle most constrained members first
    const sortedByCap = [...members].sort((a, b) => memberCaps[a.id] - memberCaps[b.id]);

    for (let i = 0; i < members.length; i++) {
      let changed = false;
      for (const m of sortedByCap) {
        if (finalized.has(m.id)) continue;
        
        const idealShare = (memberPresence[m.id] / poolPresence) * redistributedDays;
        if (idealShare > memberCaps[m.id]) {
          // Cap reached, finalize this member and redistribute their "lost" presence
          finalTargets[m.id] = memberCaps[m.id];
          redistributedDays -= memberCaps[m.id];
          poolPresence -= memberPresence[m.id];
          finalized.add(m.id);
          changed = true;
          break; // Recalculate for others
        }
      }
      if (!changed) break;
    }

    // Final pass for remaining members
    members.forEach(m => {
      if (!finalized.has(m.id)) {
        finalTargets[m.id] = poolPresence > 0 
          ? (memberPresence[m.id] / poolPresence) * redistributedDays
          : 0;
      }
    });

    // Step 2: Set strict min/max constraints (floor/ceil of finalTargets)
    // We add a tiny bit of seed-based noise to the "floor" and "ceil" decisions
    // to allow the +/- 1 shift to vary on reroll, but NEVER exceed 1 shift away from ideal.
    members.forEach(m => {
      const target = finalTargets[m.id];
      
      // If target is 4.0, we want exactly 4. 
      // If target is 4.16, we allow 4 or 5.
      memberTargets[m.id] = {
        min: Math.floor(target),
        max: Math.ceil(target)
      };
      
      // Failsafe: Ensure min/max never exceeds individual cap
      memberTargets[m.id].max = Math.min(memberTargets[m.id].max, memberCaps[m.id]);
      memberTargets[m.id].min = Math.min(memberTargets[m.id].min, memberTargets[m.id].max);
    });
  } else {
    // Fallback for safety (should not happen if solver is called with valid data)
    members.forEach(m => { memberTargets[m.id] = { min: 0, max: totalDays }; });
  }

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

      // Rotation Weighting blended with Temperature
      const mIndex = memberToIndex.get(member.id) ?? 0;
      const rotScore = getRotationScore(mIndex, d, members.length);
      const randomScore = Math.abs(Math.sin(seed + member.id * 13 + d * 37)) * members.length;
      
      const combinedScore = (1 - temperature) * rotScore + temperature * randomScore;

      model.variables[varName] = {
        [`day_${d}_covered`]: 1,
        // Preference for the member whose turn it is, influenced by randomness (temperature)
        rotation: combinedScore,
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

function solveSchedule(solverParams: any, seed: number = 0, temperature: number = 0.1): SolverResult {
  // Strategy: Prioritize fairness (everyone gets their redistributed target) AND weekly distribution
  // Try with weekly distribution constraints first, then relax if needed

  // 1. Ideal: Strict Fairness + Relaxed Spacing (0.75) + Weekly Distribution
  // Spacing 0.75 allows switching between tracks (e.g. Sat -> next week Sun)
  let result: SolverResult = solveWithOpts(solverParams, { strictFairness: true, spacingStrength: 0.75, enforceWeeklyDistribution: true }, seed, temperature);
  if (result.feasible) return result;

  // 2. Strict Fairness + Moderate Spacing (0.5) + Weekly Distribution
  result = solveWithOpts(solverParams, { strictFairness: true, spacingStrength: 0.5, enforceWeeklyDistribution: true }, seed, temperature);
  if (result.feasible) return result;

  // 3. Strict Fairness + Low Spacing (0.25) + Weekly Distribution
  result = solveWithOpts(solverParams, { strictFairness: true, spacingStrength: 0.25, enforceWeeklyDistribution: true }, seed, temperature);
  if (result.feasible) return result;

  // 4. Strict Fairness + No Spacing (0.0) + Weekly Distribution
  result = solveWithOpts(solverParams, { strictFairness: true, spacingStrength: 0.0, enforceWeeklyDistribution: true }, seed, temperature);
  if (result.feasible) return result;

  // 5. Relax weekly distribution, keep strict fairness
  result = solveWithOpts(solverParams, { strictFairness: true, spacingStrength: 0.0, enforceWeeklyDistribution: false }, seed, temperature);
  if (result.feasible) return result;

  // 6. Fallback: Relaxed Fairness + Moderate Spacing (0.5)
  result = solveWithOpts(solverParams, { strictFairness: false, spacingStrength: 0.5, enforceWeeklyDistribution: false }, seed, temperature);
  if (result.feasible) return result;

  // 7. Fallback: Relaxed Fairness + No Spacing (0.0)
  result = solveWithOpts(solverParams, { strictFairness: false, spacingStrength: 0.0, enforceWeeklyDistribution: false }, seed, temperature);
  if (result.feasible) return result;

  // 8. Absolute Fallback: No Fairness Caps + No Spacing (Just Cover Days)
  // This is the "Nuclear Option" to ensure output is generated even for very skewed/tight inputs
  return solveWithOpts(solverParams, { strictFairness: false, spacingStrength: 0.0, enforceWeeklyDistribution: false, disableFairnessMax: true }, seed, temperature);
}

export const calculateStats = (schedule: ScheduleSlot[], members: Member[]) => {
  const memberSlots: Record<number, { total: number; weekday: number; weekend: number }> = {};

  // Initialize stats
  members.forEach((m) => {
    memberSlots[m.id] = { total: 0, weekday: 0, weekend: 0 };
  });

  schedule.forEach((slot) => {
    if (slot.member && memberSlots[slot.member.id]) {
      memberSlots[slot.member.id].total++;
      if (isWeekend(slot.date)) {
        memberSlots[slot.member.id].weekend++;
      } else {
        memberSlots[slot.member.id].weekday++;
      }
    }
  });

  return memberSlots;
};

// ==========================================
// 4. GENERATOR (Main Entry Point)
// ==========================================

export const generateScheduleData = (month: number, year: number, members: Member[], shiftStartHour: number = 8, seed: number = 0, temperature: number = 0.1) => {
  const solverParams = adaptDomainToSolver(month, year, members, shiftStartHour);
  const result: SolverResult = solveSchedule(solverParams, seed, temperature);

  const schedule: ScheduleSlot[] = [];
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

  const stats = calculateStats(fullSchedule, members);

  return { schedule: fullSchedule, stats };
};
