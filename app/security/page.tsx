import fs from 'fs';
import path from 'path';
import { Section } from '@/components/layout/section';
import { SecurityProof } from '@/components/security-proof';
import React from 'react';

export const revalidate = 3600; // Revalidate every hour

async function getSecurityReport() {
  try {
    const reportPath = path.join(process.cwd(), 'app/security/security-report.json');
    if (!fs.existsSync(reportPath)) {
      return null;
    }
    const reportContent = fs.readFileSync(reportPath, 'utf8');
    return JSON.parse(reportContent);
  } catch (error) {
    console.error('Failed to load security report:', error);
    return null;
  }
}

export default async function SecurityPage() {
  const report = await getSecurityReport();

  return (
    <div className='min-h-screen bg-background pt-24 pb-12'>
      <Section showGrid={true} className='max-w-4xl mx-auto px-4'>
        {report ? (
          <SecurityProof report={report} />
        ) : (
          <div className='flex flex-col gap-6 py-24 items-center justify-center bg-card border border-border border-dashed rounded-3xl'>
            <div className='p-6 bg-yellow-500/10 rounded-full text-yellow-500 ring-4 ring-yellow-500/5'>
              <SecurityProof
                report={{
                  generated_at: new Date().toISOString(),
                  checks: {
                    dependencies: { name: 'OSV', status: 'error', metrics: {} },
                    code_quality: { name: 'Biome', status: 'error', metrics: {} },
                  },
                }}
              />
            </div>
            <p className='text-muted-foreground mt-4 italic'>Security report generation is currently in progress.</p>
          </div>
        )}
      </Section>
    </div>
  );
}
