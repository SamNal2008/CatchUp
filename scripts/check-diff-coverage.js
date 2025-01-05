const { execSync } = require('child_process');
const fs = require('fs');

const THRESHOLD = 80;

function getChangedFiles() {
  try {
    // If we're in a PR
    if (process.env.GITHUB_BASE_REF) {
      const base = process.env.GITHUB_BASE_REF;
      const diff = execSync(`git diff --name-only origin/${base}...HEAD`)
        .toString()
        .trim()
        .split('\n');
      return diff.filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));
    }
    // If we're in a push
    const diff = execSync('git diff --name-only HEAD^')
      .toString()
      .trim()
      .split('\n');
    return diff.filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));
  } catch (error) {
    console.error('Error getting changed files:', error);
    process.exit(1);
  }
}

function normalizePath(path) {
  // Convert absolute paths to relative and normalize slashes
  return path.replace(process.cwd(), '').replace(/^\//, '');
}

// Read coverage data
const coverage = JSON.parse(
  fs.readFileSync('./coverage/coverage-final.json', 'utf8')
);

// Get changed files
const changedFiles = getChangedFiles();
console.log('\nChanged files:', changedFiles);

// Filter coverage data for changed files
const changedFilesCoverage = Object.entries(coverage).reduce(
  (acc, [file, data]) => {
    const normalizedFile = normalizePath(file);
    if (changedFiles.includes(normalizedFile)) {
      acc[normalizedFile] = data;
    }
    return acc;
  },
  {}
);

if (Object.keys(changedFilesCoverage).length === 0) {
  console.log('No coverage data for changed files');
  process.exit(0);
}

// Calculate coverage for changed files
let totalStatements = 0;
let coveredStatements = 0;
let totalBranches = 0;
let coveredBranches = 0;
let totalFunctions = 0;
let coveredFunctions = 0;
let totalLines = 0;
let coveredLines = 0;

Object.entries(changedFilesCoverage).forEach(([file, data]) => {
  console.log(`\nFile: ${file}`);
  
  // Statements
  const statementsCov = (data.s.covered / data.s.total) * 100;
  console.log(`Statements: ${statementsCov.toFixed(2)}%`);
  totalStatements += data.s.total;
  coveredStatements += data.s.covered;

  // Branches
  const branchesCov = data.b.total ? (data.b.covered / data.b.total) * 100 : 100;
  console.log(`Branches: ${branchesCov.toFixed(2)}%`);
  totalBranches += data.b.total;
  coveredBranches += data.b.covered;

  // Functions
  const functionsCov = data.f.total ? (data.f.covered / data.f.total) * 100 : 100;
  console.log(`Functions: ${functionsCov.toFixed(2)}%`);
  totalFunctions += data.f.total;
  coveredFunctions += data.f.covered;

  // Lines
  const linesCov = (data.l.covered / data.l.total) * 100;
  console.log(`Lines: ${linesCov.toFixed(2)}%`);
  totalLines += data.l.total;
  coveredLines += data.l.covered;
});

// Calculate total percentages
const totalStatementsCov = (coveredStatements / totalStatements) * 100;
const totalBranchesCov = totalBranches ? (coveredBranches / totalBranches) * 100 : 100;
const totalFunctionsCov = totalFunctions ? (coveredFunctions / totalFunctions) * 100 : 100;
const totalLinesCov = (coveredLines / totalLines) * 100;

console.log('\nOverall coverage for changed files:');
console.log('----------------------------------');
console.log(`Statements: ${totalStatementsCov.toFixed(2)}%`);
console.log(`Branches: ${totalBranchesCov.toFixed(2)}%`);
console.log(`Functions: ${totalFunctionsCov.toFixed(2)}%`);
console.log(`Lines: ${totalLinesCov.toFixed(2)}%`);

// Check if any metric is below threshold
if (
  totalStatementsCov < THRESHOLD ||
  totalBranchesCov < THRESHOLD ||
  totalFunctionsCov < THRESHOLD ||
  totalLinesCov < THRESHOLD
) {
  console.error(`\n❌ Coverage for changed files is below ${THRESHOLD}%`);
  process.exit(1);
}

console.log(`\n✅ All coverage metrics for changed files are above ${THRESHOLD}%`);
process.exit(0);
