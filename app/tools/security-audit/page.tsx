import Layout from '@/components/layout/layout';
import SecurityAuditComponent from '@/components/tools/security-audit/security-audit-component';
import React from 'react';

export const metadata = {
  title: 'Security Audit Tool',
  description: 'Audit npm package dependencies for vulnerabilities.',
};

export default function SecurityAuditPage() {
  return (
    <Layout>
      <div className='container mx-auto px-6 py-12 max-w-6xl'>
        <SecurityAuditComponent />
      </div>
    </Layout>
  );
}
