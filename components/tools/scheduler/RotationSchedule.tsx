'use client';

import React from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Calendar, Clipboard, Dices, Download, Eye, EyeOff, LayoutGrid, List as ListIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Member, ScheduleSlot } from './scheduler';
import { ListView } from './ListView';
import { CalendarView } from './CalendarView';

interface RotationScheduleProps {
  schedule: ScheduleSlot[];
  stats: Record<number, { total: number; weekday: number; weekend: number }>;
  members: Member[];
  year: number;
  month: number;
  startOfWeek: number;
  shiftStartHour: number;
  viewMode: 'list' | 'calendar';
  setViewMode: (m: 'list' | 'calendar') => void;
  showTimeOff: boolean;
  setShowTimeOff: (s: boolean) => void;
  generateSchedule: () => void;
  downloadResults: () => void;
  copyResults: () => void;
  hoveredMemberId: number | null;
  onMemberHover: (id: number) => void;
  onMemberLeave: () => void;
  onMoveMember: (sourceDate: Date, targetDate: Date) => void;
}

export const RotationSchedule: React.FC<RotationScheduleProps> = ({
  schedule,
  stats,
  members,
  year,
  month,
  startOfWeek,
  shiftStartHour,
  viewMode,
  setViewMode,
  showTimeOff,
  setShowTimeOff,
  generateSchedule,
  downloadResults,
  copyResults,
  hoveredMemberId,
  onMemberHover,
  onMemberLeave,
  onMoveMember,
}) => {

  return (
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
          <ListView
            key='list'
            schedule={schedule}
            shiftStartHour={shiftStartHour}
            hoveredMemberId={hoveredMemberId}
            onMemberHover={onMemberHover}
            onMemberLeave={onMemberLeave}
            onMoveMember={onMoveMember}
          />
        ) : (
          <CalendarView
            key='calendar'
            schedule={schedule}
            members={members}
            year={year}
            month={month}
            startOfWeek={startOfWeek}
            shiftStartHour={shiftStartHour}
            showTimeOff={showTimeOff}
            hoveredMemberId={hoveredMemberId}
            onMemberHover={onMemberHover}
            onMemberLeave={onMemberLeave}
            onMoveMember={onMoveMember}
          />
        )}
      </AnimatePresence>
    </m.div>
  );
};
