'use client';

import React from 'react';
import { AnimatePresence, m } from 'motion/react';
import { ArrowRight, Check, Clipboard, Download, Trash2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Member, getMemberColor } from './scheduler';

interface MemberProfileEditorProps {
  members: Member[];
  startOfWeek: number;
  month: number;
  year: number;
  timeOffInputs: Record<number, { start: string; end: string }>;
  updateMemberName: (id: number, name: string) => void;
  toggleWeekday: (memberId: number, dayIndex: number) => void;
  toggleWeekendOnly: (memberId: number) => void;
  setMaxWeekendSlots: (memberId: number, max: string) => void;
  removeTimeOff: (memberId: number, index: number) => void;
  updateTimeOffInput: (id: number, field: 'start' | 'end', value: string) => void;
  addTimeOff: (id: number, start: string, end: string) => void;
  downloadConfiguration: () => void;
  copyConfiguration: () => void;
  clearSettings: () => void;
}

export const MemberProfileEditor: React.FC<MemberProfileEditorProps> = ({
  members,
  startOfWeek,
  month,
  year,
  timeOffInputs,
  updateMemberName,
  toggleWeekday,
  toggleWeekendOnly,
  setMaxWeekendSlots,
  removeTimeOff,
  updateTimeOffInput,
  addTimeOff,
  downloadConfiguration,
  copyConfiguration,
  clearSettings,
}) => {
  return (
    <div className='mb-8 overflow-hidden'>
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
    </div>
  );
};
