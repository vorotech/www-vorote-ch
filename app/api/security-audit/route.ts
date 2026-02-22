import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const rawPackage = searchParams.get('package');

    if (!rawPackage) {
        return NextResponse.json({ error: 'Package name is required' }, { status: 400 });
    }

    let packageName = rawPackage;
    let requestedVersion = '';

    // Handle scoped packages and versions (e.g., @org/pkg@1.0.0 or pkg@1.0.0)
    if (packageName.startsWith('@')) {
        const parts = packageName.slice(1).split('@');
        if (parts.length > 1) {
            packageName = '@' + parts[0];
            requestedVersion = parts.slice(1).join('@');
        } else {
            packageName = '@' + parts[0];
        }
    } else {
        const parts = packageName.split('@');
        if (parts.length > 1) {
            packageName = parts[0];
            requestedVersion = parts.slice(1).join('@');
        }
    }

    try {
        // Fetch package info from npm registry
        const response = await fetch(`https://registry.npmjs.org/${packageName}`);

        if (!response.ok) {
            return NextResponse.json({ error: `Package "${packageName}" not found` }, { status: 404 });
        }

        const data = await response.json() as any;
        const latestVersion = data['dist-tags']?.latest;

        let targetVersion = requestedVersion || latestVersion;

        if (!targetVersion) {
            return NextResponse.json({ error: 'Could not determine version to check' }, { status: 500 });
        }

        if (requestedVersion && !data.versions[requestedVersion]) {
            return NextResponse.json({ error: `Version "${requestedVersion}" not found for package "${packageName}"` }, { status: 404 });
        }

        // In a real implementation of mcp-security-audit, it might call the audit endpoint.
        // For this portfolio tool, we will simulate the audit by fetching advisories 
        // linked to this package or using a mock vulnerability check for demonstration.
        // NOTE: npm audit usually requires a full dependency tree.

        // Let's try to fetch advisories for this package specifically if possible
        const advisoriesResponse = await fetch(`https://registry.npmjs.org/-/npm/v1/security/advisories/bulk`, {
            method: 'POST',
            body: JSON.stringify({
                [packageName]: [targetVersion]
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const advisoriesData = advisoriesResponse.ok ? await advisoriesResponse.json() as any : {};
        const packageVulnerabilities = advisoriesData[packageName] || [];

        // Sort vulnerabilities by severity
        const severityScores: Record<string, number> = {
            critical: 4,
            high: 3,
            moderate: 2,
            low: 1
        };

        packageVulnerabilities.sort((a: any, b: any) => {
            const scoreA = severityScores[a.severity] || 0;
            const scoreB = severityScores[b.severity] || 0;
            return scoreB - scoreA;
        });

        return NextResponse.json({
            package: packageName,
            version: targetVersion,
            vulnerabilities: packageVulnerabilities,
            checkedAt: new Date().toISOString(),
            summary: {
                total: packageVulnerabilities.length,
                severity: {
                    critical: packageVulnerabilities.filter((v: any) => v.severity === 'critical').length,
                    high: packageVulnerabilities.filter((v: any) => v.severity === 'high').length,
                    moderate: packageVulnerabilities.filter((v: any) => v.severity === 'moderate').length,
                    low: packageVulnerabilities.filter((v: any) => v.severity === 'low').length,
                }
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
