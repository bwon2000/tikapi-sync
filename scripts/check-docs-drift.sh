#!/bin/bash
# TikAPI Sync - Documentation Drift Detection
# Ensures code stays aligned with documentation specifications

set -e

echo "🔍 Checking documentation drift..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create temp directory for comparison files
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

DRIFT_FOUND=0

# 1. Check API routes vs ARCHITECTURE.md
echo "📡 Checking API routes alignment..."
grep -r "app\." index.mjs | grep -E "(get|post|put|delete)" > "$TEMP_DIR/current_routes.txt" 2>/dev/null || true
grep -A 50 "## Extension Points" ARCHITECTURE.md | grep -E "(/api/|route)" > "$TEMP_DIR/documented_routes.txt" 2>/dev/null || true

if ! diff -q "$TEMP_DIR/current_routes.txt" "$TEMP_DIR/documented_routes.txt" >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  API routes drift detected${NC}"
    echo "Current routes:"
    cat "$TEMP_DIR/current_routes.txt"
    echo "Documented routes:"
    cat "$TEMP_DIR/documented_routes.txt"
    DRIFT_FOUND=1
else
    echo -e "${GREEN}✅ API routes aligned${NC}"
fi

# 2. Check environment variables
echo "🔧 Checking environment variables alignment..."
grep -r "process\.env\." . --include="*.js" --include="*.mjs" --exclude-dir=node_modules | \
    grep -o "process\.env\.[A-Z_]*" | sort -u > "$TEMP_DIR/used_env_vars.txt" 2>/dev/null || true
grep "^[A-Z_]*=" .env.example | cut -d'=' -f1 | sort > "$TEMP_DIR/documented_env_vars.txt" 2>/dev/null || true

if ! diff -q "$TEMP_DIR/used_env_vars.txt" "$TEMP_DIR/documented_env_vars.txt" >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Environment variables drift detected${NC}"
    echo "Missing from .env.example:"
    comm -23 "$TEMP_DIR/used_env_vars.txt" "$TEMP_DIR/documented_env_vars.txt" | sed 's/process\.env\.//'
    echo "Unused in code:"
    comm -13 "$TEMP_DIR/used_env_vars.txt" "$TEMP_DIR/documented_env_vars.txt"
    DRIFT_FOUND=1
else
    echo -e "${GREEN}✅ Environment variables aligned${NC}"
fi

# 3. Check package.json scripts vs README
echo "📦 Checking npm scripts alignment..."
if command -v jq >/dev/null 2>&1; then
    jq -r '.scripts | keys[]' package.json | sort > "$TEMP_DIR/current_scripts.txt" 2>/dev/null || true
    grep -A 20 "Scripts Reference" README.md | grep "|" | \
        grep -v "Script\|---" | cut -d'|' -f2 | tr -d ' `' | sort > "$TEMP_DIR/documented_scripts.txt" 2>/dev/null || true
    
    if ! diff -q "$TEMP_DIR/current_scripts.txt" "$TEMP_DIR/documented_scripts.txt" >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  npm scripts drift detected${NC}"
        echo "Scripts not documented:"
        comm -23 "$TEMP_DIR/current_scripts.txt" "$TEMP_DIR/documented_scripts.txt"
        echo "Documented but missing:"
        comm -13 "$TEMP_DIR/current_scripts.txt" "$TEMP_DIR/documented_scripts.txt"
        DRIFT_FOUND=1
    else
        echo -e "${GREEN}✅ npm scripts aligned${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  jq not installed, skipping scripts check${NC}"
fi

# 4. Check for hardcoded URLs that should be environment variables
echo "🌐 Checking for hardcoded URLs..."
# Only check source code files, exclude documentation and examples
HARDCODED_URLS=$(grep -r "http://localhost" . --include="*.js" --include="*.jsx" --include="*.mjs" --exclude-dir=node_modules --exclude="*.md" --exclude=".cursorrules" --exclude="DEPLOY.md" 2>/dev/null || true)
if [ -n "$HARDCODED_URLS" ]; then
    echo -e "${YELLOW}⚠️  Hardcoded URLs found (should use environment variables):${NC}"
    echo "$HARDCODED_URLS"
    DRIFT_FOUND=1
else
    echo -e "${GREEN}✅ No hardcoded URLs found${NC}"
fi

# 5. Check README "Planned Changes" for items marked active but not in commits
echo "📋 Checking planned changes status..."
# Look for planned changes between "Active Development" and the separator "---"
# Filter out "None currently planned" and count actual planned changes
ACTIVE_ITEMS=$(sed -n '/#### \*\*Active Development\*\*/,/^---$/p' README.md | grep "\- \[ \]" | grep -v "None currently planned" | wc -l)
if [ "$ACTIVE_ITEMS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  ${ACTIVE_ITEMS} active planned changes found${NC}"
    sed -n '/#### \*\*Active Development\*\*/,/^---$/p' README.md | grep "\- \[ \]" | grep -v "None currently planned"
    echo "Consider moving completed items to 'Completed' section"
fi

# 6. Check for TODO comments in code that should be in planned changes
echo "📝 Checking for TODO comments..."
TODOS=$(grep -r "TODO\|FIXME\|HACK" . --include="*.js" --include="*.jsx" --include="*.mjs" --exclude-dir=node_modules 2>/dev/null || true)
if [ -n "$TODOS" ]; then
    echo -e "${YELLOW}⚠️  TODO comments found (consider adding to README planned changes):${NC}"
    echo "$TODOS"
fi

# Summary
echo ""
if [ $DRIFT_FOUND -eq 0 ]; then
    echo -e "${GREEN}🎉 No documentation drift detected! Code is aligned with specifications.${NC}"
    exit 0
else
    echo -e "${RED}❌ Documentation drift detected. Please update documentation first, then fix code.${NC}"
    echo ""
    echo "Suggested workflow:"
    echo "1. Update README.md 'Planned Changes' section"
    echo "2. Update ARCHITECTURE.md if needed"
    echo "3. Update DEPLOY.md if needed"
    echo "4. Commit documentation changes"
    echo "5. Implement code changes"
    echo "6. Mark planned changes as complete"
    exit 1
fi
