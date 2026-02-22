"use client";

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Search, Loader2, AlertTriangle, ExternalLink, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

const SEVERITY_COLORS = {
    critical: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    moderate: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
};

const SecurityAuditComponent = () => {
    const [packageName, setPackageName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AuditResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAudit = async (nameOverride?: string) => {
        const name = nameOverride || packageName;
        if (!name) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(`/api/security-audit?package=${encodeURIComponent(name)}`);
            const data = await response.json() as any;

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
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold font-abel">Security Audit Tool</h1>
                        <p className="text-muted-foreground">Audit npm package dependencies for vulnerabilities.</p>
                    </div>
                </div>

                {/* Search Box */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                value={packageName}
                                onChange={(e) => setPackageName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAudit()}
                                placeholder="Enter npm package name (e.g., lodash, express)"
                                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={() => handleAudit()}
                            disabled={isLoading || !packageName}
                            className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            Run Audit
                        </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-muted-foreground mr-2">Try:</span>
                        {['lodash', 'express', 'qs@6.11.0', 'fast-xml-parser@5.2.5', 'react'].map((name) => (
                            <button
                                key={name}
                                onClick={() => {
                                    setPackageName(name);
                                    handleAudit(name);
                                }}
                                className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded-full transition-colors font-medium border border-border"
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error State */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive flex items-center gap-3"
                        >
                            <AlertTriangle className="w-5 h-5" />
                            <p className="font-medium">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results State */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col gap-6"
                        >
                            {/* Summary Card */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2 md:col-span-2 overflow-hidden">
                                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Package</span>
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <h2 className="text-2xl font-bold truncate" title={result.package}>{result.package}</h2>
                                        <span className="text-muted-foreground font-mono truncate">v{result.version}</span>
                                    </div>
                                </div>
                                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2 md:col-span-3 overflow-x-auto">
                                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Vulnerability Summary</span>
                                    <div className="flex gap-6 md:gap-8 min-w-max">
                                        <div className="flex flex-col">
                                            <span className="text-3xl font-bold text-foreground">{result.summary.total}</span>
                                            <span className="text-xs text-muted-foreground font-medium uppercase">Total</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-3xl font-bold text-red-600 dark:text-red-400">{result.summary.severity.critical}</span>
                                            <span className="text-xs text-muted-foreground font-medium uppercase">Critical</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-3xl font-bold text-orange-500">{result.summary.severity.high}</span>
                                            <span className="text-xs text-muted-foreground font-medium uppercase">High</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-3xl font-bold text-yellow-500">{result.summary.severity.moderate}</span>
                                            <span className="text-xs text-muted-foreground font-medium uppercase">Moderate</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-3xl font-bold text-blue-400">{result.summary.severity.low}</span>
                                            <span className="text-xs text-muted-foreground font-medium uppercase">Low</span>
                                        </div>
                                        <div className="flex flex-col text-green-500 justify-center">
                                            {result.summary.total === 0 && (
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck className="w-6 h-6" />
                                                    <span className="font-bold">Safe</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed List */}
                            <div className="flex flex-col gap-4">
                                <h3 className="text-xl font-bold px-1">Detailed Findings</h3>
                                {result.vulnerabilities.length === 0 ? (
                                    <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-12 flex flex-col items-center text-center gap-4">
                                        <div className="p-4 bg-green-500/10 rounded-full text-green-500">
                                            <ShieldCheck className="w-12 h-12" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-green-700 dark:text-green-400">No Vulnerabilities Found</h4>
                                            <p className="text-muted-foreground">This package version currently has no known security advisories.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {result.vulnerabilities.map((vuln) => {
                                            return (
                                                <div
                                                    key={vuln.id}
                                                    className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-all group"
                                                >
                                                    <div className="p-6 flex flex-col gap-4">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex flex-col gap-1 min-w-0">
                                                                <div className="flex items-center gap-3 flex-wrap">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${SEVERITY_COLORS[vuln.severity] || ''}`}>
                                                                            {vuln.severity}
                                                                        </span>
                                                                        {vuln.cvss?.score && (
                                                                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground bg-muted rounded border border-border/50">
                                                                                CVSS: {vuln.cvss.score}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <h4 className="text-lg font-bold group-hover:text-primary transition-colors leading-tight break-words">{vuln.title}</h4>
                                                                </div>
                                                                <div className="flex flex-col gap-1.5 mt-2">
                                                                    {vuln.cves && vuln.cves.length > 0 && (
                                                                        <span className="text-xs font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded border border-border/40 w-fit">
                                                                            {vuln.cves.join(', ')}
                                                                        </span>
                                                                    )}
                                                                    {vuln.epss && (
                                                                        <span className="text-xs font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded border border-border/40 w-fit" title={`Percentile: ${(Number(vuln.epss.percentile) * 100).toFixed(2)}%`}>
                                                                            EPSS: {(Number(vuln.epss.score) * 100).toFixed(3)}%
                                                                        </span>
                                                                    )}
                                                                    {(() => {
                                                                        const advisoryId = vuln.url ? vuln.url.split('/').pop() : `ID-${vuln.id}`;
                                                                        if (advisoryId?.startsWith('GHSA')) {
                                                                            return (
                                                                                <span className="text-xs font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded border border-border/40 w-fit">
                                                                                    GHSA ID: {advisoryId}
                                                                                </span>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    })()}
                                                                </div>
                                                            </div>
                                                            <a
                                                                href={vuln.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 bg-muted hover:bg-primary/10 hover:text-primary rounded-lg transition-all shrink-0"
                                                                title="View Advisory"
                                                            >
                                                                <ExternalLink className="w-5 h-5" />
                                                            </a>
                                                        </div>

                                                        <div className="flex flex-col gap-3 mt-2">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-orange-500" /> Affected Versions</span>
                                                                    <span className="text-sm font-mono text-foreground/90 font-medium">{vuln.vulnerable_versions}</span>
                                                                </div>
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-green-500" /> Patched Versions</span>
                                                                    <span className="text-sm font-mono text-foreground/90 font-medium">{vuln.patched_versions || 'See Advisory'}</span>
                                                                </div>
                                                                {vuln.cwe && vuln.cwe.length > 0 && (
                                                                    <div className="flex flex-col gap-1 md:col-span-2 mt-2 pt-3 border-t border-border/50">
                                                                        <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> CWE Weaknesses</span>
                                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                                            {vuln.cwe.map(c => (
                                                                                <a key={c} href={`https://cwe.mitre.org/data/definitions/${c.split('-')[1]}.html`} target="_blank" rel="noopener noreferrer" title="View Common Weakness Enumeration details on Mitre.org" className="text-xs font-mono bg-background border border-border px-2 py-1 rounded text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all">
                                                                                    {c}
                                                                                </a>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SecurityAuditComponent;
