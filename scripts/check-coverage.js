const fs = require('fs');

// Read coverage summary
const coverageSummary = JSON.parse(
  fs.readFileSync('./coverage/coverage-summary.json', 'utf8')
);

const THRESHOLD = 80;

// Get total coverage
const { total } = coverageSummary;
const lines = total.lines.pct;
const statements = total.statements.pct;
const functions = total.functions.pct;
const branches = total.branches.pct;

console.log('\nCoverage Summary:');
console.log('----------------');
console.log(`Lines: ${lines}%`);
console.log(`Statements: ${statements}%`);
console.log(`Functions: ${functions}%`);
console.log(`Branches: ${branches}%\n`);

if (
  lines < THRESHOLD ||
  statements < THRESHOLD ||
  functions < THRESHOLD ||
  branches < THRESHOLD
) {
  console.error(`❌ Coverage is below ${THRESHOLD}%`);
  process.exit(1);
}

console.log(`✅ All coverage metrics are above ${THRESHOLD}%`);
process.exit(0);
