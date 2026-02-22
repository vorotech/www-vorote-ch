"use client";
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Calendar, Users, AlertCircle, RefreshCw, Settings, Trash2, LayoutGrid, List as ListIcon, Clock, Eye, EyeOff, Plane, Dices, Download, Clipboard } from 'lucide-react';


import { Member, ScheduleSlot, generateScheduleData, isOnTimeOff, isWeekend, getDaysInMonth } from './scheduler';
import { FeedbackForm } from '../../feedback-form';

const MAX_MEMBERS = 10;
const STORAGE_KEY = 'vorotech-scheduler-settings';

const MEMBER_COLORS = [
    { bg: 'bg-[#1e66f5]/10 dark:bg-[#8caaee]/10', text: 'text-[#1e66f5] dark:text-[#8caaee]', border: 'border-[#1e66f5]/50 dark:border-[#8caaee]/50', ring: 'focus:ring-[#1e66f5] dark:focus:ring-[#8caaee]' }, // Blue
    { bg: 'bg-[#40a02b]/10 dark:bg-[#a6d189]/10', text: 'text-[#40a02b] dark:text-[#a6d189]', border: 'border-[#40a02b]/50 dark:border-[#a6d189]/50', ring: 'focus:ring-[#40a02b] dark:focus:ring-[#a6d189]' }, // Green
    { bg: 'bg-[#8839ef]/10 dark:bg-[#ca9ee6]/10', text: 'text-[#8839ef] dark:text-[#ca9ee6]', border: 'border-[#8839ef]/50 dark:border-[#ca9ee6]/50', ring: 'focus:ring-[#8839ef] dark:focus:ring-[#ca9ee6]' }, // Mauve
    { bg: 'bg-[#04a5e5]/10 dark:bg-[#99d1db]/10', text: 'text-[#04a5e5] dark:text-[#99d1db]', border: 'border-[#04a5e5]/50 dark:border-[#99d1db]/50', ring: 'focus:ring-[#04a5e5] dark:focus:ring-[#99d1db]' }, // Sky
    { bg: 'bg-[#ea76cb]/10 dark:bg-[#f4b8e4]/10', text: 'text-[#ea76cb] dark:text-[#f4b8e4]', border: 'border-[#ea76cb]/50 dark:border-[#f4b8e4]/50', ring: 'focus:ring-[#ea76cb] dark:focus:ring-[#f4b8e4]' }, // Pink
    { bg: 'bg-[#df8e1d]/10 dark:bg-[#e5c890]/10', text: 'text-[#df8e1d] dark:text-[#e5c890]', border: 'border-[#df8e1d]/50 dark:border-[#e5c890]/50', ring: 'focus:ring-[#df8e1d] dark:focus:ring-[#e5c890]' }, // Yellow
    { bg: 'bg-[#179299]/10 dark:bg-[#81c8be]/10', text: 'text-[#179299] dark:text-[#81c8be]', border: 'border-[#179299]/50 dark:border-[#81c8be]/50', ring: 'focus:ring-[#179299] dark:focus:ring-[#81c8be]' }, // Teal
    { bg: 'bg-[#fe640b]/10 dark:bg-[#ef9f76]/10', text: 'text-[#fe640b] dark:text-[#ef9f76]', border: 'border-[#fe640b]/50 dark:border-[#ef9f76]/50', ring: 'focus:ring-[#fe640b] dark:focus:ring-[#ef9f76]' }, // Peach
    { bg: 'bg-[#7287fd]/10 dark:bg-[#babbf1]/10', text: 'text-[#7287fd] dark:text-[#babbf1]', border: 'border-[#7287fd]/50 dark:border-[#babbf1]/50', ring: 'focus:ring-[#7287fd] dark:focus:ring-[#babbf1]' }, // Lavender
    { bg: 'bg-[#dd7878]/10 dark:bg-[#eebebe]/10', text: 'text-[#dd7878] dark:text-[#eebebe]', border: 'border-[#dd7878]/50 dark:border-[#eebebe]/50', ring: 'focus:ring-[#dd7878] dark:focus:ring-[#eebebe]' }, // Flamingo
];

const getMemberColor = (id: number) => MEMBER_COLORS[(id - 1) % MEMBER_COLORS.length];

const OnCallScheduler = () => {
    const [numMembers, setNumMembers] = useState<any>(3);
    const [month, setMonth] = useState<any>(new Date().getMonth());
    const [year, setYear] = useState<any>(new Date().getFullYear());
    const [schedule, setSchedule] = useState<ScheduleSlot[] | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [timeOffInputs, setTimeOffInputs] = useState<Record<number, { start: string; end: string }>>({});
    const [members, setMembers] = useState<Member[]>([
        { id: 1, name: 'Person 1', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
        { id: 2, name: 'Person 2', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
        { id: 3, name: 'Person 3', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] }
    ]);
    const [startOfWeek, setStartOfWeek] = useState<number>(1); // 0 = Sunday, 1 = Monday, etc.
    const [shiftStartHour, setShiftStartHour] = useState<number>(8); // 0-23
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [showTimeOff, setShowTimeOff] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const loadSettings = () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const { numMembers: storedNum, members: storedMembers, startOfWeek: storedStartOfWeek, shiftStartHour: storedShiftStartHour } = JSON.parse(stored);
                if (storedNum) setNumMembers(storedNum);
                if (storedMembers) {
                    const migratedMembers = storedMembers.map((m: any) => ({
                        ...m,
                        timeOffs: m.timeOffs || []
                    }));
                    setMembers(migratedMembers);
                }
                if (storedStartOfWeek !== undefined) setStartOfWeek(storedStartOfWeek);
                if (storedShiftStartHour !== undefined) setShiftStartHour(storedShiftStartHour);
            } catch (e) {
                console.error('Failed to load scheduler settings', e);
            }
        }
        setIsLoaded(true);
    };

    // Load settings from local storage on mount
    useEffect(() => {
        loadSettings();
    }, []);

    // Toast helper
    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

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
        if (confirm('Are you sure you want to clear all saved settings? This will reset names, time off, and preferences.')) {
            localStorage.removeItem(STORAGE_KEY);
            setNumMembers(3);
            setStartOfWeek(1);
            setShiftStartHour(8);
            setMembers([
                { id: 1, name: 'Person 1', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
                { id: 2, name: 'Person 2', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
                { id: 3, name: 'Person 3', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] }
            ]);
            setSchedule(null);
            setStats(null);
        }
    };

    const generateSchedule = () => {
        const { schedule: newSchedule, stats: memberSlots } = generateScheduleData(month, year, members, shiftStartHour);
        setSchedule(newSchedule);
        setStats(memberSlots);
    };

    const downloadConfiguration = () => {
        const config = {
            month,
            year,
            members: members.map(m => ({
                ...m,
                timeOffs: m.timeOffs.map(t => ({
                    start: new Date(t.start).toISOString(),
                    end: new Date(t.end).toISOString()
                }))
            }))
        };
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scheduler-config-${year}-${month + 1}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const copyConfiguration = () => {
        const config = {
            month,
            year,
            members: members.map(m => ({
                ...m,
                timeOffs: m.timeOffs.map(t => ({
                    start: new Date(t.start).toISOString(),
                    end: new Date(t.end).toISOString()
                }))
            }))
        };
        navigator.clipboard.writeText(JSON.stringify(config, null, 2));
        showToast('Configuration copied to clipboard!');
    };

    const downloadResults = () => {
        if (!schedule) return;
        const result = {
            month,
            year,
            schedule: schedule.map(s => ({
                date: s.date.toISOString().split('T')[0],
                member: s.member ? s.member.name : null
            })),
            stats
        };
        const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `schedule-results-${year}-${month + 1}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const copyResults = () => {
        if (!schedule) return;
        const result = {
            month,
            year,
            schedule: schedule.map(s => ({
                date: s.date.toISOString().split('T')[0],
                member: s.member ? s.member.name : null
            })),
            stats
        };
        navigator.clipboard.writeText(JSON.stringify(result, null, 2));
        showToast('Results copied to clipboard!');
    };



    const updateMemberName = (id: any, name: any) => {
        setMembers(members.map(m => m.id === id ? { ...m, name } : m));
    };

    const addTimeOff = (memberId: any, start: any, end: any) => {
        setMembers(members.map(m =>
            m.id === memberId
                ? { ...m, timeOffs: [...m.timeOffs, { start, end }] }
                : m
        ));
    };

    const removeTimeOff = (memberId: any, index: any) => {
        setMembers(members.map(m =>
            m.id === memberId
                ? { ...m, timeOffs: m.timeOffs.filter((_, i) => i !== index) }
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
                    timeOffs: [],
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

    const updateTimeOffInput = (id: number, field: 'start' | 'end', value: string) => {
        setTimeOffInputs(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));
    };

    return (
        <div className="bg-background pt-8 pb-6 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="bg-card rounded-xl border border-border p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-8 h-8 text-primary" />
                            <h1 className="text-3xl font-bold text-foreground">On-Call Shift Scheduler</h1>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Number of People
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={MAX_MEMBERS}
                                value={numMembers}
                                onChange={(e) => updateNumMembers(e.target.value)}
                                className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Month
                            </label>
                            <select
                                value={month}
                                onChange={(e) => setMonth(parseInt(e.target.value))}
                                className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            >
                                {Array.from({ length: 12 }, (i, val) => (
                                    <option key={`head-${i}`} value={val}>
                                        {new Date(2024, val).toLocaleDateString('en-US', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
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
                                className="w-full px-4 py-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>

                    {showSettings && (
                        <div className="mb-6 p-4 bg-muted/50 rounded-xl border border-border">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Team Member Configuration
                            </h2>



                            <div className="mb-8 p-6 bg-card rounded-xl border border-border">
                                <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary" />
                                    Generator Settings
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Start of Week
                                        </label>
                                        <select
                                            value={startOfWeek}
                                            onChange={(e) => setStartOfWeek(parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-border bg-background rounded focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                                        >
                                            <option value={0}>Sunday</option>
                                            <option value={1}>Monday</option>
                                            <option value={6}>Saturday</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Shift Start Hour (24h)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="23"
                                            value={shiftStartHour}
                                            onChange={(e) => setShiftStartHour(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                                            className="w-full px-3 py-2 border border-border bg-background rounded focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Shift Length
                                        </label>
                                        <div className="w-full px-3 py-2 bg-muted border border-border rounded text-muted-foreground">
                                            24 Hours (Fixed)
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 border-t border-border pt-6">
                                <Users className="w-5 h-5" />
                                Member Configuration
                            </h2>
                            {members.map((member) => (
                                <div key={member.id} className="mb-6 p-6 bg-card rounded-xl border border-border">
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            value={member.name}
                                            onChange={(e) => updateMemberName(member.id, e.target.value)}
                                            className="text-lg font-medium px-3 py-1 border border-border bg-background rounded focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-foreground mb-2">Available Days</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.from({ length: 7 }).map((_, i) => {
                                                const dayIndex = (startOfWeek + i) % 7;
                                                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                                                return (
                                                    <button
                                                        key={dayIndex}
                                                        onClick={() => toggleWeekday(member.id, dayIndex)}
                                                        className={`px-3 py-1 text-sm rounded transition-colors ${member.allowedWeekdays.length === 0 || member.allowedWeekdays.includes(dayIndex)
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-secondary text-muted-foreground'
                                                            }`}
                                                    >
                                                        {days[dayIndex]}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
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
                                                className="w-4 h-4 text-primary rounded focus:ring-primary"
                                            />
                                            <span className="text-sm text-foreground">Weekend shifts only</span>
                                        </label>

                                        {member.weekendOnly && (
                                            <div>
                                                <label className="block text-sm text-foreground mb-1">
                                                    Max weekend slots per month
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={member.maxWeekendSlots || ''}
                                                    onChange={(e) => setMaxWeekendSlots(member.id, e.target.value)}
                                                    placeholder="Unlimited"
                                                    className="w-full px-3 py-1 text-sm border border-border bg-background rounded focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-2">
                                        <h4 className="text-sm font-medium text-foreground mb-2">Time Off</h4>
                                        {member.timeOffs
                                            .filter(timeOff => {
                                                const vacStart = new Date(timeOff.start);
                                                const vacEnd = new Date(timeOff.end);
                                                const monthStart = new Date(year, month, 1);
                                                const monthEnd = new Date(year, month + 1, 0);

                                                return vacStart <= monthEnd && vacEnd >= monthStart;
                                            })
                                            .map((timeOff, offIdx) => (
                                                <div key={offIdx} className="flex items-center gap-2 mb-2 text-sm">
                                                    <span className="text-muted-foreground">
                                                        {new Date(timeOff.start).toLocaleDateString()} - {new Date(timeOff.end).toLocaleDateString()}
                                                    </span>
                                                    <button
                                                        onClick={() => removeTimeOff(member.id, offIdx)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        <div className="flex flex-col md:flex-row gap-2 mt-2">
                                            <input
                                                type="date"
                                                value={timeOffInputs[member.id]?.start || ''}
                                                onChange={(e) => updateTimeOffInput(member.id, 'start', e.target.value)}
                                                className="px-2 py-1 text-sm border border-border bg-background rounded focus:ring-2 focus:ring-primary focus:border-primary w-full md:w-auto text-foreground"
                                            />
                                            <input
                                                type="date"
                                                value={timeOffInputs[member.id]?.end || ''}
                                                onChange={(e) => updateTimeOffInput(member.id, 'end', e.target.value)}
                                                className="px-2 py-1 text-sm border border-border bg-background rounded focus:ring-2 focus:ring-primary focus:border-primary w-full md:w-auto text-foreground"
                                            />
                                            <button
                                                onClick={() => {
                                                    const { start, end } = timeOffInputs[member.id] || {};
                                                    if (start && end) {
                                                        if (new Date(start) > new Date(end)) {
                                                            alert('Start date must be before or equal to end date');
                                                            return;
                                                        }
                                                        addTimeOff(member.id, start, end);
                                                        updateTimeOffInput(member.id, 'start', '');
                                                        updateTimeOffInput(member.id, 'end', '');
                                                    }
                                                }}
                                                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors w-full md:w-auto"
                                            >
                                                Add Time Off
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="flex gap-2 mt-6 justify-end border-t border-border pt-4">
                                <button
                                    onClick={downloadConfiguration}
                                    className="flex items-center gap-2 px-3 py-2 bg-secondary text-foreground hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium"
                                    title="Download Configuration"
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="hidden md:inline">Download</span>
                                </button>
                                <button
                                    onClick={copyConfiguration}
                                    className="flex items-center gap-2 px-3 py-2 bg-secondary text-foreground hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium"
                                    title="Copy Configuration"
                                >
                                    <Clipboard className="w-4 h-4" />
                                    <span className="hidden md:inline">Copy</span>
                                </button>
                                <button
                                    onClick={clearSettings}
                                    className="flex items-center gap-2 px-3 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors border border-destructive/20 text-sm font-medium"
                                    title="Clear Cache"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="hidden md:inline">Clear</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="flex items-center gap-2 px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors whitespace-nowrap"
                        >
                            <Settings className="w-5 h-5" />
                            <span className="hidden md:inline">{showSettings ? 'Hide' : 'Show'} Settings</span>
                            <span className="md:hidden">Settings</span>
                        </button>

                        <button
                            onClick={generateSchedule}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                            <RefreshCw className="w-5 h-5" />
                            <span className="hidden md:inline">Generate Schedule</span>
                            <span className="md:hidden">Generate</span>
                        </button>
                    </div>
                </div>

                {stats && (
                    <div className="bg-card rounded-xl border border-border p-6 mb-6">
                        <h2 className="text-2xl font-bold text-foreground mb-4">Distribution Statistics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {members.map((member) => {
                                const color = getMemberColor(member.id);
                                return (
                                    <div key={member.id} className={`p-6 rounded-xl border ${color.bg} ${color.border} hover:shadow-lg transition-all duration-300 hover:border-primary/50 group`}>
                                        <h3 className={`font-semibold text-lg ${color.text} mb-2`}>{member.name}</h3>
                                        <div className="space-y-1 text-sm text-foreground">
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
                    <div className="bg-card rounded-xl border border-border p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl md:text-2xl font-bold text-foreground">
                                Schedule for {new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h2>
                        </div>

                        <div className="flex flex-wrap justify-end gap-2 mb-4">
                            <button
                                onClick={generateSchedule}
                                className="flex items-center gap-2 px-3 py-2 bg-accent/10 text-primary hover:bg-accent/20 rounded-lg transition-colors text-sm font-medium"
                                title="Regenerate Schedule"
                            >
                                <Dices className="w-4 h-4" />
                                <span className="hidden md:inline">Randomize</span>
                            </button>
                            <button
                                onClick={downloadResults}
                                className="flex items-center gap-2 px-3 py-2 bg-secondary text-foreground hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium"
                                title="Download Results"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden md:inline">Download</span>
                            </button>
                            <button
                                onClick={copyResults}
                                className="flex items-center gap-2 px-3 py-2 bg-secondary text-foreground hover:bg-secondary/80 rounded-lg transition-colors text-sm font-medium"
                                title="Copy Results"
                            >
                                <Clipboard className="w-4 h-4" />
                                <span className="hidden md:inline">Copy</span>
                            </button>
                            {viewMode === 'calendar' && (
                                <button
                                    onClick={() => setShowTimeOff(!showTimeOff)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${showTimeOff ? 'bg-accent/10 text-primary' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                                        }`}
                                >
                                    {showTimeOff ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    <span className="hidden md:inline">Time Off</span>
                                </button>
                            )}
                            <div className="flex bg-secondary p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                    title="List View"
                                >
                                    <ListIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('calendar')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
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
                                            ? 'bg-muted/50 border border-border'
                                            : 'bg-card border border-border'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="font-medium text-foreground w-24 md:w-32 truncate">
                                                {formatDate(slot.date)}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {shiftStartHour.toString().padStart(2, '0')}:00 - {shiftStartHour.toString().padStart(2, '0')}:00 next day
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {slot.member ? (
                                                <span className={`px-2 py-1 md:px-4 md:py-1 rounded-full font-medium text-sm md:text-base truncate max-w-[120px] md:max-w-none inline-block align-middle ${getMemberColor(slot.member.id).bg} ${getMemberColor(slot.member.id).text}`}>
                                                    {slot.member.name}
                                                </span>
                                            ) : (
                                                <span className="px-4 py-1 bg-destructive/10 text-destructive rounded-full font-medium flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4" />
                                                    No available person
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="overflow-x-auto pb-4">
                                <div className="min-w-[800px]">
                                    <div className="border border-border rounded-lg overflow-hidden">
                                        <div className="grid grid-cols-7 bg-muted border-b border-border">
                                            {Array.from({ length: 7 }).map((_, i) => {
                                                const dayIndex = (startOfWeek + i) % 7;
                                                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                                                return (
                                                    <div key={`head-${i}`} className="py-2 text-center text-sm font-semibold text-muted-foreground">
                                                        {days[dayIndex]}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="grid grid-cols-7 bg-card">
                                            {(() => {
                                                const firstDay = new Date(year, month, 1);
                                                const totalDays = new Date(year, month + 1, 0).getDate();
                                                const firstDayIndex = firstDay.getDay();
                                                const offset = (firstDayIndex - startOfWeek + 7) % 7;

                                                const cells = [];

                                                // Empty cells before start of month
                                                for (let emptyIdx = 0; emptyIdx < offset; emptyIdx++) {
                                                    cells.push(<div key={`empty-${emptyIdx}`} className="min-h-[8rem] border-b border-r border-border bg-muted/20" />);
                                                }

                                                // Day cells
                                                for (let d = 1; d <= totalDays; d++) {
                                                    const date = new Date(year, month, d);
                                                    const slot = schedule.find(s => s.date.getDate() === d);
                                                    const isToday = new Date().toDateString() === date.toDateString();

                                                    cells.push(
                                                        <div key={d} className={`min-h-[8rem] border-b border-r border-border p-2 hover:bg-muted/30 transition-colors ${isWeekend(date) ? 'bg-muted/10' : ''
                                                            }`}>
                                                            <div className={`text-sm font-medium mb-2 ${isToday ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center' : 'text-foreground'
                                                                }`}>
                                                                {d}
                                                            </div>
                                                            {slot && slot.member ? (
                                                                <div className={`text-xs p-2 rounded border font-medium ${getMemberColor(slot.member.id).bg} ${getMemberColor(slot.member.id).text} ${getMemberColor(slot.member.id).border}`}>
                                                                    {slot.member.name}
                                                                    <div className={`text-[10px] mt-1 opacity-75`}>
                                                                        {shiftStartHour.toString().padStart(2, '0')}:00
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="text-xs text-muted-foreground italic p-2">
                                                                    Unassigned
                                                                </div>
                                                            )}
                                                            {showTimeOff && (
                                                                <div className="mt-1 space-y-1">
                                                                    {members
                                                                        .filter(m => isOnTimeOff(m, date))
                                                                        .map(m => (
                                                                            <div key={m.id} className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-1 rounded border border-border">
                                                                                <Plane className="w-3 h-3" />
                                                                                {m.name}
                                                                            </div>
                                                                        ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                }

                                                // Fill remaining cells
                                                const remainingCells = (7 - ((offset + totalDays) % 7)) % 7;
                                                for (let endIdx = 0; endIdx < remainingCells; endIdx++) {
                                                    cells.push(<div key={`empty-end-${endIdx}`} className="min-h-[8rem] border-b border-r border-border bg-muted/20" />);
                                                }

                                                return cells;
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {schedule && (
                <div className="max-w-md mx-auto mt-6 pb-12">
                    <FeedbackForm />
                </div>
            )}

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50">
                    {toastMessage}
                </div>
            )}
        </div>
    );
};

export default OnCallScheduler;