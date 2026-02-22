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

        // Enrich vulnerabilities with OSV (CVEs, Patched Versions) and FIRST (EPSS) data
        const enrichedVulnerabilities = await Promise.all(packageVulnerabilities.map(async (vuln: any) => {
            let cves: string[] = [];
            let epss: { score: string, percentile: string } | null = null;
            let patchedVersion = '';

            const advisoryId = vuln.url ? vuln.url.split('/').pop() : `ID-${vuln.id}`;

            try {
                if (advisoryId?.startsWith('GHSA')) {
                    const osvResponse = await fetch(`https://api.osv.dev/v1/vulns/${advisoryId}`);
                    if (osvResponse.ok) {
                        const osvData = await osvResponse.json() as any;
                        if (osvData.aliases) {
                            cves = osvData.aliases.filter((alias: string) => alias.startsWith('CVE-'));
                        }

                        if (osvData.affected) {
                            for (const affected of osvData.affected) {
                                if (affected.ranges) {
                                    for (const range of affected.ranges) {
                                        if (range.events) {
                                            for (const event of range.events) {
                                                if (event.fixed) {
                                                    patchedVersion = event.fixed;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('Error fetching OSV data:', e);
            }

            if (!patchedVersion && vuln.vulnerable_versions) {
                const match = vuln.vulnerable_versions.match(/[<]=? ?([0-9A-Za-z.\-]+)$/);
                if (match) {
                    patchedVersion = match[0].startsWith('<=') ? '> ' + match[1] : '>= ' + match[1];
                }
            } else if (patchedVersion) {
                patchedVersion = '>= ' + patchedVersion;
            }

            if (cves.length > 0) {
                try {
                    const epssResponse = await fetch(`https://api.first.org/data/v1/epss?cve=${cves[0]}`);
                    if (epssResponse.ok) {
                        const epssData = await epssResponse.json() as any;
                        if (epssData.data && epssData.data.length > 0) {
                            epss = {
                                score: epssData.data[0].epss,
                                percentile: epssData.data[0].percentile
                            };
                        }
                    }
                } catch (e) {
                    console.error('Error fetching EPSS data:', e);
                }
            }

            return {
                ...vuln,
                cves,
                epss,
                patched_versions: patchedVersion
            };
        }));

        // Sort vulnerabilities by severity
        const severityScores: Record<string, number> = {
            critical: 4,
            high: 3,
            moderate: 2,
            low: 1
        };

        enrichedVulnerabilities.sort((a: any, b: any) => {
            const scoreA = severityScores[a.severity] || 0;
            const scoreB = severityScores[b.severity] || 0;
            return scoreB - scoreA;
        });

        return NextResponse.json({
            package: packageName,
            version: targetVersion,
            vulnerabilities: enrichedVulnerabilities,
            checkedAt: new Date().toISOString(),
            summary: {
                total: enrichedVulnerabilities.length,
                severity: {
                    critical: enrichedVulnerabilities.filter((v: any) => v.severity === 'critical').length,
                    high: enrichedVulnerabilities.filter((v: any) => v.severity === 'high').length,
                    moderate: enrichedVulnerabilities.filter((v: any) => v.severity === 'moderate').length,
                    low: enrichedVulnerabilities.filter((v: any) => v.severity === 'low').length,
                }
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
