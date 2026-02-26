'use client';

import { GridPattern } from '@/components/magicui/grid-pattern';
import { AnimatedGroup } from '@/components/motion-primitives/animated-group';
import { ProgressiveBlur } from '@/components/motion-primitives/progressive-blur';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { cn } from '@/lib/utils';
import { AlertTriangle, ArrowRight, Check, Copy, ExternalLink, Info, Loader2, Package, Search, ShieldAlert, ShieldCheck, Terminal } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import React, { useState, useEffect } from 'react';

interface Vulnerability {
  id: number;
  title: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  vulnerable_versions: string;
  patched_versions?: string;
  cwe: string[];
  cves?: string[];
  epss?: { score: string; percentile: string } | null;
  cvss: { score: number; vectorString: string };
  url: string;
}

interface AuditResult {
  package: string;
  version: string;
  vulnerabilities: Vulnerability[];
  checkedAt: string;
  summary: {
    total: number;
    severity: {
      critical: number;
      high: number;
      moderate: number;
      low: number;
    };
  };
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-600 border-red-600 bg-red-600/10 dark:text-red-400 dark:border-red-400 dark:bg-red-400/10',
  high: 'text-orange-500 border-orange-500 bg-orange-500/10 dark:text-orange-400 dark:border-orange-400 dark:bg-orange-400/10',
  moderate: 'text-yellow-500 border-yellow-500 bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-400 dark:bg-yellow-400/10',
  low: 'text-blue-500 border-blue-500 bg-blue-500/10 dark:text-blue-400 dark:border-blue-400 dark:bg-blue-400/10',
};

const CWE_DICTIONARY: Record<string, string> = {
  'CWE-20': 'Improper Input Validation',
  'CWE-22': "Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal')",
  'CWE-78': "Improper Neutralization of Special Elements used in an OS Command ('OS Command Injection')",
  'CWE-79': "Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')",
  'CWE-94': "Improper Control of Generation of Code ('Code Injection')",
  'CWE-185': 'Incorrect Regular Expression',
  'CWE-248': 'Uncaught Exception',
  'CWE-352': 'Cross-Site Request Forgery (CSRF)',
  'CWE-384': 'Session Fixation',
  'CWE-400': 'Uncontrolled Resource Consumption',
  'CWE-476': 'NULL Pointer Dereference',
  'CWE-502': 'Deserialization of Untrusted Data',
  'CWE-601': "URL Redirection to Untrusted Site ('Open Redirect')",
  'CWE-776': "Improper Restriction of Recursive Entity References in DTDs ('XML Bomb')",
  'CWE-862': 'Missing Authorization',
  'CWE-1333': 'Inefficient Regular Expression Complexity',
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  colorClass,
  delay = 0,
}: { label: string; value: string | number; icon?: any; colorClass?: string; delay?: number }) => (
  <m.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: 'easeOut' }}
    className='relative overflow-hidden bg-card border border-border rounded-2xl p-5 group hover:border-primary/40 transition-all duration-300 shadow-sm'
  >
    <div className='relative z-10 flex flex-col gap-1'>
      <span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5'>
        {Icon && <Icon className='w-3.5 h-3.5' />}
        {label}
      </span>
      <span className={cn('text-3xl font-bold font-abel leading-none mt-1', colorClass || 'text-foreground')}>{value}</span>
    </div>
    <div className='absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all duration-500'>
      {Icon && <Icon className='w-16 h-16' />}
    </div>
  </m.div>
);

const ScanningState = () => {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const steps = [
    'Connecting to security database...',
    'Fetching package manifest...',
    'Analyzing dependency tree...',
    'Checking known vulnerabilities...',
    'Calculating risk scores...',
    'Generating security report...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 15, 99));
    }, 800);

    const stepInterval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 1200);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='flex flex-col gap-8 py-16 items-center justify-center bg-card/50 border border-border border-dashed rounded-3xl'
    >
      <div className='relative'>
        <div className='absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse' />
        <div className='relative bg-card border border-border p-8 rounded-full shadow-2xl'>
          <Loader2 className='w-12 h-12 text-primary animate-spin' />
        </div>
      </div>
      <div className='flex flex-col items-center gap-4 max-w-sm w-full px-6'>
        <div className='flex justify-between w-full text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1'>
          <span className='animate-pulse'>{steps[step]}</span>
          <span>{Math.floor(progress)}%</span>
        </div>
        <div className='w-full h-1 bg-muted rounded-full overflow-hidden'>
          <m.div
            className='h-full bg-primary'
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
          />
        </div>
        <div className='flex gap-1'>
          {[0, 1, 2].map((i) => (
            <m.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              className='w-1 h-1 bg-primary rounded-full'
            />
          ))}
        </div>
      </div>
    </m.div>
  );
};

const SecurityAuditComponent: React.FC = () => {
  const [packageName, setPackageName] = useState('');
  const [result, setResult] = useState<AuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAudit = async (nameOverride?: string) => {
    const name = nameOverride || packageName;
    if (!name) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/security-audit?package=${encodeURIComponent(name)}`);
      const data = (await response.json()) as any;

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run audit');
      }

      setResult(data as AuditResult);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='max-w-4xl mx-auto px-4 py-12 relative'>
      <div className='flex flex-col gap-10'>
        {/* Header */}
        <div className='relative group'>
          <div className='flex flex-col md:flex-row md:items-center gap-6 relative z-10'>
            <div className='p-4 bg-primary/10 rounded-2xl text-primary ring-1 ring-primary/20 shadow-inner group-hover:scale-110 transition-transform duration-500'>
              <ShieldCheck className='w-10 h-10' />
            </div>
            <div>
              <TextEffect per='char' preset='fade-in-blur' className='text-4xl font-bold font-abel tracking-tight'>
                Security Audit Tool
              </TextEffect>
              <m.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className='text-muted-foreground mt-1 flex items-center gap-2'
              >
                <Terminal className='w-4 h-4' />
                Audit npm package dependencies for known vulnerabilities.
              </m.p>
            </div>
          </div>
        </div>

        {/* Search Box */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='relative bg-card rounded-3xl border border-border p-8 shadow-xl overflow-hidden group'
        >
          <GridPattern width={20} height={20} x={-1} y={-1} className='opacity-[0.03] group-hover:opacity-[0.05] transition-opacity' />

          <div className='relative z-10 flex flex-col md:flex-row gap-4'>
            <div className='relative flex-1 group/input'>
              <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-primary transition-colors' />
              <input
                type='text'
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAudit()}
                placeholder='Enter npm package name (e.g., lodash, express)'
                className='w-full pl-12 pr-4 py-4 bg-background/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono text-sm'
              />
            </div>
            <button
              onClick={() => handleAudit()}
              disabled={isLoading || !packageName}
              className='px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95'
            >
              {isLoading ? <Loader2 className='w-5 h-5 animate-spin' /> : <Search className='w-5 h-5' />}
              RUN AUDIT
            </button>
          </div>

          <div className='mt-6 flex flex-wrap gap-2 items-center relative z-10'>
            <span className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mr-2'>Quick Audit:</span>
            {['lodash', 'express', 'qs@6.11.0', 'react'].map((name) => (
              <button
                key={name}
                onClick={() => {
                  setPackageName(name);
                  handleAudit(name);
                }}
                className='px-4 py-1.5 text-xs bg-muted hover:bg-primary hover:text-primary-foreground rounded-full transition-all font-mono border border-border hover:border-primary shadow-sm'
              >
                {name}
              </button>
            ))}
          </div>
        </m.div>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='p-5 bg-destructive/5 border border-destructive/20 rounded-2xl text-destructive flex items-center gap-4'
            >
              <div className='p-2 bg-destructive/10 rounded-lg'>
                <AlertTriangle className='w-6 h-6' />
              </div>
              <div>
                <h4 className='font-bold'>Audit Failed</h4>
                <p className='text-sm opacity-90'>{error}</p>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {/* Results State */}
        <AnimatePresence mode='wait'>
          {isLoading ? (
            <ScanningState key='scanning' />
          ) : result ? (
            <m.div key='results' initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='flex flex-col gap-10'>
              {/* Summary Section */}
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                <div className='md:col-span-2 bg-card p-6 rounded-3xl border border-border shadow-sm flex flex-col justify-between overflow-hidden relative group'>
                  <div className='relative z-10 flex flex-col gap-1'>
                    <span className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-1.5'>
                      <Package className='w-3.5 h-3.5' />
                      Target Package
                    </span>
                    <h2 className='text-3xl font-bold font-abel truncate group-hover:text-primary transition-colors' title={result.package}>
                      {result.package}
                    </h2>
                    <span className='text-xs font-mono text-muted-foreground flex items-center gap-1 mt-1 bg-muted w-fit px-2 py-0.5 rounded'>
                      v{result.version}
                    </span>
                  </div>
                  <div className='absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.05] group-hover:scale-110 transition-transform duration-700'>
                    <Package className='w-24 h-24' />
                  </div>
                </div>

                <StatCard
                  label='Critical'
                  value={result.summary.severity.critical}
                  icon={AlertTriangle}
                  colorClass='text-red-600 dark:text-red-400'
                  delay={0.1}
                />
                <StatCard label='High' value={result.summary.severity.high} icon={ShieldAlert} colorClass='text-orange-500' delay={0.2} />
                <StatCard label='Moderate' value={result.summary.severity.moderate} icon={Info} colorClass='text-yellow-500' delay={0.3} />
              </div>

              {/* Detailed List */}
              <div className='flex flex-col gap-6'>
                <div className='flex items-center justify-between px-1'>
                  <h3 className='text-xl font-bold font-abel flex items-center gap-3'>
                    <Terminal className='w-5 h-5 text-primary' />
                    Detailed Findings
                  </h3>
                  <span className='text-[10px] font-mono font-bold bg-muted px-3 py-1 rounded-full uppercase tracking-tighter text-muted-foreground'>
                    {result.summary.total} Issues Detected
                  </span>
                </div>

                {result.vulnerabilities.length === 0 ? (
                  <m.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className='bg-green-500/5 border border-green-500/20 rounded-3xl p-16 flex flex-col items-center text-center gap-6'
                  >
                    <div className='p-6 bg-green-500/10 rounded-full text-green-500 ring-4 ring-green-500/5 animate-bounce-subtle'>
                      <ShieldCheck className='w-16 h-16' />
                    </div>
                    <div className='max-w-md'>
                      <h4 className='text-2xl font-bold text-green-700 dark:text-green-400 font-abel'>Clean Security Report</h4>
                      <p className='text-muted-foreground mt-2'>
                        No known security advisories found for {result.package}@v{result.version}. Your build environment remains secure.
                      </p>
                    </div>
                  </m.div>
                ) : (
                  <AnimatedGroup preset='blur-slide' className='flex flex-col gap-4'>
                    {result.vulnerabilities.map((vuln) => (
                      <div
                        key={vuln.id}
                        className='bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 group/item shadow-sm hover:shadow-xl hover:shadow-primary/5'
                      >
                        <div className='p-6 flex flex-col gap-6'>
                          <div className='flex items-start justify-between gap-6'>
                            <div className='flex flex-col gap-3 min-w-0'>
                              <div className='flex items-center gap-3 flex-wrap'>
                                <span className={cn('px-2.5 py-0.5 text-[10px] font-black uppercase rounded-md border', SEVERITY_COLORS[vuln.severity])}>
                                  {vuln.severity}
                                </span>
                                {vuln.cvss?.score && (
                                  <span className='px-2.5 py-0.5 text-[10px] font-black uppercase text-muted-foreground bg-muted rounded-md border border-border/50'>
                                    CVSS: {vuln.cvss.score}
                                  </span>
                                )}
                                <h4 className='text-lg font-bold group-hover/item:text-primary transition-colors leading-tight break-words font-abel tracking-tight'>
                                  {vuln.title}
                                </h4>
                              </div>
                            </div>
                            <a
                              href={vuln.url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='p-3 bg-muted hover:bg-primary/10 hover:text-primary rounded-xl transition-all shrink-0 active:scale-90'
                              title='View Advisory'
                            >
                              <ExternalLink className='w-5 h-5' />
                            </a>
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-muted/20 p-6 rounded-2xl border border-border/40 relative overflow-hidden'>
                            <div className='flex flex-col gap-2'>
                              <span className='text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 tracking-widest'>
                                <AlertTriangle className='w-3 h-3 text-orange-500' /> Affected
                              </span>
                              <span className='text-sm font-mono text-foreground font-medium bg-background/50 px-2 py-1 rounded w-fit border border-border/30'>
                                {vuln.vulnerable_versions}
                              </span>
                            </div>
                            <div className='flex flex-col gap-2'>
                              <span className='text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 tracking-widest'>
                                <ShieldCheck className='w-3 h-3 text-green-500' /> Patched
                              </span>
                              <span className='text-sm font-mono text-foreground font-medium bg-background/50 px-2 py-1 rounded w-fit border border-border/30'>
                                {vuln.patched_versions || 'See Advisory'}
                              </span>
                            </div>

                            {vuln.cves && vuln.cves.length > 0 && (
                              <div className='flex flex-col gap-2'>
                                <span className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>CVE Identifiers</span>
                                <div className='flex flex-wrap gap-2'>
                                  {vuln.cves.map((cve) => (
                                    <button
                                      key={cve}
                                      onClick={() => handleCopy(cve, `${vuln.id}-${cve}`)}
                                      className='group flex items-center gap-2 text-xs font-mono text-foreground/80 font-bold bg-background border border-border px-3 py-1 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all'
                                    >
                                      {cve}
                                      {copiedId === `${vuln.id}-${cve}` ? (
                                        <Check className='w-3 h-3' />
                                      ) : (
                                        <Copy className='w-3 h-3 opacity-30 group-hover:opacity-100' />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {vuln.epss && (
                              <div className='flex flex-col gap-2'>
                                <span className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5'>
                                  EPSS Score
                                  <span title='Exploit Prediction Scoring System estimates the probability of exploitation in the wild.'>
                                    <Info className='w-3 h-3 cursor-help' />
                                  </span>
                                </span>
                                <span className='text-sm font-mono font-bold' title={`Percentile: ${(Number(vuln.epss.percentile) * 100).toFixed(2)}%`}>
                                  {(Number(vuln.epss.score) * 100).toFixed(3)}% Probability
                                </span>
                              </div>
                            )}

                            {vuln.cwe && vuln.cwe.length > 0 && (
                              <div className='flex flex-col gap-2 md:col-span-2'>
                                <span className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>Weakness Enumeration (CWE)</span>
                                <div className='flex flex-wrap gap-2'>
                                  {vuln.cwe.map((c) => (
                                    <a
                                      key={c}
                                      href={`https://cwe.mitre.org/data/definitions/${c.split('-')[1]}.html`}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      title={CWE_DICTIONARY[c] || 'Common Weakness Enumeration'}
                                      className='text-xs font-mono bg-background border border-border px-3 py-1 rounded-lg text-foreground/70 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-2'
                                    >
                                      {c}
                                      <ArrowRight className='w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity' />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </AnimatedGroup>
                )}
              </div>
            </m.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SecurityAuditComponent;
