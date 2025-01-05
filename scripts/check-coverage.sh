#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

THRESHOLD=80
COVERAGE_FILE="./coverage/coverage-summary.json"

if [ ! -f "$COVERAGE_FILE" ]; then
    echo -e "${RED}Error: Coverage file not found: $COVERAGE_FILE${NC}"
    exit 1
fi

# Extract coverage metrics using jq
LINES=$(jq -r '.total.lines.pct' "$COVERAGE_FILE")
STATEMENTS=$(jq -r '.total.statements.pct' "$COVERAGE_FILE")
FUNCTIONS=$(jq -r '.total.functions.pct' "$COVERAGE_FILE")
BRANCHES=$(jq -r '.total.branches.pct' "$COVERAGE_FILE")

echo -e "\n${BLUE}Coverage Summary:${NC}"
echo -e "${BLUE}----------------${NC}"

# Function to color coverage percentage
print_coverage() {
    local name=$1
    local value=$2
    if (( $(echo "$value < $THRESHOLD" | bc -l) )); then
        echo -e "$name: ${RED}${value}%${NC}"
    else
        echo -e "$name: ${GREEN}${value}%${NC}"
    fi
}

print_coverage "Lines" "$LINES"
print_coverage "Statements" "$STATEMENTS"
print_coverage "Functions" "$FUNCTIONS"
print_coverage "Branches" "$BRANCHES"
echo

# Check if any metric is below threshold
if (( $(echo "$LINES < $THRESHOLD" | bc -l) )) || \
   (( $(echo "$STATEMENTS < $THRESHOLD" | bc -l) )) || \
   (( $(echo "$FUNCTIONS < $THRESHOLD" | bc -l) )) || \
   (( $(echo "$BRANCHES < $THRESHOLD" | bc -l) )); then
    echo -e "${RED}❌ Coverage is below ${THRESHOLD}%${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All coverage metrics are above ${THRESHOLD}%${NC}"
exit 0
