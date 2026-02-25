const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Runs a command and returns the output and success status.
 */
function runCommand(command) {
  try {
    const stdout = execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return { success: true, stdout };
  } catch (error) {
    return {
      success: false,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      exitCode: error.status,
    };
  }
}

console.log('Generating security report...');

// 1. Run OSV Scanner
console.log('Running OSV Scanner...');
// We use 'scan source --format json .' based on our previous test
const osvResult = runCommand('osv-scanner scan source --format json .');
let osvData = { results: [] };
let osvStatus = 'error';

if (osvResult.success || osvResult.stdout) {
  try {
    osvData = JSON.parse(osvResult.stdout);
    const vulnerabilities =
      osvData.results?.reduce((acc, result) => {
        return acc + (result.packages?.reduce((pAcc, pkg) => pAcc + (pkg.vulnerabilities?.length || 0), 0) || 0);
      }, 0) || 0;

    osvStatus = vulnerabilities === 0 ? 'secure' : 'vulnerable';
    osvData = {
      vulnerabilities,
      scanned_at: new Date().toISOString(),
      packages_count: osvData.results?.[0]?.packages?.length || 0,
    };
  } catch (e) {
    console.error('Failed to parse OSV output:', e);
    osvStatus = 'parse_error';
  }
}

// 2. Run Biome Check
console.log('Running Biome Check...');
const biomeResult = runCommand('pnpm biome check .');
const biomeStatus = biomeResult.success ? 'passing' : 'failing';
// Try to extract number of errors if failing
let biomeErrors = 0;
if (!biomeResult.success) {
  const match = biomeResult.stdout.match(/Found (\d+) errors/);
  if (match) {
    biomeErrors = parseInt(match[1], 10);
  } else {
    biomeErrors = 'multiple';
  }
}

const report = {
  generated_at: new Date().toISOString(),
  checks: {
    dependencies: {
      name: 'OSV Dependency Scan',
      status: osvStatus,
      metrics: osvData,
    },
    code_quality: {
      name: 'Biome Code Health',
      status: biomeStatus,
      metrics: {
        errors: biomeErrors,
      },
    },
  },
};

const outputDir = path.join(__dirname, '../app/security');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'security-report.json');
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

console.log(`Security report generated at ${outputPath}`);
console.log('Summary:', JSON.stringify(report.checks, null, 2));
