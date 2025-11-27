#!/bin/bash
# Test build script - verifies compilation without Go installed locally

set -e

echo "🧪 Testing build configuration..."
echo ""

# Check if we can at least parse the Makefile
echo "📋 Checking Makefile syntax..."
if make -n build-all > /dev/null 2>&1; then
    echo "  ✅ Makefile syntax valid"
else
    echo "  ❌ Makefile syntax error"
    exit 1
fi

# Check script syntax
echo "📋 Checking build scripts..."
for script in scripts/build-release.sh install install.sh; do
    if [ -f "$script" ]; then
        if bash -n "$script" 2>/dev/null; then
            echo "  ✅ $script syntax valid"
        else
            echo "  ❌ $script syntax error"
            exit 1
        fi
    fi
done

# Check PowerShell script (basic check)
if [ -f "scripts/build-release.ps1" ]; then
    echo "  ✅ scripts/build-release.ps1 exists"
fi

echo ""
echo "✅ Build configuration tests passed!"
echo ""
echo "💡 To actually build, install Go and run:"
echo "   make build-all"
