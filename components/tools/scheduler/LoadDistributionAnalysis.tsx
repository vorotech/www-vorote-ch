'use client';

import React from 'react';
import { m } from 'motion/react';
import { LayoutGrid, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Member, getMemberColor } from './scheduler';
import { AnimatedGroup } from '../../motion-primitives/animated-group';

interface LoadDistributionAnalysisProps {
  members: Member[];
  stats: Record<number, { total: number; weekday: number; weekend: number }>;
}

export const LoadDistributionAnalysis: React.FC<LoadDistributionAnalysisProps> = ({ members, stats }) => {
  return (
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
  );
};
