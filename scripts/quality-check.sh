#!/bin/bash

# RepairX Quality Assurance Script
# Automated quality checks and Six Sigma metrics collection

set -e

echo "🔍 Running RepairX Quality Assurance Checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Metrics tracking
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

run_check() {
    local check_name="$1"
    local command="$2"
    
    echo -e "\n${BLUE}Running: ${check_name}${NC}"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if eval "$command"; then
        echo -e "${GREEN}✅ PASSED: ${check_name}${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌ FAILED: ${check_name}${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

# Backend Quality Checks
echo -e "${YELLOW}🔧 Backend Quality Checks${NC}"
cd backend

run_check "Backend Dependencies Install" "npm ci --silent"
run_check "Backend TypeScript Compilation" "npm run build"
run_check "Backend Linting" "npm run lint"
run_check "Backend Unit Tests" "npm run test:coverage"
run_check "Backend Security Audit" "npm audit --audit-level=high"

# Frontend Quality Checks
echo -e "\n${YELLOW}🎨 Frontend Quality Checks${NC}"
cd ../frontend

run_check "Frontend Dependencies Install" "npm ci --silent"
run_check "Frontend TypeScript Compilation" "npm run build"
run_check "Frontend Linting" "npm run lint"
run_check "Frontend Unit Tests" "npm run test"
run_check "Frontend Security Audit" "npm audit --audit-level=high"

cd ..

# Six Sigma Metrics Calculation
echo -e "\n${BLUE}📊 Six Sigma Quality Metrics${NC}"

DEFECT_RATE=$((FAILED_CHECKS * 1000000 / TOTAL_CHECKS))
PASS_RATE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo "Total Checks: $TOTAL_CHECKS"
echo "Passed: $PASSED_CHECKS"
echo "Failed: $FAILED_CHECKS"
echo "Pass Rate: $PASS_RATE%"
echo "Defect Rate: $DEFECT_RATE DPMO"

# Quality Gate Assessment
echo -e "\n${BLUE}🎯 Quality Gate Assessment${NC}"

if [ $DEFECT_RATE -le 3400 ]; then
    echo -e "${GREEN}✅ DEFECT RATE: $DEFECT_RATE DPMO (Target: <3400 DPMO)${NC}"
else
    echo -e "${RED}❌ DEFECT RATE: $DEFECT_RATE DPMO (Target: <3400 DPMO)${NC}"
fi

if [ $PASS_RATE -ge 95 ]; then
    echo -e "${GREEN}✅ PASS RATE: $PASS_RATE% (Target: >95%)${NC}"
else
    echo -e "${RED}❌ PASS RATE: $PASS_RATE% (Target: >95%)${NC}"
fi

# Generate Quality Report
REPORT_FILE="quality-report-$(date +%Y%m%d-%H%M%S).md"
cat > "$REPORT_FILE" << EOF
# RepairX Quality Assurance Report

**Generated**: $(date)
**Commit**: $(git rev-parse --short HEAD)

## Six Sigma Metrics

- **Total Checks**: $TOTAL_CHECKS
- **Passed**: $PASSED_CHECKS
- **Failed**: $FAILED_CHECKS
- **Pass Rate**: $PASS_RATE%
- **Defect Rate**: $DEFECT_RATE DPMO

## Quality Standards Compliance

- **Six Sigma Target**: < 3.4 DPMO $([ $DEFECT_RATE -le 3400 ] && echo '✅ ACHIEVED' || echo '❌ NOT MET')
- **Quality Gate**: > 95% pass rate $([ $PASS_RATE -ge 95 ] && echo '✅ ACHIEVED' || echo '❌ NOT MET')

## Next Steps

$([ $FAILED_CHECKS -gt 0 ] && echo "- Review and fix $FAILED_CHECKS failed checks" || echo "- All quality checks passed!")
- Continue monitoring metrics
- Implement continuous improvement

EOF

echo -e "\n${GREEN}📄 Quality report generated: $REPORT_FILE${NC}"

# Exit with appropriate code
if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All quality checks passed!${NC}"
    exit 0
else
    echo -e "\n${RED}💥 $FAILED_CHECKS quality checks failed!${NC}"
    exit 1
fi