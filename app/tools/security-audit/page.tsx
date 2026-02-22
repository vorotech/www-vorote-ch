import React from "react";
import Layout from "@/components/layout/layout";
import SecurityAuditComponent from "@/components/tools/security-audit/security-audit-component";

export const metadata = {
    title: "Security Audit Tool",
    description: "Audit npm package dependencies for vulnerabilities.",
};

export default function SecurityAuditPage() {
    return (
        <Layout>
            <div className="container mx-auto px-6 py-12 max-w-6xl">
                <SecurityAuditComponent />
            </div>
        </Layout>
    );
}
