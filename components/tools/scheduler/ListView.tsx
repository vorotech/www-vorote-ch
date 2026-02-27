'use client';

import React, { useState } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { AlertCircle, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScheduleSlot, getMemberColor, isWeekend } from './scheduler';
import { AnimatedGroup } from '../../motion-primitives/animated-group';

interface ListViewProps {
  schedule: ScheduleSlot[];
  shiftStartHour: number;
  hoveredMemberId: number | null;
  onMemberHover: (id: number) => void;
  onMemberLeave: () => void;
  onMoveMember: (sourceDate: Date, targetDate: Date) => void;
}

export const ListView: React.FC<ListViewProps> = ({ 
  schedule, 
  shiftStartHour, 
  hoveredMemberId, 
  onMemberHover, 
  onMemberLeave,
  onMoveMember
}) => {
  const [draggedDate, setDraggedDate] = useState<Date | null>(null);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  };

  const handleDragStart = (e: React.DragEvent, date: Date) => {
    setDraggedDate(date);
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
    setDraggedDate(null);
  };

  return (
    <m.div key='list' initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
      <AnimatedGroup className='space-y-3' preset='blur-slide'>
        {schedule.map((slot, idx) => {
          const isHighlighted = slot.member && hoveredMemberId === slot.member.id;
          const isDimmed = hoveredMemberId !== null && slot.member && hoveredMemberId !== slot.member.id;
          const isBeingDragged = draggedDate && draggedDate.getTime() === slot.date.getTime();

          return (
            <m.div
              key={idx}
              layout
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(slot.date)}
              draggable
              onDragStart={(e: any) => handleDragStart(e, slot.date)}
              onMouseEnter={() => slot.member && onMemberHover(slot.member.id)}
              onMouseLeave={onMemberLeave}
              className={cn(
                'flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group/slot relative overflow-hidden cursor-grab active:cursor-grabbing',
                isWeekend(slot.date) ? 'bg-muted/40 border-l-4 border-l-orange-500/50 shadow-sm' : 'bg-card border border-border/40',
                isHighlighted && 'ring-2 ring-primary/50 shadow-lg scale-[1.01] z-10',
                isDimmed && 'opacity-40 grayscale-[0.5]',
                isBeingDragged && 'opacity-20 scale-95 grayscale',
                draggedDate && !isBeingDragged && 'hover:bg-primary/5 hover:border-primary/30 hover:scale-[1.01]'
              )}
            >
              {isHighlighted && (
                <div className='absolute inset-0 bg-primary/5 pointer-events-none animate-pulse' />
              )}
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
                <AnimatePresence mode='popLayout'>
                  {slot.member ? (
                    <m.div
                      layoutId={`member-list-${slot.member.id}-${idx}`}
                      onMouseEnter={() => slot.member && onMemberHover(slot.member.id)}
                      onMouseLeave={onMemberLeave}
                      className='flex items-center gap-3 group/member'
                    >
                      <GripVertical className='w-3 h-3 text-muted-foreground/20 group-hover/member:text-muted-foreground/50 transition-colors' />
                      <div className={cn('h-2 w-8 rounded-full opacity-30', getMemberColor(slot.member.id).bg)} />
                      <span
                        className={cn(
                          'px-6 py-2 rounded-xl font-bold text-sm tracking-tight transition-all',
                          getMemberColor(slot.member.id).bg,
                          getMemberColor(slot.member.id).text,
                          isHighlighted ? 'scale-110 shadow-md' : 'group-hover/slot:scale-105'
                        )}
                      >
                        {slot.member.name}
                      </span>
                    </m.div>
                  ) : (
                    <span className='px-6 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2'>
                      <AlertCircle className='w-4 h-4' />
                      GAP
                    </span>
                  )}
                </AnimatePresence>
              </div>
            </m.div>
          );
        })}
      </AnimatedGroup>
    </m.div>
  );
};
