'use client';

import React from 'react';
import { m } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScheduleSlot, getMemberColor, isWeekend } from './scheduler';
import { AnimatedGroup } from '../../motion-primitives/animated-group';

interface ListViewProps {
  schedule: ScheduleSlot[];
  shiftStartHour: number;
}

export const ListView: React.FC<ListViewProps> = ({ schedule, shiftStartHour }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  };

  return (
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
  );
};
