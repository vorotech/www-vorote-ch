import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const packageName = searchParams.get('package');

    if (!packageName) {
        return NextResponse.json({ error: 'Package name is required' }, { status: 400 });
    }

    try {
        // Fetch package info from npm registry
        const response = await fetch(`https://registry.npmjs.org/${packageName}`);

        if (!response.ok) {
            return NextResponse.json({ error: `Package "${packageName}" not found` }, { status: 404 });
        }

        const data = await response.json() as any;
        const latestVersion = data['dist-tags']?.latest;

        if (!latestVersion) {
            return NextResponse.json({ error: 'Could not determine latest version' }, { status: 500 });
        }

        // In a real implementation of mcp-security-audit, it might call the audit endpoint.
        // For this portfolio tool, we will simulate the audit by fetching advisories 
        // linked to this package or using a mock vulnerability check for demonstration.
        // NOTE: npm audit usually requires a full dependency tree.

        // Let's try to fetch advisories for this package specifically if possible
        const advisoriesResponse = await fetch(`https://registry.npmjs.org/-/npm/v1/security/advisories/bulk`, {
            method: 'POST',
            body: JSON.stringify({
                [packageName]: [latestVersion]
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const vulnerabilities = advisoriesResponse.ok ? await advisoriesResponse.json() as any : {};

        return NextResponse.json({
            package: packageName,
            version: latestVersion,
            vulnerabilities: vulnerabilities[packageName] || [],
            checkedAt: new Date().toISOString(),
            summary: {
                total: (vulnerabilities[packageName] || []).length,
                severity: {
                    high: (vulnerabilities[packageName] || []).filter((v: any) => v.severity === 'high').length,
                    moderate: (vulnerabilities[packageName] || []).filter((v: any) => v.severity === 'moderate').length,
                    low: (vulnerabilities[packageName] || []).filter((v: any) => v.severity === 'low').length,
                }
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
