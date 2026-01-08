"use client";
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Calendar, Users, AlertCircle, RefreshCw, Settings, Trash2, LayoutGrid, List as ListIcon, Clock } from 'lucide-react';


interface Vacation {
    start: string | Date;
    end: string | Date;
}

interface Member {
    id: number;
    name: string;
    vacations: Vacation[];
    weekendOnly: boolean;
    maxWeekendSlots: number | null;
    allowedWeekdays: number[];
}

interface ScheduleSlot {
    date: Date;
    member: Member | null;
}

const MAX_MEMBERS = 10;
const STORAGE_KEY = 'vorotech-scheduler-settings';

const MEMBER_COLORS = [
    { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', ring: 'focus:ring-blue-500' },
    { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', ring: 'focus:ring-emerald-500' },
    { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', ring: 'focus:ring-amber-500' },
    { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200', ring: 'focus:ring-rose-500' },
    { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-200', ring: 'focus:ring-violet-500' },
    { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200', ring: 'focus:ring-cyan-500' },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', border: 'border-fuchsia-200', ring: 'focus:ring-fuchsia-500' },
    { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-200', ring: 'focus:ring-lime-500' },
    { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', ring: 'focus:ring-orange-500' },
    { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200', ring: 'focus:ring-teal-500' },
];

const getMemberColor = (id: number) => MEMBER_COLORS[(id - 1) % MEMBER_COLORS.length];

const OnCallScheduler = () => {
    const [numMembers, setNumMembers] = useState<any>(3);
    const [month, setMonth] = useState<any>(new Date().getMonth());
    const [year, setYear] = useState<any>(new Date().getFullYear());
    const [schedule, setSchedule] = useState<ScheduleSlot[] | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [vacationInputs, setVacationInputs] = useState<Record<number, { start: string; end: string }>>({});
    const [members, setMembers] = useState<Member[]>([
        { id: 1, name: 'Person 1', vacations: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
        { id: 2, name: 'Person 2', vacations: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
        { id: 3, name: 'Person 3', vacations: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] }
    ]);
    const [startOfWeek, setStartOfWeek] = useState<number>(1); // 0 = Sunday, 1 = Monday, etc.
    const [shiftStartHour, setShiftStartHour] = useState<number>(8); // 0-23
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [showSettings, setShowSettings] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load settings from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const { numMembers: storedNum, members: storedMembers, startOfWeek: storedStartOfWeek, shiftStartHour: storedShiftStartHour } = JSON.parse(stored);
                if (storedNum) setNumMembers(storedNum);
                if (storedMembers) setMembers(storedMembers);
                if (storedStartOfWeek !== undefined) setStartOfWeek(storedStartOfWeek);
                if (storedShiftStartHour !== undefined) setShiftStartHour(storedShiftStartHour);
            } catch (e) {
                console.error('Failed to load scheduler settings', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save settings to local storage whenever they change
    useEffect(() => {
        if (!isLoaded) return; // Don't overwrite with default state before loading
        const settings = {
            numMembers,
            members,
            startOfWeek,
            shiftStartHour
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [numMembers, members, startOfWeek, shiftStartHour, isLoaded]);

    const clearSettings = () => {
        if (confirm('Are you sure you want to clear all saved settings? This will reset names, vacations, and preferences.')) {
            localStorage.removeItem(STORAGE_KEY);
            setNumMembers(3);
            setStartOfWeek(1);
            setShiftStartHour(8);
            setMembers([
                { id: 1, name: 'Person 1', vacations: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
                { id: 2, name: 'Person 2', vacations: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
                { id: 3, name: 'Person 3', vacations: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] }
            ]);
            setSchedule(null);
            setStats(null);
        }
    };

    const getDaysInMonth = (m: any, y: any) => new Date(y, m + 1, 0).getDate();

    const isWeekend = (date: any) => {
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    const isOnVacation = (memberId: any, date: any) => {
        const member = members.find(e => e.id === memberId);
        if (!member) return false;

        return member.vacations.some(vacation => {
            const start = new Date(vacation.start);
            const end = new Date(vacation.end);
            return date >= start && date <= end;
        });
    };

    const generateSchedule = () => {
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
                if (!isOnVacation(m.id, date)) {
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
                if (isOnVacation(m.id, date)) return false;
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
                    if (isOnVacation(m.id, date)) return false;
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

        setSchedule(newSchedule);
        setStats(memberSlots);
    };

    const updateMemberName = (id: any, name: any) => {
        setMembers(members.map(m => m.id === id ? { ...m, name } : m));
    };

    const addVacation = (memberId: any, start: any, end: any) => {
        setMembers(members.map(m =>
            m.id === memberId
                ? { ...m, vacations: [...m.vacations, { start, end }] }
                : m
        ));
    };

    const removeVacation = (memberId: any, index: any) => {
        setMembers(members.map(m =>
            m.id === memberId
                ? { ...m, vacations: m.vacations.filter((_, i) => i !== index) }
                : m
        ));
    };

    const toggleWeekendOnly = (memberId: any) => {
        setMembers(members.map(m => {
            if (m.id === memberId) {
                // When toggling weekend only, set allowed weekdays to weekend or clear them
                const newWeekendOnly = !m.weekendOnly;
                return {
                    ...m,
                    weekendOnly: newWeekendOnly,
                    allowedWeekdays: newWeekendOnly ? [0, 6] : []
                };
            }
            return m;
        }));
    };

    const toggleWeekday = (memberId: any, weekday: any) => {
        setMembers(members.map(m => {
            if (m.id === memberId) {
                const allowed = [...m.allowedWeekdays];
                const index = allowed.indexOf(weekday);
                if (index > -1) {
                    allowed.splice(index, 1);
                } else {
                    allowed.push(weekday);
                }
                return { ...m, allowedWeekdays: allowed };
            }
            return m;
        }));
    };

    const setMaxWeekendSlots = (memberId: any, max: any) => {
        setMembers(members.map(m =>
            m.id === memberId
                ? { ...m, maxWeekendSlots: max ? parseInt(max) : null }
                : m
        ));
    };

    const updateNumMembers = (num: any) => {
        if (num === '') {
            setNumMembers('');
            return;
        }
        let n = parseInt(num);
        if (isNaN(n)) return;

        if (n < 1) n = 1;
        if (n > MAX_MEMBERS) n = MAX_MEMBERS;

        // Reset schedule and stats as parameters have changed
        setSchedule(null);
        setStats(null);

        if (n < members.length) {
            setMembers(members.slice(0, n));
        } else if (n > members.length) {
            const newMembers = [...members];
            for (let i = members.length; i < n; i++) {
                newMembers.push({
                    id: i + 1,
                    name: `Person ${i + 1}`,
                    vacations: [],
                    weekendOnly: false,
                    maxWeekendSlots: null,
                    allowedWeekdays: []
                });
            }
            setMembers(newMembers);
        }
        setNumMembers(n);
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Number of People
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={MAX_MEMBERS}
                                value={numMembers}
                                onChange={(e) => updateNumMembers(e.target.value)}
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
                                min="2000"
                                max="2100"
                                value={year}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '') setYear('');
                                    else setYear(parseInt(val));
                                }}
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

                            <div className="mb-8 p-4 bg-white rounded-lg border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-indigo-600" />
                                    Generator Settings
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start of Week
                                        </label>
                                        <select
                                            value={startOfWeek}
                                            onChange={(e) => setStartOfWeek(parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value={0}>Sunday</option>
                                            <option value={1}>Monday</option>
                                            <option value={6}>Saturday</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Shift Start Hour (24h)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="23"
                                            value={shiftStartHour}
                                            onChange={(e) => setShiftStartHour(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Shift Length
                                        </label>
                                        <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-500">
                                            24 Hours (Fixed)
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 border-t border-gray-200 pt-6">
                                <Users className="w-5 h-5" />
                                Member Configuration
                            </h2>
                            {members.map((member) => (
                                <div key={member.id} className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            value={member.name}
                                            onChange={(e) => updateMemberName(member.id, e.target.value)}
                                            className="text-lg font-medium px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Available Days</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => toggleWeekday(member.id, idx)}
                                                    className={`px-3 py-1 text-sm rounded transition-colors ${member.allowedWeekdays.length === 0 || member.allowedWeekdays.includes(idx)
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-gray-200 text-gray-500'
                                                        }`}
                                                >
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {member.allowedWeekdays.length === 0
                                                ? 'Available all days (respects spacing rules)'
                                                : 'Only available on selected days (overrides spacing rules)'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={member.weekendOnly}
                                                onChange={() => toggleWeekendOnly(member.id)}
                                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-gray-700">Weekend shifts only</span>
                                        </label>

                                        {member.weekendOnly && (
                                            <div>
                                                <label className="block text-sm text-gray-700 mb-1">
                                                    Max weekend slots per month
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={member.maxWeekendSlots || ''}
                                                    onChange={(e) => setMaxWeekendSlots(member.id, e.target.value)}
                                                    placeholder="Unlimited"
                                                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-2">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Vacations</h4>
                                        {member.vacations
                                            .filter(vacation => {
                                                const vacStart = new Date(vacation.start);
                                                const vacEnd = new Date(vacation.end);
                                                const monthStart = new Date(year, month, 1);
                                                const monthEnd = new Date(year, month + 1, 0);

                                                return vacStart <= monthEnd && vacEnd >= monthStart;
                                            })
                                            .map((vacation, idx) => (
                                                <div key={idx} className="flex items-center gap-2 mb-2 text-sm">
                                                    <span className="text-gray-600">
                                                        {new Date(vacation.start).toLocaleDateString()} - {new Date(vacation.end).toLocaleDateString()}
                                                    </span>
                                                    <button
                                                        onClick={() => removeVacation(member.id, idx)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        <div className="flex gap-2 mt-2">
                                            <input
                                                type="date"
                                                value={vacationInputs[member.id]?.start || ''}
                                                onChange={(e) => updateVacationInput(member.id, 'start', e.target.value)}
                                                className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                            <input
                                                type="date"
                                                value={vacationInputs[member.id]?.end || ''}
                                                onChange={(e) => updateVacationInput(member.id, 'end', e.target.value)}
                                                className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                            <button
                                                onClick={() => {
                                                    const { start, end } = vacationInputs[member.id] || {};
                                                    if (start && end) {
                                                        if (new Date(start) > new Date(end)) {
                                                            alert('Start date must be before or equal to end date');
                                                            return;
                                                        }
                                                        addVacation(member.id, start, end);
                                                        updateVacationInput(member.id, 'start', '');
                                                        updateVacationInput(member.id, 'end', '');
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

                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors whitespace-nowrap"
                        >
                            <Settings className="w-5 h-5" />
                            {showSettings ? 'Hide' : 'Show'} Settings
                        </button>
                        <button
                            onClick={clearSettings}
                            className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200 whitespace-nowrap"
                            title="Clear browser cache"
                        >
                            <Trash2 className="w-5 h-5" />
                            Clear cache
                        </button>
                        <button
                            onClick={generateSchedule}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Generate Schedule
                        </button>
                    </div>
                </div>

                {stats && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Distribution Statistics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {members.map((member) => {
                                const color = getMemberColor(member.id);
                                return (
                                    <div key={member.id} className={`p-4 rounded-lg border ${color.bg} ${color.border}`}>
                                        <h3 className={`font-semibold text-lg ${color.text} mb-2`}>{member.name}</h3>
                                        <div className="space-y-1 text-sm text-gray-700">
                                            <p>
                                                <span className="font-medium">Total shifts:</span> {stats[member.id].total}
                                            </p>
                                            <p>
                                                <span className="font-medium">Weekdays:</span> {stats[member.id].weekday}
                                            </p>
                                            <p>
                                                <span className="font-medium">Weekends:</span> {stats[member.id].weekend}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {schedule && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Schedule for {new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>

                        <div className="flex justify-end mb-4">
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    title="List View"
                                >
                                    <ListIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('calendar')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    title="Calendar View"
                                >
                                    <LayoutGrid className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {viewMode === 'list' ? (
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
                                            <span className="text-sm text-gray-500">
                                                {shiftStartHour.toString().padStart(2, '0')}:00 - {shiftStartHour.toString().padStart(2, '0')}:00 next day
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {slot.member ? (
                                                <span className={`px-4 py-1 rounded-full font-medium ${getMemberColor(slot.member.id).bg} ${getMemberColor(slot.member.id).text}`}>
                                                    {slot.member.name}
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
                        ) : (
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                                    {Array.from({ length: 7 }).map((_, i) => {
                                        const dayIndex = (startOfWeek + i) % 7;
                                        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                                        return (
                                            <div key={i} className="py-2 text-center text-sm font-semibold text-gray-600">
                                                {days[dayIndex]}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="grid grid-cols-7 bg-white">
                                    {(() => {
                                        const firstDay = new Date(year, month, 1);
                                        const totalDays = new Date(year, month + 1, 0).getDate();
                                        const firstDayIndex = firstDay.getDay();
                                        const offset = (firstDayIndex - startOfWeek + 7) % 7;

                                        const cells = [];

                                        // Empty cells before start of month
                                        for (let i = 0; i < offset; i++) {
                                            cells.push(<div key={`empty-${i}`} className="h-32 border-b border-r border-gray-100 bg-gray-50/30" />);
                                        }

                                        // Day cells
                                        for (let d = 1; d <= totalDays; d++) {
                                            const date = new Date(year, month, d);
                                            const slot = schedule.find(s => s.date.getDate() === d);
                                            const isToday = new Date().toDateString() === date.toDateString();

                                            cells.push(
                                                <div key={d} className={`h-32 border-b border-r border-gray-100 p-2 hover:bg-gray-50 transition-colors ${isWeekend(date) ? 'bg-amber-50/30' : ''
                                                    }`}>
                                                    <div className={`text-sm font-medium mb-2 ${isToday ? 'bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-700'
                                                        }`}>
                                                        {d}
                                                    </div>
                                                    {slot && slot.member ? (
                                                        <div className={`text-xs p-2 rounded border font-medium ${getMemberColor(slot.member.id).bg} ${getMemberColor(slot.member.id).text} ${getMemberColor(slot.member.id).border}`}>
                                                            {slot.member.name}
                                                            <div className={`text-[10px] mt-1 opacity-75`}>
                                                                {shiftStartHour}:00
                                                            </div>
                                                        </div>
                                                    ) : slot ? (
                                                        <div className="text-xs p-2 bg-red-100 text-red-800 rounded border border-red-200 font-medium flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            Unassigned
                                                        </div>
                                                    ) : null}
                                                </div>
                                            );
                                        }

                                        // Empty cells after end of month
                                        const remainingCells = 7 - (cells.length % 7);
                                        if (remainingCells < 7) {
                                            for (let i = 0; i < remainingCells; i++) {
                                                cells.push(<div key={`empty-end-${i}`} className="h-32 border-b border-r border-gray-100 bg-gray-50/30" />);
                                            }
                                        }

                                        return cells;
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnCallScheduler;