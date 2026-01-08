"use client";
// @ts-nocheck
import React, { useState } from 'react';
import { Calendar, Users, AlertCircle, RefreshCw, Settings } from 'lucide-react';


interface Vacation {
    start: string | Date;
    end: string | Date;
}

interface Engineer {
    id: number;
    name: string;
    vacations: Vacation[];
    weekendOnly: boolean;
    maxWeekendSlots: number | null;
    allowedWeekdays: number[];
}

interface ScheduleSlot {
    date: Date;
    engineer: Engineer | null;
}

const OnCallScheduler = () => {
    const [numEngineers, setNumEngineers] = useState<any>(3);
    const [month, setMonth] = useState<any>(new Date().getMonth());
    const [year, setYear] = useState<any>(new Date().getFullYear());
    const [schedule, setSchedule] = useState<ScheduleSlot[] | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [vacationInputs, setVacationInputs] = useState<Record<number, { start: string; end: string }>>({});
    const [engineers, setEngineers] = useState<Engineer[]>([
        { id: 1, name: 'Person 1', vacations: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
        { id: 2, name: 'Person 2', vacations: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
        { id: 3, name: 'Person 3', vacations: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] }
    ]);
    const [showSettings, setShowSettings] = useState(false);

    const getDaysInMonth = (m: any, y: any) => new Date(y, m + 1, 0).getDate();

    const isWeekend = (date: any) => {
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    const isOnVacation = (engineerId: any, date: any) => {
        const engineer = engineers.find(e => e.id === engineerId);
        if (!engineer) return false;

        return engineer.vacations.some(vacation => {
            const start = new Date(vacation.start);
            const end = new Date(vacation.end);
            return date >= start && date <= end;
        });
    };

    const generateSchedule = () => {
        const days = getDaysInMonth(month, year);
        const newSchedule: ScheduleSlot[] = [];
        const engineerSlots: Record<number, { total: number; weekday: number; weekend: number }> = {};
        const engineerWeekendSlots: Record<number, number> = {};
        const lastShiftDate: Record<number, Date | null> = {};
        const weekdayAssignments: Record<number, Set<number>> = {}; // Track which weekday each engineer was assigned (0=Sun, 1=Mon, etc)

        engineers.forEach(e => {
            engineerSlots[e.id] = { total: 0, weekday: 0, weekend: 0 };
            engineerWeekendSlots[e.id] = 0;
            lastShiftDate[e.id] = null;
            weekdayAssignments[e.id] = new Set<number>();
        });

        // Calculate total available days for each engineer
        const availableDays: Record<number, number> = {};
        engineers.forEach(e => {
            let count = 0;
            for (let d = 1; d <= days; d++) {
                const date = new Date(year, month, d);
                if (!isOnVacation(e.id, date)) {
                    if (e.weekendOnly) {
                        if (isWeekend(date)) count++;
                    } else {
                        count++;
                    }
                }
            }
            availableDays[e.id] = count;
        });

        // Calculate minimum days between shifts
        const countAvailableEngineers = () => {
            return engineers.filter(e => !e.weekendOnly).length;
        };
        const minDaysBetweenShifts = Math.floor(countAvailableEngineers() / 2);

        // Assign shifts
        for (let d = 1; d <= days; d++) {
            const date = new Date(year, month, d);
            const isWeekendDay = isWeekend(date);
            const currentWeekday = date.getDay();

            // Filter available engineers
            let available = engineers.filter(e => {
                if (isOnVacation(e.id, date)) return false;
                if (e.weekendOnly && !isWeekendDay) return false;
                if (e.maxWeekendSlots && isWeekendDay && engineerWeekendSlots[e.id] >= e.maxWeekendSlots) return false;

                // Check allowed weekdays constraint - this overrides minimum days if specified
                if (e.allowedWeekdays.length > 0 && !e.allowedWeekdays.includes(currentWeekday)) {
                    return false;
                }

                // Only check minimum days between shifts if no specific weekday constraint
                const lastShift = lastShiftDate[e.id];
                if (e.allowedWeekdays.length === 0 && lastShift !== null) {
                    const daysSinceLastShift = Math.floor((date.getTime() - lastShift.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysSinceLastShift < minDaysBetweenShifts) return false;
                }

                // Check same weekday in different weeks constraint (only if no specific weekdays set)
                if (e.allowedWeekdays.length === 0 && weekdayAssignments[e.id].has(currentWeekday)) {
                    const prevAssignments = newSchedule.filter(s => s.engineer && s.engineer.id === e.id);
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
                available = engineers.filter(e => {
                    if (isOnVacation(e.id, date)) return false;
                    if (e.weekendOnly && !isWeekendDay) return false;
                    if (e.maxWeekendSlots && isWeekendDay && engineerWeekendSlots[e.id] >= e.maxWeekendSlots) return false;

                    // Still respect allowed weekdays if specified
                    if (e.allowedWeekdays.length > 0 && !e.allowedWeekdays.includes(currentWeekday)) {
                        return false;
                    }

                    // Relax minimum days constraint
                    const lastShift = lastShiftDate[e.id];
                    if (e.allowedWeekdays.length === 0 && lastShift !== null) {
                        const daysSinceLastShift = Math.floor((date.getTime() - lastShift.getTime()) / (1000 * 60 * 60 * 24));
                        if (daysSinceLastShift < minDaysBetweenShifts) return false;
                    }

                    return true;
                });
            }

            if (available.length === 0) {
                newSchedule.push({ date, engineer: null });
                continue;
            }

            // Sort by current workload (least loaded first)
            available.sort((a, b) => {
                const ratioA = availableDays[a.id] > 0 ? engineerSlots[a.id]!.total / availableDays[a.id] : 0;
                const ratioB = availableDays[b.id] > 0 ? engineerSlots[b.id]!.total / availableDays[b.id] : 0;
                return ratioA - ratioB;
            });

            const selected = available[0];
            newSchedule.push({ date, engineer: selected });

            engineerSlots[selected.id].total++;
            if (isWeekendDay) {
                engineerSlots[selected.id].weekend++;
                engineerWeekendSlots[selected.id]++;
            } else {
                engineerSlots[selected.id].weekday++;
            }

            lastShiftDate[selected.id] = date;
            weekdayAssignments[selected.id].add(currentWeekday);
        }

        setSchedule(newSchedule);
        setStats(engineerSlots);
    };

    const updateEngineerName = (id: any, name: any) => {
        setEngineers(engineers.map(e => e.id === id ? { ...e, name } : e));
    };

    const addVacation = (engineerId: any, start: any, end: any) => {
        setEngineers(engineers.map(e =>
            e.id === engineerId
                ? { ...e, vacations: [...e.vacations, { start, end }] }
                : e
        ));
    };

    const removeVacation = (engineerId: any, index: any) => {
        setEngineers(engineers.map(e =>
            e.id === engineerId
                ? { ...e, vacations: e.vacations.filter((_, i) => i !== index) }
                : e
        ));
    };

    const toggleWeekendOnly = (engineerId: any) => {
        setEngineers(engineers.map(e => {
            if (e.id === engineerId) {
                // When toggling weekend only, set allowed weekdays to weekend or clear them
                const newWeekendOnly = !e.weekendOnly;
                return {
                    ...e,
                    weekendOnly: newWeekendOnly,
                    allowedWeekdays: newWeekendOnly ? [0, 6] : []
                };
            }
            return e;
        }));
    };

    const toggleWeekday = (engineerId: any, weekday: any) => {
        setEngineers(engineers.map(e => {
            if (e.id === engineerId) {
                const allowed = [...e.allowedWeekdays];
                const index = allowed.indexOf(weekday);
                if (index > -1) {
                    allowed.splice(index, 1);
                } else {
                    allowed.push(weekday);
                }
                return { ...e, allowedWeekdays: allowed };
            }
            return e;
        }));
    };

    const setMaxWeekendSlots = (engineerId: any, max: any) => {
        setEngineers(engineers.map(e =>
            e.id === engineerId
                ? { ...e, maxWeekendSlots: max ? parseInt(max) : null }
                : e
        ));
    };

    const updateNumEngineers = (num: any) => {
        const n = parseInt(num);
        if (n < engineers.length) {
            setEngineers(engineers.slice(0, n));
        } else if (n > engineers.length) {
            const newEngineers = [...engineers];
            for (let i = engineers.length; i < n; i++) {
                newEngineers.push({
                    id: i + 1,
                    name: `Person ${i + 1}`,
                    vacations: [],
                    weekendOnly: false,
                    maxWeekendSlots: null,
                    allowedWeekdays: []
                });
            }
            setEngineers(newEngineers);
        }
        setNumEngineers(n);
    };

    const formatDate = (date: any) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
    };

    const updateVacationInput = (id: number, field: 'start' | 'end', value: string) => {
        setVacationInputs(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-8 h-8 text-indigo-600" />
                            <h1 className="text-3xl font-bold text-gray-800">On-Call Shift Scheduler</h1>
                        </div>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                            {showSettings ? 'Hide' : 'Show'} Settings
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Number of People
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={numEngineers}
                                onChange={(e) => updateNumEngineers(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Month
                            </label>
                            <select
                                value={month}
                                onChange={(e) => setMonth(parseInt(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i} value={i}>
                                        {new Date(2024, i).toLocaleDateString('en-US', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Year
                            </label>
                            <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {showSettings && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Team Member Configuration
                            </h2>
                            {engineers.map((engineer) => (
                                <div key={engineer.id} className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            value={engineer.name}
                                            onChange={(e) => updateEngineerName(engineer.id, e.target.value)}
                                            className="text-lg font-medium px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Available Days</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => toggleWeekday(engineer.id, idx)}
                                                    className={`px-3 py-1 text-sm rounded transition-colors ${engineer.allowedWeekdays.length === 0 || engineer.allowedWeekdays.includes(idx)
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-gray-200 text-gray-500'
                                                        }`}
                                                >
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {engineer.allowedWeekdays.length === 0
                                                ? 'Available all days (respects spacing rules)'
                                                : 'Only available on selected days (overrides spacing rules)'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={engineer.weekendOnly}
                                                onChange={() => toggleWeekendOnly(engineer.id)}
                                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-gray-700">Weekend shifts only</span>
                                        </label>

                                        {engineer.weekendOnly && (
                                            <div>
                                                <label className="block text-sm text-gray-700 mb-1">
                                                    Max weekend slots per month
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={engineer.maxWeekendSlots || ''}
                                                    onChange={(e) => setMaxWeekendSlots(engineer.id, e.target.value)}
                                                    placeholder="Unlimited"
                                                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-2">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Vacations</h4>
                                        {engineer.vacations.map((vacation, idx) => (
                                            <div key={idx} className="flex items-center gap-2 mb-2 text-sm">
                                                <span className="text-gray-600">
                                                    {new Date(vacation.start).toLocaleDateString()} - {new Date(vacation.end).toLocaleDateString()}
                                                </span>
                                                <button
                                                    onClick={() => removeVacation(engineer.id, idx)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                        <div className="flex gap-2 mt-2">
                                            <input
                                                type="date"
                                                value={vacationInputs[engineer.id]?.start || ''}
                                                onChange={(e) => updateVacationInput(engineer.id, 'start', e.target.value)}
                                                className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                            <input
                                                type="date"
                                                value={vacationInputs[engineer.id]?.end || ''}
                                                onChange={(e) => updateVacationInput(engineer.id, 'end', e.target.value)}
                                                className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                            <button
                                                onClick={() => {
                                                    const { start, end } = vacationInputs[engineer.id] || {};
                                                    if (start && end) {
                                                        addVacation(engineer.id, start, end);
                                                        updateVacationInput(engineer.id, 'start', '');
                                                        updateVacationInput(engineer.id, 'end', '');
                                                    }
                                                }}
                                                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                                            >
                                                Add Vacation
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={generateSchedule}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Generate Schedule
                    </button>
                </div>

                {stats && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Distribution Statistics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {engineers.map((engineer) => (
                                <div key={engineer.id} className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg">
                                    <h3 className="font-semibold text-lg text-gray-800 mb-2">{engineer.name}</h3>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-gray-700">
                                            <span className="font-medium">Total shifts:</span> {stats[engineer.id].total}
                                        </p>
                                        <p className="text-gray-700">
                                            <span className="font-medium">Weekdays:</span> {stats[engineer.id].weekday}
                                        </p>
                                        <p className="text-gray-700">
                                            <span className="font-medium">Weekends:</span> {stats[engineer.id].weekend}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {schedule && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Schedule for {new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="space-y-2">
                            {schedule.map((slot, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center justify-between p-3 rounded-lg ${isWeekend(slot.date)
                                        ? 'bg-amber-50 border border-amber-200'
                                        : 'bg-gray-50 border border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="font-medium text-gray-700 w-32">
                                            {formatDate(slot.date)}
                                        </span>
                                        <span className="text-sm text-gray-500">08:00 - 08:00 next day</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {slot.engineer ? (
                                            <span className="px-4 py-1 bg-indigo-100 text-indigo-800 rounded-full font-medium">
                                                {slot.engineer.name}
                                            </span>
                                        ) : (
                                            <span className="px-4 py-1 bg-red-100 text-red-800 rounded-full font-medium flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4" />
                                                No available person
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnCallScheduler;