#!/bin/bash
# Verification script for DSO project

set -e

echo "🔍 Verifying DSO project..."
echo ""

ERRORS=0

# Check Go module
echo "📦 Checking Go module..."
if [ -f "go.mod" ]; then
    MODULE=$(grep "^module" go.mod | awk '{print $2}')
    echo "  ✅ Module: $MODULE"
    if [[ "$MODULE" != "github.com/dso-cli/dso-cli" ]]; then
        echo "  ❌ Module path incorrect: $MODULE"
        ((ERRORS++))
    fi
else
    echo "  ❌ go.mod not found"
    ((ERRORS++))
fi
echo ""

# Check main.go imports
echo "📝 Checking main.go..."
if [ -f "main.go" ]; then
    if grep -q "github.com/dso-cli/dso-cli/cmd" main.go; then
        echo "  ✅ main.go imports correct"
    else
        echo "  ❌ main.go imports incorrect"
        ((ERRORS++))
    fi
else
    echo "  ❌ main.go not found"
    ((ERRORS++))
fi
echo ""

# Check all Go files have correct imports
echo "🔍 Checking Go imports..."
WRONG_IMPORTS=$(grep -r "github.com/isma-dev/dso" --include="*.go" . 2>/dev/null | wc -l | tr -d ' ')
if [ "$WRONG_IMPORTS" -gt 0 ]; then
    echo "  ❌ Found $WRONG_IMPORTS files with old imports"
    grep -r "github.com/isma-dev/dso" --include="*.go" . 2>/dev/null | head -5
    ((ERRORS++))
else
    echo "  ✅ All imports use dso-cli/dso-cli"
fi
echo ""

# Check scripts are executable
echo "🔧 Checking scripts..."
for script in scripts/*.sh install install.sh; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            echo "  ✅ $script is executable"
        else
            echo "  ⚠️  $script is not executable (fixing...)"
            chmod +x "$script"
            ((ERRORS++))
        fi
    fi
done
echo ""

# Check CI/CD files
echo "🚀 Checking CI/CD files..."
if [ -f ".github/workflows/ci.yml" ]; then
    echo "  ✅ GitHub Actions CI found"
else
    echo "  ❌ GitHub Actions CI missing"
    ((ERRORS++))
fi

if [ -f ".github/workflows/release.yml" ]; then
    echo "  ✅ GitHub Actions Release found"
else
    echo "  ❌ GitHub Actions Release missing"
    ((ERRORS++))
fi

if [ -f ".gitlab-ci.yml" ]; then
    echo "  ✅ GitLab CI found"
else
    echo "  ❌ GitLab CI missing"
    ((ERRORS++))
fi
echo ""

# Check Makefile targets
echo "🔨 Checking Makefile..."
if [ -f "Makefile" ]; then
    if grep -q "build-all:" Makefile; then
        echo "  ✅ Makefile has build-all target"
    else
        echo "  ❌ Makefile missing build-all target"
        ((ERRORS++))
    fi
    
    if grep -q "release:" Makefile; then
        echo "  ✅ Makefile has release target"
    else
        echo "  ❌ Makefile missing release target"
        ((ERRORS++))
    fi
else
    echo "  ❌ Makefile not found"
    ((ERRORS++))
fi
echo ""

# Check documentation
echo "📚 Checking documentation..."
for doc in README.md INSTALL.md BUILD.md LICENSE; do
    if [ -f "$doc" ]; then
        echo "  ✅ $doc exists"
    else
        echo "  ⚠️  $doc missing"
    fi
done
echo ""

# Check author in LICENSE
echo "👤 Checking LICENSE author..."
if grep -q "Ismail MOUYAHADA" LICENSE; then
    echo "  ✅ LICENSE has correct author"
else
    echo "  ❌ LICENSE author incorrect"
    ((ERRORS++))
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo "✅ All checks passed! Project is ready."
    exit 0
else
    echo "❌ Found $ERRORS error(s). Please fix them."
    exit 1
fi
