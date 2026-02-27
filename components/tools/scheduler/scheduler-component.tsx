'use client';
import { Calendar, Clock, RefreshCw, Settings } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

import { FeedbackForm } from '../../feedback-form';
import { Section } from '../../layout/section';
import { TextEffect } from '../../motion-primitives/text-effect';
import { AnimatePresence, m } from 'motion/react';
import { Member, ScheduleSlot, calculateStats, generateScheduleData } from './scheduler';

import { ShiftParameters } from './ShiftParameters';
import { MemberProfileEditor } from './MemberProfileEditor';
import { LoadDistributionAnalysis } from './LoadDistributionAnalysis';
import { RotationSchedule } from './RotationSchedule';

const MAX_MEMBERS = 10;
const STORAGE_KEY = 'vorotech-scheduler-settings';

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
  const [temperature, setTemperature] = useState<number>(0.1); // 0 = Strict rotation, 1 = Pure random
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showTimeOff, setShowTimeOff] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hoveredMemberId, setHoveredMemberId] = useState<number | null>(null);

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

  useEffect(() => {
    loadSettings();
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (!isLoaded) return;
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
    const randomSeed = Math.floor(Math.random() * 10000);
    const { schedule: newSchedule, stats: memberSlots } = generateScheduleData(month, year, members, shiftStartHour, randomSeed, temperature);
    setSchedule(newSchedule);
    setStats(memberSlots);
  };

  const moveMember = (sourceDate: Date, targetDate: Date) => {
    if (!schedule) return;

    const isSameDay = (d1: Date, d2: Date) => {
      return d1.getFullYear() === d2.getFullYear() && 
             d1.getMonth() === d2.getMonth() && 
             d1.getDate() === d2.getDate();
    };

    const newSchedule = [...schedule];
    const sourceIdx = newSchedule.findIndex((s) => isSameDay(s.date, sourceDate));
    const targetIdx = newSchedule.findIndex((s) => isSameDay(s.date, targetDate));

    if (sourceIdx !== -1 && targetIdx !== -1) {
      const sourceMember = newSchedule[sourceIdx].member;
      const targetMember = newSchedule[targetIdx].member;

      newSchedule[sourceIdx] = { ...newSchedule[sourceIdx], member: targetMember };
      newSchedule[targetIdx] = { ...newSchedule[targetIdx], member: sourceMember };

      setSchedule(newSchedule);
      setStats(calculateStats(newSchedule, members));
    }
  };

  const getConfiguration = () => {
    return {
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
  };

  const downloadConfiguration = () => {
    const config = getConfiguration();
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
    const config = getConfiguration();
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    showToast('Configuration copied to clipboard!');
  };

  const getResults = () => {
    if (!schedule) return null;
    return {
      month,
      year,
      schedule: schedule.map((s) => ({
        date: s.date.toISOString().split('T')[0],
        member: s.member ? s.member.name : null,
      })),
      stats,
    };
  };

  const downloadResults = () => {
    const result = getResults();
    if (!result) return;
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
    const result = getResults();
    if (!result) return;
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

        <ShiftParameters
          month={month}
          year={year}
          numMembers={numMembers}
          startOfWeek={startOfWeek}
          shiftStartHour={shiftStartHour}
          temperature={temperature}
          MAX_MEMBERS={MAX_MEMBERS}
          setMonth={setMonth}
          setYear={setYear}
          updateNumMembers={updateNumMembers}
          setStartOfWeek={setStartOfWeek}
          setShiftStartHour={setShiftStartHour}
          setTemperature={setTemperature}
        />

        <div className='relative'>
          <AnimatePresence mode='wait'>
            {showSettings && (
              <m.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }} 
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} 
                className='overflow-hidden'
              >
                <MemberProfileEditor
                  members={members}
                  startOfWeek={startOfWeek}
                  month={month}
                  year={year}
                  timeOffInputs={timeOffInputs}
                  updateMemberName={updateMemberName}
                  toggleWeekday={toggleWeekday}
                  toggleWeekendOnly={toggleWeekendOnly}
                  setMaxWeekendSlots={setMaxWeekendSlots}
                  removeTimeOff={removeTimeOff}
                  updateTimeOffInput={updateTimeOffInput}
                  addTimeOff={addTimeOff}
                  downloadConfiguration={downloadConfiguration}
                  copyConfiguration={copyConfiguration}
                  clearSettings={clearSettings}
                />
              </m.div>
            )}
          </AnimatePresence>

          <div className='flex flex-col sm:flex-row gap-4 mt-8'>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className='flex items-center justify-center gap-3 px-6 py-4 bg-muted/40 hover:bg-muted/60 border border-border/60 rounded-2xl transition-all whitespace-nowrap font-bold text-xs uppercase tracking-widest active:scale-95'
            >
              <Settings className={cn('hidden sm:inline w-5 h-5 transition-transform duration-500', showSettings && 'rotate-180')} />
              <span className='hidden sm:inline'>{showSettings ? 'Close' : 'Configure'} Personnel</span>
              <span className='sm:hidden'>{showSettings ? 'Close' : 'Members'}</span>
            </button>

            <button
              onClick={generateSchedule}
              className='flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 active:scale-[0.98]'
            >
              <RefreshCw className='hidden sm:inline w-5 h-5' />
              <span>Generate Rotation Matrix</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {stats && (
            <div className='mt-8'>
              <LoadDistributionAnalysis
                members={members}
                stats={stats}
                hoveredMemberId={hoveredMemberId}
                onMemberHover={setHoveredMemberId}
                onMemberLeave={() => setHoveredMemberId(null)}
              />
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {schedule && stats && (
            <div className='mt-8'>
              <RotationSchedule
                schedule={schedule}
                stats={stats}
                members={members}
                year={year}
                month={month}
                startOfWeek={startOfWeek}
                shiftStartHour={shiftStartHour}
                viewMode={viewMode}
                setViewMode={setViewMode}
                showTimeOff={showTimeOff}
                setShowTimeOff={setShowTimeOff}
                generateSchedule={generateSchedule}
                downloadResults={downloadResults}
                copyResults={copyResults}
                hoveredMemberId={hoveredMemberId}
                onMemberHover={setHoveredMemberId}
                onMemberLeave={() => setHoveredMemberId(null)}
                onMoveMember={moveMember}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {schedule && (
        <div className='max-w-md mx-auto mt-6 pb-12'>
          <FeedbackForm />
        </div>
      )}

      {toastMessage && (
        <div className='fixed bottom-6 right-6 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50'>{toastMessage}</div>
      )}
    </Section>
  );
};

export default OnCallScheduler;
