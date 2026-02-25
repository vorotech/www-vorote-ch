'use client';

import { AnimatedGroup } from '@/components/motion-primitives/animated-group';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { cn } from '@/lib/utils';
import { Bug, Code, Lock, ShieldAlert, ShieldCheck, Zap } from 'lucide-react';
import { m } from 'motion/react';
import React from 'react';

interface SecurityCheck {
  name: string;
  status: 'secure' | 'vulnerable' | 'passing' | 'failing' | 'error' | 'parse_error';
  metrics: {
    vulnerabilities?: number;
    scanned_at?: string;
    packages_count?: number;
    errors?: number | 'multiple';
  };
}

interface SecurityReport {
  generated_at: string;
  checks: {
    dependencies: SecurityCheck;
    code_quality: SecurityCheck;
  };
}

const StatusIcon = ({ status }: { status: SecurityCheck['status'] }) => {
  switch (status) {
    case 'secure':
    case 'passing':
      return <ShieldCheck className='w-6 h-6 text-green-500' />;
    case 'vulnerable':
    case 'failing':
      return <ShieldAlert className='w-6 h-6 text-red-500' />;
    default:
      return <Bug className='w-6 h-6 text-yellow-500' />;
  }
};

const MetricCard = ({ label, value, description, icon: Icon, status }: any) => (
  <div className='bg-card border border-border rounded-2xl p-6 relative overflow-hidden group'>
    <div className='relative z-10'>
      <div className='flex items-center justify-between mb-4'>
        <div className='p-3 bg-muted rounded-xl text-primary group-hover:scale-110 transition-transform duration-500'>
          <Icon className='w-6 h-6' />
        </div>
        <div
          className={cn(
            'px-3 py-1 rounded-full text-[10px] font-black uppercase border',
            status === 'secure' || status === 'passing' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
          )}
        >
          {status}
        </div>
      </div>
      <h3 className='text-sm font-bold uppercase tracking-wider text-muted-foreground/70 mb-1'>{label}</h3>
      <div className='text-3xl font-bold font-abel text-foreground mb-2'>{value}</div>
      <p className='text-xs text-muted-foreground'>{description}</p>
    </div>
    <div className='absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-700'>
      <Icon className='w-24 h-24' />
    </div>
  </div>
);

export const SecurityProof = ({ report }: { report: SecurityReport }) => {
  const { dependencies, code_quality } = report.checks;

  return (
    <div className='flex flex-col gap-12'>
      <div className='flex flex-col gap-4'>
        <TextEffect per='char' preset='fade-in-blur' className='text-4xl md:text-5xl font-bold font-abel tracking-tight'>
          Security Transparency
        </TextEffect>
        <m.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className='text-lg text-muted-foreground max-w-2xl'>
          Real-time status of our dependency health and code quality. We believe security should be verified, not just claimed.
        </m.p>
      </div>

      <AnimatedGroup preset='blur-slide' className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <MetricCard
          label='Dependency Health'
          value={dependencies.status === 'secure' ? 'Secure' : `${dependencies.metrics.vulnerabilities} Vulns`}
          description={`Scanned ${dependencies.metrics.packages_count} packages via OSV-Scanner.`}
          icon={Lock}
          status={dependencies.status}
        />
        <MetricCard
          label='Code Quality'
          value={code_quality.status === 'passing' ? 'Clean' : `${code_quality.metrics.errors} Errors`}
          description={`Verified codebase health via Biome linting.`}
          icon={Code}
          status={code_quality.status}
        />
      </AnimatedGroup>

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className='p-6 bg-muted/30 border border-border rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4'
      >
        <div className='flex items-center gap-4'>
          <Zap className='w-5 h-5 text-primary' />
          <span className='text-sm text-muted-foreground font-mono'>Last automated audit: {new Date(report.generated_at).toLocaleString()}</span>
        </div>
        <div className='text-xs text-muted-foreground font-medium uppercase tracking-widest'>Verified Build Process ✓</div>
      </m.div>
    </div>
  );
};
