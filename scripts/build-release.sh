#!/bin/bash
# Build and release script for DSO
# Usage: ./scripts/build-release.sh [version]

set -e

VERSION=${1:-$(git describe --tags --always --dirty 2>/dev/null || echo "dev")}
BUILD_DATE=$(date +%Y-%m-%d)
BUILD_TIME=$(date +%H:%M:%S)

echo "🔨 Building DSO version: $VERSION"
echo "📅 Build date: $BUILD_DATE $BUILD_TIME"
echo ""

# Clean previous builds
rm -rf dist/
mkdir -p dist

# Build flags
LDFLAGS="-w -s -X main.version=$VERSION -X main.buildDate=$BUILD_DATE -X main.buildTime=$BUILD_TIME"

# Platforms to build
PLATFORMS=(
  "linux/amd64"
  "linux/arm64"
  "darwin/amd64"
  "darwin/arm64"
  "windows/amd64"
  "windows/arm64"
)

for PLATFORM in "${PLATFORMS[@]}"; do
  GOOS=${PLATFORM%/*}
  GOARCH=${PLATFORM#*/}
  
  echo "Building for $GOOS/$GOARCH..."
  
  OUTPUT_DIR="dist/dso-${GOOS}-${GOARCH}"
  mkdir -p "$OUTPUT_DIR"
  
  BINARY_NAME="dso"
  if [ "$GOOS" = "windows" ]; then
    BINARY_NAME="dso.exe"
  fi
  
  GOOS=$GOOS GOARCH=$GOARCH CGO_ENABLED=0 \
    go build -ldflags="$LDFLAGS" \
    -o "$OUTPUT_DIR/$BINARY_NAME" .
  
  # Create checksum
  cd "$OUTPUT_DIR"
  if [ "$GOOS" = "windows" ]; then
    sha256sum "$BINARY_NAME" > "$BINARY_NAME.sha256"
  else
    shasum -a 256 "$BINARY_NAME" > "$BINARY_NAME.sha256"
  fi
  cd - > /dev/null
  
  echo "✅ Built: $OUTPUT_DIR/$BINARY_NAME"
done

echo ""
echo "📦 Creating release archives..."

cd dist
for dir in */; do
  dirname=${dir%/}
  cd "$dirname"
  if [[ "$dirname" == *"windows"* ]]; then
    zip -r "../${dirname}.zip" . > /dev/null
    echo "  ✅ ${dirname}.zip"
  else
    tar -czf "../${dirname}.tar.gz" . > /dev/null
    echo "  ✅ ${dirname}.tar.gz"
  fi
  cd ..
done
cd ..

echo ""
echo "🎉 Build completed!"
echo ""
echo "📊 Summary:"
echo "  Version: $VERSION"
echo "  Build date: $BUILD_DATE $BUILD_TIME"
echo "  Binaries: dist/dso-*/"
echo "  Archives: dist/*.tar.gz, dist/*.zip"
echo ""
echo "📝 Next steps:"
echo "  1. Test binaries: ./dist/dso-linux-amd64/dso --version"
echo "  2. Create release: gh release create v$VERSION dist/*.tar.gz dist/*.zip"
echo ""

