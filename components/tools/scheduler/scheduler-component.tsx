'use client';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Check,
  Clipboard,
  Clock,
  Dices,
  Download,
  Eye,
  EyeOff,
  LayoutGrid,
  List as ListIcon,
  Plane,
  RefreshCw,
  Settings,
  Trash2,
  Users,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

import { FeedbackForm } from '../../feedback-form';
import { Section } from '../../layout/section';
import { AnimatedGroup } from '../../motion-primitives/animated-group';
import { TextEffect } from '../../motion-primitives/text-effect';
import { AnimatePresence, m } from 'motion/react';
import { Member, ScheduleSlot, generateScheduleData, getDaysInMonth, isOnTimeOff, isWeekend } from './scheduler';

const MAX_MEMBERS = 10;
const STORAGE_KEY = 'vorotech-scheduler-settings';

const MEMBER_COLORS = [
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

const getMemberColor = (id: number) => MEMBER_COLORS[(id - 1) % MEMBER_COLORS.length];

const OnCallScheduler: React.FC = () => {
  const [numMembers, setNumMembers] = useState<number | ''>(3);
  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [schedule, setSchedule] = useState<ScheduleSlot[] | null>(null);
  const [stats, setStats] = useState<Record<number, { total: number; weekday: number; weekend: number }> | null>(null);
  const [timeOffInputs, setTimeOffInputs] = useState<Record<number, { start: string; end: string }>>({});
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: 'Person 1', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
    { id: 2, name: 'Person 2', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
    { id: 3, name: 'Person 3', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
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
            timeOffs: m.timeOffs || [],
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
      shiftStartHour,
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
        { id: 3, name: 'Person 3', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
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
      members: members.map((m) => ({
        ...m,
        timeOffs: m.timeOffs.map((t) => ({
          start: new Date(t.start).toISOString(),
          end: new Date(t.end).toISOString(),
        })),
      })),
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
      members: members.map((m) => ({
        ...m,
        timeOffs: m.timeOffs.map((t) => ({
          start: new Date(t.start).toISOString(),
          end: new Date(t.end).toISOString(),
        })),
      })),
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    showToast('Configuration copied to clipboard!');
  };

  const downloadResults = () => {
    if (!schedule) return;
    const result = {
      month,
      year,
      schedule: schedule.map((s) => ({
        date: s.date.toISOString().split('T')[0],
        member: s.member ? s.member.name : null,
      })),
      stats,
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
      schedule: schedule.map((s) => ({
        date: s.date.toISOString().split('T')[0],
        member: s.member ? s.member.name : null,
      })),
      stats,
    };
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    showToast('Results copied to clipboard!');
  };

  const updateMemberName = (id: number, name: string) => {
    setMembers(members.map((m) => (m.id === id ? { ...m, name } : m)));
  };

  const addTimeOff = (memberId: number, start: string, end: string) => {
    setMembers(members.map((m) => (m.id === memberId ? { ...m, timeOffs: [...m.timeOffs, { start, end }] } : m)));
  };

  const removeTimeOff = (memberId: number, index: number) => {
    setMembers(members.map((m) => (m.id === memberId ? { ...m, timeOffs: m.timeOffs.filter((_, i) => i !== index) } : m)));
  };

  const toggleWeekendOnly = (memberId: number) => {
    setMembers(
      members.map((m) => {
        if (m.id === memberId) {
          // When toggling weekend only, set allowed weekdays to weekend or clear them
          const newWeekendOnly = !m.weekendOnly;
          return {
            ...m,
            weekendOnly: newWeekendOnly,
            allowedWeekdays: newWeekendOnly ? [0, 6] : [],
          };
        }
        return m;
      })
    );
  };

  const toggleWeekday = (memberId: number, weekday: number) => {
    setMembers(
      members.map((m) => {
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
      })
    );
  };

  const setMaxWeekendSlots = (memberId: number, max: string) => {
    setMembers(members.map((m) => (m.id === memberId ? { ...m, maxWeekendSlots: max ? parseInt(max) : null } : m)));
  };

  const updateNumMembers = (num: string) => {
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
          allowedWeekdays: [],
        });
      }
      setMembers(newMembers);
    }
    setNumMembers(n);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  };

  const updateTimeOffInput = (id: number, field: 'start' | 'end', value: string) => {
    setTimeOffInputs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  return (
    <Section showGrid={true} className='pt-8 pb-6 px-4 md:px-6'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex items-center gap-4 mb-10 px-2'>
          <div className='p-3.5 bg-primary/10 rounded-2xl text-primary ring-1 ring-primary/20 shadow-inner group-hover:scale-110 transition-transform duration-500'>
            <Calendar className='w-8 h-8' />
          </div>
          <div>
            <TextEffect per='char' preset='fade-in-blur' className='text-3xl md:text-4xl font-bold font-abel tracking-tight'>
              On-Call Scheduler
            </TextEffect>
            <m.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className='text-muted-foreground mt-1 flex items-center gap-2 text-sm'
            >
              <Clock className='w-4 h-4' />
              Generate fair on-call rotations with conflict handling.
            </m.p>
          </div>
        </div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-card rounded-3xl border border-border p-8 mb-8 shadow-xl overflow-hidden group relative'
        >
          {/* Architectural Background element */}
          <div className='absolute top-0 right-0 p-4 pointer-events-none opacity-[0.05] group-hover:opacity-10 transition-opacity duration-500'>
            <svg width='60' height='60' viewBox='0 0 24 24' fill='none' className='text-primary'>
              <path d='M12 0V24M0 12H24' stroke='currentColor' strokeWidth='0.2' strokeDasharray='1 1' />
              <circle cx='12' cy='12' r='8' stroke='currentColor' strokeWidth='0.2' />
              <path d='M4 4L20 20M20 4L4 20' stroke='currentColor' strokeWidth='0.1' />
            </svg>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
            <div>
              <label className='block text-sm font-medium text-foreground mb-2'>Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className='w-full px-4 py-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-primary'
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={`month-${i}`} value={i}>
                    {new Date(2024, i).toLocaleDateString('en-US', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-foreground mb-2'>Year</label>
              <input
                type='number'
                min='2000'
                max='2100'
                value={year}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') setYear(new Date().getFullYear());
                  else setYear(parseInt(val));
                }}
                className='w-full px-4 py-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground'
              />
            </div>
          </div>

          <m.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className='mb-10 p-8 bg-muted/20 rounded-2xl border border-border/60 backdrop-blur-sm relative overflow-hidden group/settings'>
            <div className='absolute top-0 right-0 p-2 opacity-[0.03] group-hover/settings:opacity-[0.06] transition-opacity'>
              <Settings className='w-24 h-24 rotate-12' />
            </div>
            <h2 className='text-xl font-bold mb-8 flex items-center gap-3 text-foreground tracking-tight'>
              <div className='p-2 bg-primary/10 rounded-lg'>
                <Clock className='w-5 h-5 text-primary' />
              </div>
              Shift Parameters
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10'>
              <div className='flex flex-col gap-2'>
                <label className='block text-xs font-bold uppercase tracking-widest text-muted-foreground'>Total Members</label>
                <input
                  type='number'
                  min='1'
                  max={MAX_MEMBERS}
                  value={numMembers}
                  onChange={(e) => updateNumMembers(e.target.value)}
                  className='w-full px-5 py-3.5 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono text-sm shadow-inner'
                />
              </div>
              <div className='flex flex-col gap-2'>
                <label className='block text-xs font-bold uppercase tracking-widest text-muted-foreground'>Week Start</label>
                <select
                  value={startOfWeek}
                  onChange={(e) => setStartOfWeek(parseInt(e.target.value))}
                  className='w-full px-5 py-3.5 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono text-sm shadow-inner appearance-none cursor-pointer'
                >
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                  <option value={6}>Saturday</option>
                </select>
              </div>
              <div className='flex flex-col gap-2'>
                <label className='block text-xs font-bold uppercase tracking-widest text-muted-foreground'>Start Hour (24h)</label>
                <input
                  type='number'
                  min='0'
                  max='23'
                  value={shiftStartHour}
                  onChange={(e) => setShiftStartHour(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                  className='w-full px-5 py-3.5 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono text-sm shadow-inner'
                />
              </div>
              <div className='flex flex-col gap-2'>
                <label className='block text-xs font-bold uppercase tracking-widest text-muted-foreground'>Shift Duration</label>
                <div className='w-full px-5 py-3.5 bg-muted/40 border border-border/40 rounded-xl text-muted-foreground/60 text-sm font-mono flex items-center h-[52px] select-none'>
                  24 HOURS
                </div>
              </div>
            </div>
          </m.div>

          <AnimatePresence mode='wait'>
            {showSettings && (
              <m.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className='mb-8 overflow-hidden'>
                <h2 className='text-2xl font-bold mb-8 flex items-center gap-3 border-t border-border pt-8 tracking-tight'>
                  <div className='p-2 bg-primary/10 rounded-lg'>
                    <Users className='w-6 h-6 text-primary' />
                  </div>
                  Member Profile Editor
                </h2>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  {members.map((member, idx) => (
                    <m.div
                      key={member.id}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className='p-6 bg-card rounded-2xl border border-border shadow-md hover:border-primary/30 transition-all duration-300 relative group/member'
                    >
                      {/* Member decorative tag */}
                      <div className='absolute top-0 right-0 p-3 flex flex-col items-end gap-1 opacity-[0.2] pointer-events-none group-hover/member:opacity-[0.4] transition-opacity'>
                        <span className='text-[8px] font-mono uppercase tracking-[0.2em]'>MBR_{member.id.toString().padStart(3, '0')}</span>
                        <div className={cn('h-[1px] w-8 bg-current', getMemberColor(member.id).text)} />
                      </div>

                      <div className='mb-6 flex items-center gap-4'>
                        <div className={cn('size-10 rounded-xl flex items-center justify-center font-bold font-mono', getMemberColor(member.id).bg, getMemberColor(member.id).text)}>
                          {member.id}
                        </div>
                        <input
                          type='text'
                          value={member.name}
                          onChange={(e) => updateMemberName(member.id, e.target.value)}
                          className='flex-1 text-lg font-bold px-3 py-1.5 border-b border-border/50 bg-transparent focus:border-primary outline-none transition-all text-foreground placeholder:text-muted-foreground/40'
                        />
                      </div>

                      <div className='mb-6'>
                        <h4 className='text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-3'>Availability Profile</h4>
                        <div className='flex flex-wrap gap-1.5'>
                          {Array.from({ length: 7 }).map((_, i) => {
                            const dayIndex = (startOfWeek + i) % 7;
                            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                            const isActive = member.allowedWeekdays.length === 0 || member.allowedWeekdays.includes(dayIndex);
                            return (
                              <button
                                key={dayIndex}
                                onClick={() => toggleWeekday(member.id, dayIndex)}
                                className={cn(
                                  'px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200 uppercase tracking-tighter border ring-offset-2 focus:ring-2 ring-primary/20',
                                  isActive ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted/30 border-border/40 text-muted-foreground/50 grayscale opacity-70 hover:grayscale-0 hover:opacity-100'
                                )}
                              >
                                {days[dayIndex]}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pt-6 border-t border-border/30'>
                        <label className='flex items-center gap-3 cursor-pointer group/toggle'>
                          <div className={cn('size-5 rounded-md border flex items-center justify-center transition-all', member.weekendOnly ? 'bg-primary border-primary text-primary-foreground shadow-sm' : 'border-border group-hover/toggle:border-primary/40')}>
                            {member.weekendOnly && <Check className='size-3.5 stroke-[4]' />}
                          </div>
                          <input type='checkbox' checked={member.weekendOnly} onChange={() => toggleWeekendOnly(member.id)} className='hidden' />
                          <span className='text-xs font-bold text-foreground/70 uppercase tracking-wider'>Weekend-Only Focus</span>
                        </label>

                        <AnimatePresence>
                          {member.weekendOnly && (
                            <m.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} className='flex flex-col gap-1.5'>
                              <label className='text-[10px] font-black uppercase text-muted-foreground tracking-widest'>Max Weekend Shifts</label>
                              <input
                                type='number'
                                min='1'
                                value={member.maxWeekendSlots || ''}
                                onChange={(e) => setMaxWeekendSlots(member.id, e.target.value)}
                                placeholder='∞ Unlimited'
                                className='w-full px-3 py-2 text-xs font-mono border border-border/50 bg-background/50 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all'
                              />
                            </m.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className='pt-6 border-t border-border/30'>
                        <h4 className='text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-4'>Time Off Schedule</h4>
                        <div className='space-y-2 mb-4 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar'>
                          {member.timeOffs
                            .filter((timeOff) => {
                              const vacStart = new Date(timeOff.start);
                              const vacEnd = new Date(timeOff.end);
                              const monthStart = new Date(year, month, 1);
                              const monthEnd = new Date(year, month + 1, 0);
                              return vacStart <= monthEnd && vacEnd >= monthStart;
                            })
                            .map((timeOff, offIdx) => (
                              <m.div key={offIdx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className='flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/40 group/toff hover:bg-muted/50 transition-colors'>
                                <div className='flex items-center gap-3 text-xs font-mono'>
                                  <div className='size-2 rounded-full bg-primary/40' />
                                  <span className='text-foreground font-bold'>{new Date(timeOff.start).toLocaleDateString()}</span>
                                  <ArrowRight className='size-3 text-muted-foreground' />
                                  <span className='text-foreground font-bold'>{new Date(timeOff.end).toLocaleDateString()}</span>
                                </div>
                                <button onClick={() => removeTimeOff(member.id, offIdx)} className='p-1.5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all'>
                                  <Trash2 className='size-4' />
                                </button>
                              </m.div>
                            ))}
                        </div>
                        <div className='flex flex-col sm:flex-row gap-3 mt-4'>
                          <div className='flex-1 grid grid-cols-2 gap-2'>
                            <input
                              type='date'
                              value={timeOffInputs[member.id]?.start || ''}
                              onChange={(e) => updateTimeOffInput(member.id, 'start', e.target.value)}
                              className='px-3 py-2 text-xs font-mono border border-border/50 bg-background/50 rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all'
                            />
                            <input
                              type='date'
                              value={timeOffInputs[member.id]?.end || ''}
                              onChange={(e) => updateTimeOffInput(member.id, 'end', e.target.value)}
                              className='px-3 py-2 text-xs font-mono border border-border/50 bg-background/50 rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all'
                            />
                          </div>
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
                            className='px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 active:scale-95'
                          >
                            ADD SCHEDULE
                          </button>
                        </div>
                      </div>
                    </m.div>
                  ))}
                </div>

                <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='flex gap-3 mt-10 justify-end items-center'>
                  <span className='text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2'>Data Operations:</span>
                  <button
                    onClick={downloadConfiguration}
                    className='flex items-center gap-2 px-4 py-2.5 bg-muted/50 border border-border/60 text-foreground hover:bg-primary/10 hover:border-primary/40 hover:text-primary rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest'
                  >
                    <Download className='w-4 h-4' />
                    Export JSON
                  </button>
                  <button
                    onClick={copyConfiguration}
                    className='flex items-center gap-2 px-4 py-2.5 bg-muted/50 border border-border/60 text-foreground hover:bg-primary/10 hover:border-primary/40 hover:text-primary rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest'
                  >
                    <Clipboard className='w-4 h-4' />
                    Copy Data
                  </button>
                  <button
                    onClick={clearSettings}
                    className='flex items-center gap-2 px-4 py-2.5 bg-destructive/5 border border-destructive/20 text-destructive hover:bg-destructive/10 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest'
                  >
                    <Trash2 className='w-4 h-4' />
                    Factory Reset
                  </button>
                </m.div>
              </m.div>
            )}
          </AnimatePresence>

          <div className='flex flex-col sm:flex-row gap-4'>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className='flex items-center gap-3 px-6 py-4 bg-muted/40 hover:bg-muted/60 border border-border/60 rounded-2xl transition-all whitespace-nowrap font-bold text-xs uppercase tracking-widest active:scale-95'
            >
              <Settings className={cn('w-5 h-5 transition-transform duration-500', showSettings && 'rotate-180')} />
              <span className='hidden sm:inline'>{showSettings ? 'Close' : 'Configure'} Personnel</span>
              <span className='sm:hidden'>{showSettings ? 'Close' : 'Members'}</span>
            </button>

            <button
              onClick={generateSchedule}
              className='flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 active:scale-[0.98]'
            >
              <RefreshCw className='w-5 h-5' />
              <span>Generate Rotation Matrix</span>
            </button>
          </div>
        </m.div>

        <AnimatePresence>
          {stats && (
            <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className='bg-card/50 backdrop-blur-md rounded-3xl border border-border p-8 mb-8 shadow-sm relative overflow-hidden'>
              <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
              <h2 className='text-2xl font-bold text-foreground mb-8 flex items-center gap-3 tracking-tight'>
                <div className='p-2 bg-primary/10 rounded-lg'>
                  <LayoutGrid className='w-6 h-6 text-primary' />
                </div>
                Load Distribution Analysis
              </h2>
              <AnimatedGroup className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' preset='blur-slide'>
                {members.map((member) => {
                  const color = getMemberColor(member.id);
                  return (
                    <m.div
                      key={member.id}
                      whileHover={{ y: -5 }}
                      className={cn(
                        'p-6 rounded-2xl border transition-all duration-300 relative group/stat overflow-hidden',
                        color.bg,
                        color.border,
                        'hover:shadow-xl hover:shadow-current/5'
                      )}
                    >
                      <div className='absolute -right-2 -bottom-2 opacity-[0.05] group-hover/stat:opacity-[0.1] transition-opacity'>
                        <Users className='w-16 h-16' />
                      </div>
                      <h3 className={cn('font-bold text-lg mb-4 flex items-center gap-2', color.text)}>
                        <div className={cn('size-2 rounded-full bg-current')} />
                        {member.name}
                      </h3>
                      <div className='grid grid-cols-3 gap-2'>
                        <div className='flex flex-col'>
                          <span className='text-[8px] font-black uppercase tracking-widest opacity-50'>Total</span>
                          <span className='text-xl font-bold font-mono'>{stats[member.id].total}</span>
                        </div>
                        <div className='flex flex-col'>
                          <span className='text-[8px] font-black uppercase tracking-widest opacity-50'>Wkdy</span>
                          <span className='text-xl font-bold font-mono'>{stats[member.id].weekday}</span>
                        </div>
                        <div className='flex flex-col'>
                          <span className='text-[8px] font-black uppercase tracking-widest opacity-50'>Wkend</span>
                          <span className='text-xl font-bold font-mono'>{stats[member.id].weekend}</span>
                        </div>
                      </div>
                    </m.div>
                  );
                })}
              </AnimatedGroup>
            </m.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {schedule && (
            <m.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className='bg-card rounded-3xl border border-border p-8 shadow-2xl relative overflow-hidden'>
              <div className='absolute top-0 right-0 p-8 pointer-events-none opacity-[0.02] -z-10 group-hover:opacity-5 transition-opacity'>
                <Calendar className='w-48 h-48 -rotate-12' />
              </div>
              
              <div className='flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8 relative z-10'>
                <h2 className='text-2xl font-black font-abel tracking-tight text-foreground uppercase'>
                  Rotation Schedule <span className='text-primary opacity-60'>•</span> {new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                
                <div className='flex flex-wrap items-center gap-2'>
                  <div className='flex bg-muted/40 p-1.5 rounded-2xl border border-border/40 backdrop-blur-sm shadow-inner'>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-bold text-[10px] uppercase tracking-widest',
                        viewMode === 'list' ? 'bg-card shadow-lg text-primary scale-105' : 'text-muted-foreground/60 hover:text-foreground'
                      )}
                      title='Detailed List View'
                    >
                      <ListIcon className='w-4 h-4' />
                      LIST
                    </button>
                    <button
                      onClick={() => setViewMode('calendar')}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-bold text-[10px] uppercase tracking-widest',
                        viewMode === 'calendar' ? 'bg-card shadow-lg text-primary scale-105' : 'text-muted-foreground/60 hover:text-foreground'
                      )}
                      title='Grid Calendar View'
                    >
                      <LayoutGrid className='w-4 h-4' />
                      GRID
                    </button>
                  </div>
                </div>
              </div>

              <div className='flex flex-wrap gap-2 mb-8 items-center bg-muted/20 p-4 rounded-2xl border border-border/40'>
                <span className='text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mr-2 ml-2'>ACTIONS:</span>
                <button
                  onClick={generateSchedule}
                  className='flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest'
                  title='Regenerate Schedule'
                >
                  <Dices className='w-4 h-4' />
                  Reroll
                </button>
                <button
                  onClick={downloadResults}
                  className='flex items-center gap-2 px-4 py-2 bg-muted/50 border border-border/60 text-foreground hover:bg-primary/10 hover:border-primary/40 hover:text-primary rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest'
                  title='Download Results'
                >
                  <Download className='w-4 h-4' />
                  JSON
                </button>
                <button
                  onClick={copyResults}
                  className='flex items-center gap-2 px-4 py-2 bg-muted/50 border border-border/60 text-foreground hover:bg-primary/10 hover:border-primary/40 hover:text-primary rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest'
                  title='Copy Results'
                >
                  <Clipboard className='w-4 h-4' />
                  Copy
                </button>
                {viewMode === 'calendar' && (
                  <button
                    onClick={() => setShowTimeOff(!showTimeOff)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border',
                      showTimeOff ? 'bg-primary/10 border-primary/20 text-primary shadow-sm' : 'bg-muted/50 border-border/60 text-muted-foreground/60 hover:text-foreground'
                    )}
                  >
                    {showTimeOff ? <Eye className='w-4 h-4' /> : <EyeOff className='w-4 h-4' />}
                    Time Off
                  </button>
                )}
              </div>

              <AnimatePresence mode='wait'>
                {viewMode === 'list' ? (
                  <m.div key='list' initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                    <AnimatedGroup className='space-y-3' preset='blur-slide'>
                      {schedule.map((slot, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'flex items-center justify-between p-4 rounded-2xl transition-all group/slot',
                            isWeekend(slot.date) ? 'bg-muted/40 border-l-4 border-l-orange-500/50 shadow-sm' : 'bg-card border border-border/40'
                          )}
                        >
                          <div className='flex items-center gap-6'>
                            <div className='flex flex-col'>
                              <span className='text-[10px] font-black uppercase tracking-widest text-muted-foreground/50'>{idx + 1}</span>
                              <span className='font-bold text-foreground text-sm tracking-tight'>{formatDate(slot.date)}</span>
                            </div>
                            <div className='hidden sm:flex items-center gap-2 text-[10px] font-mono font-bold text-muted-foreground bg-muted/50 px-3 py-1 rounded-lg border border-border/40'>
                              {shiftStartHour.toString().padStart(2, '0')}:00 UTC
                            </div>
                          </div>
                          <div className='flex items-center gap-3'>
                            {slot.member ? (
                              <div className='flex items-center gap-3'>
                                <div className={cn('h-2 w-8 rounded-full opacity-30', getMemberColor(slot.member.id).bg)} />
                                <span
                                  className={cn(
                                    'px-6 py-2 rounded-xl font-bold text-sm tracking-tight transition-all group-hover/slot:scale-105',
                                    getMemberColor(slot.member.id).bg,
                                    getMemberColor(slot.member.id).text
                                  )}
                                >
                                  {slot.member.name}
                                </span>
                              </div>
                            ) : (
                              <span className='px-6 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2'>
                                <AlertCircle className='w-4 h-4' />
                                GAP
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </AnimatedGroup>
                  </m.div>
                ) : (
                  <m.div key='calendar' initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }} className='overflow-x-auto pb-4'>
                    <div className='min-w-[800px] px-1'>
                      <div className='border border-border/60 rounded-3xl overflow-hidden shadow-sm'>
                        <div className='grid grid-cols-7 bg-muted/50 backdrop-blur-sm border-b border-border/60'>
                          {Array.from({ length: 7 }).map((_, i) => {
                            const dayIndex = (startOfWeek + i) % 7;
                            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                            return (
                              <div key={`head-${i}`} className='py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60'>
                                {days[dayIndex]}
                              </div>
                            );
                          })}
                        </div>
                        <div className='grid grid-cols-7 bg-card/40'>
                          {(() => {
                            const firstDay = new Date(year, month, 1);
                            const totalDays = new Date(year, month + 1, 0).getDate();
                            const firstDayIndex = firstDay.getDay();
                            const offset = (firstDayIndex - startOfWeek + 7) % 7;

                            const cells = [];

                            // Empty cells before start of month
                            for (let emptyIdx = 0; emptyIdx < offset; emptyIdx++) {
                              cells.push(<div key={`empty-${emptyIdx}`} className='min-h-[9rem] border-b border-r border-border/40 bg-muted/10' />);
                            }

                            // Day cells
                            for (let d = 1; d <= totalDays; d++) {
                              const date = new Date(year, month, d);
                              const slot = schedule.find((s) => s.date.getDate() === d);
                              const isToday = new Date().toDateString() === date.toDateString();

                              cells.push(
                                <div
                                  key={d}
                                  className={cn(
                                    'min-h-[9rem] border-b border-r border-border/40 p-3 hover:bg-muted/20 transition-all duration-300 relative group/cell',
                                    isWeekend(date) ? 'bg-muted/5' : ''
                                  )}
                                >
                                  <div className='flex justify-between items-start mb-4'>
                                    <div
                                      className={cn(
                                        'text-xs font-black font-mono transition-all',
                                        isToday ? 'bg-primary text-primary-foreground size-7 rounded-lg flex items-center justify-center shadow-lg shadow-primary/30 scale-110' : 'text-muted-foreground/40 group-hover/cell:text-foreground'
                                      )}
                                    >
                                      {d}
                                    </div>
                                    {isWeekend(date) && <div className='size-1 rounded-full bg-orange-500/30' />}
                                  </div>
                                  
                                  {slot && slot.member ? (
                                    <m.div
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className={cn(
                                        'text-[10px] p-3 rounded-xl border-l-2 font-bold shadow-sm group-hover/cell:scale-105 transition-transform relative overflow-hidden',
                                        getMemberColor(slot.member.id).bg,
                                        getMemberColor(slot.member.id).text,
                                        'border-current'
                                      )}
                                    >
                                      <div className='absolute top-0 left-0 w-full h-full opacity-[0.03] bg-current pointer-events-none' />
                                      {slot.member.name}
                                      <div className='text-[9px] mt-1.5 opacity-60 font-mono tracking-tighter'>
                                        SHIFT: {shiftStartHour.toString().padStart(2, '0')}:00
                                      </div>
                                    </m.div>
                                  ) : (
                                    <div className='text-[10px] text-muted-foreground/30 italic px-2 py-1 border border-dashed border-border/40 rounded-lg'>Unassigned</div>
                                  )}
                                  
                                  {showTimeOff && (
                                    <div className='mt-3 space-y-1'>
                                      {members
                                        .filter((m) => isOnTimeOff(m, date))
                                        .map((m) => (
                                          <div
                                            key={m.id}
                                            className='flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground/70 bg-muted/40 px-2 py-1 rounded-lg border border-border/20 group/vac'
                                          >
                                            <Plane className='size-2.5 opacity-40 group-hover/vac:text-primary transition-colors' />
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
                              cells.push(<div key={`empty-end-${endIdx}`} className='min-h-[9rem] border-b border-r border-border/40 bg-muted/10' />);
                            }

                            return cells;
                          })()}
                        </div>
                      </div>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {schedule && (
        <div className='max-w-md mx-auto mt-6 pb-12'>
          <FeedbackForm />
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className='fixed bottom-6 right-6 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50'>{toastMessage}</div>
      )}
    </Section>
  );
};

export default OnCallScheduler;
