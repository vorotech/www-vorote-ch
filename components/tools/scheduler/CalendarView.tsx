'use client';

import React from 'react';
import { m } from 'motion/react';
import { Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Member, ScheduleSlot, getMemberColor, isOnTimeOff, isWeekend } from './scheduler';

interface CalendarViewProps {
  schedule: ScheduleSlot[];
  members: Member[];
  year: number;
  month: number;
  startOfWeek: number;
  shiftStartHour: number;
  showTimeOff: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  schedule,
  members,
  year,
  month,
  startOfWeek,
  shiftStartHour,
  showTimeOff,
}) => {
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = firstDay.getDay();
  const offset = (firstDayIndex - startOfWeek + 7) % 7;

  return (
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
  );
};
