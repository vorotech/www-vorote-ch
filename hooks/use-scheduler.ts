import { useState, useEffect, useMemo } from 'react';
import { Member, ScheduleSlot, calculateStats, generateScheduleData } from '@/components/tools/scheduler/scheduler';

const MAX_MEMBERS = 10;
const STORAGE_KEY = 'vorotech-scheduler-settings';

export function useScheduler() {
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
  const [startOfWeek, setStartOfWeek] = useState<number>(1);
  const [shiftStartHour, setShiftStartHour] = useState<number>(8);
  const [temperature, setTemperature] = useState<number>(0.1);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showTimeOff, setShowTimeOff] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hoveredMemberId, setHoveredMemberId] = useState<number | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  const setTemperatureValue = (val: number) => {
    setTemperature(val);
  };

  return {
    MAX_MEMBERS,
    numMembers,
    month,
    year,
    schedule,
    stats,
    timeOffInputs,
    members,
    startOfWeek,
    shiftStartHour,
    temperature,
    viewMode,
    showTimeOff,
    showSettings,
    toastMessage,
    hoveredMemberId,
    setMonth,
    setYear,
    setStartOfWeek,
    setShiftStartHour,
    setTemperature: setTemperatureValue,
    setViewMode,
    setShowTimeOff,
    setShowSettings,
    setHoveredMemberId,
    updateNumMembers,
    updateMemberName,
    addTimeOff,
    removeTimeOff,
    toggleWeekendOnly,
    toggleWeekday,
    setMaxWeekendSlots,
    updateTimeOffInput,
    generateSchedule,
    moveMember,
    downloadConfiguration,
    copyConfiguration,
    downloadResults,
    copyResults,
    clearSettings,
  };
}
