#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

THRESHOLD=80
COVERAGE_FILE="./coverage/coverage-final.json"

# Function to calculate percentage
calculate_percentage() {
    local covered=$1
    local total=$2
    
    # Convert null or empty to 0
    covered=${covered:-0}
    total=${total:-0}
    
    # Handle division by zero
    if [ "$total" -eq 0 ]; then
        echo "100"
    else
        echo "scale=2; ($covered * 100) / $total" | bc
    fi
}

# Function to print colored coverage
print_coverage() {
    local name=$1
    local value=$2
    if (( $(echo "$value < $THRESHOLD" | bc -l) )); then
        echo -e "$name: ${RED}${value}%${NC}"
    else
        echo -e "$name: ${GREEN}${value}%${NC}"
    fi
}

# Function to safely get json value
get_json_value() {
    local json=$1
    local field=$2
    local value
    
    # Get value and handle null/missing
    value=$(echo "$json" | jq -r "if .$field.total == null then \"0\" else \".$field.total\" end")
    if [ "$value" = "null" ] || [ -z "$value" ]; then
        echo "0"
    else
        echo "$value"
    fi
}

# Get changed files
if [ -n "$GITHUB_BASE_REF" ]; then
    # PR mode - get all changes between base branch and current HEAD
    echo -e "${BLUE}Fetching base branch...${NC}"
    git fetch origin "$GITHUB_BASE_REF" --depth=1
    MERGE_BASE=$(git merge-base "origin/$GITHUB_BASE_REF" HEAD)
    CHANGED_FILES=$(git diff --name-only "$MERGE_BASE" HEAD | grep -E '\.tsx?$' || true)
    echo -e "${BLUE}Comparing changes with base branch: ${CYAN}$GITHUB_BASE_REF${NC}"
else
    # Push mode - compare with the parent of the first commit in the branch
    BRANCH_FIRST_COMMIT=$(git rev-list --max-parents=0 HEAD)
    if [ "$(git rev-parse --abbrev-ref HEAD)" = "preview" ]; then
        # On preview branch, get all changes
        CHANGED_FILES=$(git diff --name-only "$BRANCH_FIRST_COMMIT" HEAD | grep -E '\.tsx?$' || true)
        echo -e "${BLUE}Checking all changes in preview branch${NC}"
    else
        # On feature branch, get changes since branching from preview
        MERGE_BASE=$(git merge-base preview HEAD)
        CHANGED_FILES=$(git diff --name-only "$MERGE_BASE" HEAD | grep -E '\.tsx?$' || true)
        echo -e "${BLUE}Comparing changes with preview branch${NC}"
    fi
fi

if [ -z "$CHANGED_FILES" ]; then
    echo -e "${YELLOW}No TypeScript/React files changed${NC}"
    exit 0
fi

echo -e "\n${BLUE}Changed files:${NC}"
echo -e "${CYAN}$CHANGED_FILES${NC}"

# Initialize counters
TOTAL_STATEMENTS=0
COVERED_STATEMENTS=0
TOTAL_BRANCHES=0
COVERED_BRANCHES=0
TOTAL_FUNCTIONS=0
COVERED_FUNCTIONS=0
TOTAL_LINES=0
COVERED_LINES=0

# Process each file
while IFS= read -r file; do
    [ -z "$file" ] && continue
    
    echo -e "\n${BLUE}Analyzing: ${CYAN}$file${NC}"
    
    # Extract coverage data for the file using jq
    FILE_DATA=$(jq --arg file "$file" '.[$file] // {}' "$COVERAGE_FILE")
    if [ -n "$FILE_DATA" ] && [ "$FILE_DATA" != "null" ]; then
        # Statements
        STATEMENTS_TOTAL=$(echo "$FILE_DATA" | jq '.s.total // 0')
        STATEMENTS_COVERED=$(echo "$FILE_DATA" | jq '.s.covered // 0')
        TOTAL_STATEMENTS=$((TOTAL_STATEMENTS + STATEMENTS_TOTAL))
        COVERED_STATEMENTS=$((COVERED_STATEMENTS + STATEMENTS_COVERED))
        
        # Branches
        BRANCHES_TOTAL=$(echo "$FILE_DATA" | jq '.b.total // 0')
        BRANCHES_COVERED=$(echo "$FILE_DATA" | jq '.b.covered // 0')
        TOTAL_BRANCHES=$((TOTAL_BRANCHES + BRANCHES_TOTAL))
        COVERED_BRANCHES=$((COVERED_BRANCHES + BRANCHES_COVERED))
        
        # Functions
        FUNCTIONS_TOTAL=$(echo "$FILE_DATA" | jq '.f.total // 0')
        FUNCTIONS_COVERED=$(echo "$FILE_DATA" | jq '.f.covered // 0')
        TOTAL_FUNCTIONS=$((TOTAL_FUNCTIONS + FUNCTIONS_TOTAL))
        COVERED_FUNCTIONS=$((COVERED_FUNCTIONS + FUNCTIONS_COVERED))
        
        # Lines
        LINES_TOTAL=$(echo "$FILE_DATA" | jq '.l.total // 0')
        LINES_COVERED=$(echo "$FILE_DATA" | jq '.l.covered // 0')
        TOTAL_LINES=$((TOTAL_LINES + LINES_TOTAL))
        COVERED_LINES=$((COVERED_LINES + LINES_COVERED))
        
        # Print file coverage
        STATEMENTS_PCT=$(calculate_percentage "$STATEMENTS_COVERED" "$STATEMENTS_TOTAL")
        BRANCHES_PCT=$(calculate_percentage "$BRANCHES_COVERED" "$BRANCHES_TOTAL")
        FUNCTIONS_PCT=$(calculate_percentage "$FUNCTIONS_COVERED" "$FUNCTIONS_TOTAL")
        LINES_PCT=$(calculate_percentage "$LINES_COVERED" "$LINES_TOTAL")
        
        print_coverage "Statements" "$STATEMENTS_PCT"
        print_coverage "Branches" "$BRANCHES_PCT"
        print_coverage "Functions" "$FUNCTIONS_PCT"
        print_coverage "Lines" "$LINES_PCT"
    else
        echo -e "${YELLOW}No coverage data found for $file${NC}"
    fi
done <<< "$CHANGED_FILES"

# Calculate total percentages
STATEMENTS_PCT=$(calculate_percentage "$COVERED_STATEMENTS" "$TOTAL_STATEMENTS")
BRANCHES_PCT=$(calculate_percentage "$COVERED_BRANCHES" "$TOTAL_BRANCHES")
FUNCTIONS_PCT=$(calculate_percentage "$COVERED_FUNCTIONS" "$TOTAL_FUNCTIONS")
LINES_PCT=$(calculate_percentage "$COVERED_LINES" "$TOTAL_LINES")

echo -e "\n${BLUE}Overall coverage for changed files:${NC}"
echo -e "${BLUE}----------------------------------${NC}"
print_coverage "Statements" "$STATEMENTS_PCT"
print_coverage "Branches" "$BRANCHES_PCT"
print_coverage "Functions" "$FUNCTIONS_PCT"
print_coverage "Lines" "$LINES_PCT"

# Check if any metric is below threshold
if (( $(echo "$STATEMENTS_PCT < $THRESHOLD" | bc -l) )) || \
   (( $(echo "$BRANCHES_PCT < $THRESHOLD" | bc -l) )) || \
   (( $(echo "$FUNCTIONS_PCT < $THRESHOLD" | bc -l) )) || \
   (( $(echo "$LINES_PCT < $THRESHOLD" | bc -l) )); then
    echo -e "\n${RED}❌ Coverage for changed files is below ${THRESHOLD}%${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ All coverage metrics for changed files are above ${THRESHOLD}%${NC}"
exit 0
