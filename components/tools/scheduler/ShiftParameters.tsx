'use client';

import React from 'react';
import { m } from 'motion/react';
import { Clock, Settings } from 'lucide-react';

interface ShiftParametersProps {
  month: number;
  year: number;
  numMembers: number | '';
  startOfWeek: number;
  shiftStartHour: number;
  MAX_MEMBERS: number;
  setMonth: (m: number) => void;
  setYear: (y: number) => void;
  updateNumMembers: (num: string) => void;
  setStartOfWeek: (s: number) => void;
  setShiftStartHour: (h: number) => void;
}

export const ShiftParameters: React.FC<ShiftParametersProps> = ({
  month,
  year,
  numMembers,
  startOfWeek,
  shiftStartHour,
  MAX_MEMBERS,
  setMonth,
  setYear,
  updateNumMembers,
  setStartOfWeek,
  setShiftStartHour,
}) => {
  return (
    <div className='bg-card rounded-3xl border border-border p-8 mb-8 shadow-xl overflow-hidden group relative'>
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

      <m.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className='mb-10 p-8 bg-muted/20 rounded-2xl border border-border/60 backdrop-blur-sm relative overflow-hidden group/settings'
      >
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
    </div>
  );
};
