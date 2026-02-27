'use client';

import React, { useState } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { Plane, GripVertical } from 'lucide-react';
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
  hoveredMemberId: number | null;
  onMemberHover: (id: number) => void;
  onMemberLeave: () => void;
  onMoveMember: (sourceDate: Date, targetDate: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  schedule,
  members,
  year,
  month,
  startOfWeek,
  shiftStartHour,
  showTimeOff,
  hoveredMemberId,
  onMemberHover,
  onMemberLeave,
  onMoveMember,
}) => {
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = firstDay.getDay();
  const offset = (firstDayIndex - startOfWeek + 7) % 7;

  const [draggedDate, setDragSourceDate] = useState<Date | null>(null);

  const handleDragStart = (e: React.DragEvent, date: Date) => {
    setDragSourceDate(date);
    // Required for some browsers to initiate drag
    e.dataTransfer.setData('text/plain', '');
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetDate: Date) => {
    if (draggedDate && draggedDate.getTime() !== targetDate.getTime()) {
      onMoveMember(draggedDate, targetDate);
    }
    setDragSourceDate(null);
  };

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

                const isSlotHighlighted = slot?.member && hoveredMemberId === slot.member.id;
                const isSlotDimmed = hoveredMemberId !== null && slot?.member && hoveredMemberId !== slot.member.id;
                const isBeingDragged = draggedDate && draggedDate.getTime() === date.getTime();

                cells.push(
                  <div
                    key={d}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(date)}
                    className={cn(
                      'min-h-[9rem] border-b border-r border-border/40 p-3 hover:bg-muted/20 transition-all duration-300 relative group/cell',
                      isWeekend(date) ? 'bg-muted/5' : '',
                      draggedDate && !isBeingDragged && 'hover:bg-primary/5 hover:ring-2 hover:ring-primary/20 hover:z-10'
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
                    
                    <AnimatePresence mode='popLayout'>
                      {slot && slot.member ? (
                        <m.div
                          layout
                          layoutId={`member-${slot.member.id}-${d}`}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: isBeingDragged ? 0.4 : 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          draggable
                          onDragStart={(e: any) => handleDragStart(e, date)}
                          onMouseEnter={() => slot.member && onMemberHover(slot.member.id)}
                          onMouseLeave={onMemberLeave}
                          className={cn(
                            'text-[10px] p-3 rounded-xl border-l-2 font-bold shadow-sm transition-all duration-300 relative overflow-hidden cursor-grab active:cursor-grabbing group/member',
                            getMemberColor(slot.member.id).bg,
                            getMemberColor(slot.member.id).text,
                            'border-current',
                            isSlotHighlighted ? 'scale-105 z-10 shadow-lg ring-2 ring-primary/20' : 'group-hover/cell:scale-105',
                            isSlotDimmed && 'opacity-30 grayscale-[0.5] scale-95'
                          )}
                        >
                          <div className='absolute top-0 left-0 w-full h-full opacity-[0.03] bg-current pointer-events-none' />
                          <div className='flex items-center justify-between mb-1'>
                            <span>{slot.member.name}</span>
                            <GripVertical className='w-3 h-3 opacity-0 group-hover/member:opacity-40 transition-opacity' />
                          </div>
                          <div className='text-[9px] mt-1.5 opacity-60 font-mono tracking-tighter'>
                            SHIFT: {shiftStartHour.toString().padStart(2, '0')}:00
                          </div>
                        </m.div>
                      ) : (
                        <div className='text-[10px] text-muted-foreground/30 italic px-2 py-1 border border-dashed border-border/40 rounded-lg'>Unassigned</div>
                      )}
                    </AnimatePresence>
                    
                    {showTimeOff && (
                      <div className='mt-3 space-y-1'>
                        {members
                          .filter((m) => isOnTimeOff(m, date))
                          .map((m) => {
                            const isVacHighlighted = hoveredMemberId === m.id;
                            const isVacDimmed = hoveredMemberId !== null && hoveredMemberId !== m.id;

                            return (
                              <div
                                key={m.id}
                                onMouseEnter={() => onMemberHover(m.id)}
                                onMouseLeave={onMemberLeave}
                                className={cn(
                                  'flex items-center gap-1.5 text-[9px] font-bold px-2 py-1 rounded-lg border transition-all duration-300 group/vac cursor-pointer',
                                  isVacHighlighted ? 'bg-primary/10 border-primary/40 text-primary scale-105 shadow-sm' : 'text-muted-foreground/70 bg-muted/40 border-border/20',
                                  isVacDimmed && 'opacity-20 scale-95 grayscale'
                                )}
                              >
                                <Plane className={cn('size-2.5 transition-colors', isVacHighlighted ? 'text-primary' : 'opacity-40 group-hover/vac:text-primary')} />
                                {m.name}
                              </div>
                            );
                          })}
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
