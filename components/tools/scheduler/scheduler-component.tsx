'use client';
import { Calendar, Clock, RefreshCw, Settings } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

import { FeedbackForm } from '../../feedback-form';
import { Section } from '../../layout/section';
import { TextEffect } from '../../motion-primitives/text-effect';
import { AnimatePresence, m } from 'motion/react';

import { ShiftParameters } from './ShiftParameters';
import { MemberProfileEditor } from './MemberProfileEditor';
import { LoadDistributionAnalysis } from './LoadDistributionAnalysis';
import { RotationSchedule } from './RotationSchedule';
import { useScheduler } from '@/hooks/use-scheduler';

const OnCallScheduler: React.FC = () => {
  const {
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
    setTemperature,
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
  } = useScheduler();

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
