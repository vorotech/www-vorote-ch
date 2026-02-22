'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export const Table = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <div className="my-8 w-full overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.02] backdrop-blur-md shadow-md">
            <div className="overflow-x-auto">
                <table className={cn("w-full border-collapse text-left text-sm", className)}>
                    {children}
                </table>
            </div>
        </div>
    );
};

export const THead = ({ children }: { children: React.ReactNode }) => {
    return (
        <thead className="border-b border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.05] font-heading font-bold uppercase tracking-wider text-black/70 dark:text-white/70">
            {children}
        </thead>
    );
};

export const TBody = ({ children }: { children: React.ReactNode }) => {
    return (
        <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {children}
        </tbody>
    );
};

export const TR = ({ children }: { children: React.ReactNode }) => {
    return (
        <tr className="group transition-colors hover:bg-black/[0.01] dark:hover:bg-white/[0.02]">
            {children}
        </tr>
    );
};

export const TH = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <th className={cn("px-6 py-4 font-bold text-black/90 dark:text-white/90", className)}>
            {children}
        </th>
    );
};

export const TD = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <td className={cn("px-6 py-4 font-medium text-black/80 dark:text-white/80 group-hover:text-black dark:group-hover:text-white transition-colors", className)}>
            {children}
        </td>
    );
};
