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
    return member.timeOffs.some(timeOff => {
        const start = new Date(timeOff.start);
        const end = new Date(timeOff.end);
        return date >= start && date <= end;
    });
};

export const generateScheduleData = (month: number, year: number, members: Member[]) => {
    const days = getDaysInMonth(month, year);
    const newSchedule: ScheduleSlot[] = [];
    const memberSlots: Record<number, { total: number; weekday: number; weekend: number }> = {};
    const memberWeekendSlots: Record<number, number> = {};
    const lastShiftDate: Record<number, Date | null> = {};
    const weekdayAssignments: Record<number, Set<number>> = {}; // Track which weekday each member was assigned (0=Sun, 1=Mon, etc)

    members.forEach(m => {
        memberSlots[m.id] = { total: 0, weekday: 0, weekend: 0 };
        memberWeekendSlots[m.id] = 0;
        lastShiftDate[m.id] = null;
        weekdayAssignments[m.id] = new Set<number>();
    });

    // Calculate total available days for each member
    const availableDays: Record<number, number> = {};
    members.forEach(m => {
        let count = 0;
        for (let d = 1; d <= days; d++) {
            const date = new Date(year, month, d);
            if (!isOnTimeOff(m, date)) {
                if (m.weekendOnly) {
                    if (isWeekend(date)) count++;
                } else {
                    count++;
                }
            }
        }
        availableDays[m.id] = count;
    });

    // Calculate minimum days between shifts
    const countAvailableMembers = () => {
        return members.filter(m => !m.weekendOnly).length;
    };
    const minDaysBetweenShifts = Math.floor(countAvailableMembers() / 2);

    // Assign shifts
    for (let d = 1; d <= days; d++) {
        const date = new Date(year, month, d);
        const isWeekendDay = isWeekend(date);
        const currentWeekday = date.getDay();

        // Filter available members
        let available = members.filter(m => {
            if (isOnTimeOff(m, date)) return false;
            if (m.weekendOnly && !isWeekendDay) return false;
            if (m.maxWeekendSlots && isWeekendDay && memberWeekendSlots[m.id] >= m.maxWeekendSlots) return false;

            // Check allowed weekdays constraint
            if (m.allowedWeekdays.length > 0 && !m.allowedWeekdays.includes(currentWeekday)) {
                return false;
            }

            // Only check minimum days between shifts if no specific weekday constraint
            const lastShift = lastShiftDate[m.id];
            if (m.allowedWeekdays.length === 0 && lastShift !== null) {
                const daysSinceLastShift = Math.floor((date.getTime() - lastShift.getTime()) / (1000 * 60 * 60 * 24));
                if (daysSinceLastShift < minDaysBetweenShifts) return false;
            }

            // Check same weekday in different weeks constraint
            if (m.allowedWeekdays.length === 0 && weekdayAssignments[m.id].has(currentWeekday)) {
                const prevAssignments = newSchedule.filter(s => s.member && s.member.id === m.id);
                const sameWeekdayPrev = prevAssignments.filter(s => s.date.getDay() === currentWeekday);
                if (sameWeekdayPrev.length > 0) {
                    const lastSameWeekday = sameWeekdayPrev[sameWeekdayPrev.length - 1]!.date;
                    const weeksDiff = Math.floor((date.getTime() - lastSameWeekday.getTime()) / (1000 * 60 * 60 * 24 * 7));
                    if (weeksDiff < 2) return false;
                }
            }

            return true;
        });

        if (available.length === 0) {
            // If no one is available due to constraints, relax constraints gradually
            available = members.filter(m => {
                if (isOnTimeOff(m, date)) return false;
                if (m.weekendOnly && !isWeekendDay) return false;
                if (m.maxWeekendSlots && isWeekendDay && memberWeekendSlots[m.id] >= m.maxWeekendSlots) return false;

                // Still respect allowed weekdays if specified
                if (m.allowedWeekdays.length > 0 && !m.allowedWeekdays.includes(currentWeekday)) {
                    return false;
                }

                // Relax minimum days constraint
                const lastShift = lastShiftDate[m.id];
                if (m.allowedWeekdays.length === 0 && lastShift !== null) {
                    const daysSinceLastShift = Math.floor((date.getTime() - lastShift.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysSinceLastShift < minDaysBetweenShifts) return false;
                }

                return true;
            });
        }

        if (available.length === 0) {
            newSchedule.push({ date, member: null });
            continue;
        }

        // Shuffle available members to randomize tie-breaking
        for (let i = available.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [available[i], available[j]] = [available[j], available[i]];
        }

        // Sort by current workload (least loaded first)
        available.sort((a, b) => {
            const ratioA = availableDays[a.id] > 0 ? memberSlots[a.id]!.total / availableDays[a.id] : 0;
            const ratioB = availableDays[b.id] > 0 ? memberSlots[b.id]!.total / availableDays[b.id] : 0;
            return ratioA - ratioB;
        });

        const selected = available[0];
        newSchedule.push({ date, member: selected });

        memberSlots[selected.id].total++;
        if (isWeekendDay) {
            memberSlots[selected.id].weekend++;
            memberWeekendSlots[selected.id]++;
        } else {
            memberSlots[selected.id].weekday++;
        }

        lastShiftDate[selected.id] = date;
        weekdayAssignments[selected.id].add(currentWeekday);
    }

    return { schedule: newSchedule, stats: memberSlots };
};
