#!/bin/bash
# Multi-platform package builder for DSO
# Generates: .deb, .rpm, .pkg, .msi, .appx

set -e

VERSION=${1:-$(git describe --tags --always --dirty 2>/dev/null || echo "0.1.0")}
ARCH=${2:-$(uname -m)}
OS=${3:-$(uname -s | tr '[:upper:]' '[:lower:]')}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔨 Building DSO packages${NC}"
echo -e "${BLUE}Version: ${VERSION}${NC}"
echo -e "${BLUE}Architecture: ${ARCH}${NC}"
echo -e "${BLUE}OS: ${OS}${NC}"
echo ""

# Build directory
BUILD_DIR="dist/packages"
mkdir -p "$BUILD_DIR"

# Build binary first
echo -e "${YELLOW}📦 Building binary...${NC}"
export CGO_ENABLED=0

# Build for all platforms
PLATFORMS=(
    "linux/amd64"
    "linux/arm64"
    "darwin/amd64"
    "darwin/arm64"
    "windows/amd64"
    "windows/arm64"
)

for platform in "${PLATFORMS[@]}"; do
    platform_split=(${platform//\// })
    GOOS=${platform_split[0]}
    GOARCH=${platform_split[1]}
    
    output_name="dso"
    if [ "$GOOS" = "windows" ]; then
        output_name="dso.exe"
    fi
    
    echo -e "${BLUE}Building ${GOOS}/${GOARCH}...${NC}"
    env GOOS=$GOOS GOARCH=$GOARCH go build -ldflags="-X main.version=${VERSION}" -o "${BUILD_DIR}/${GOOS}-${GOARCH}/${output_name}" .
done

echo -e "${GREEN}✅ Binaries built${NC}"
echo ""

# Function to create Debian package
create_deb() {
    local arch=$1
    local goarch=$2
    
    echo -e "${YELLOW}📦 Creating Debian package for ${arch}...${NC}"
    
    DEB_DIR="${BUILD_DIR}/dso_${VERSION}_${arch}"
    mkdir -p "${DEB_DIR}/DEBIAN"
    mkdir -p "${DEB_DIR}/usr/local/bin"
    mkdir -p "${DEB_DIR}/usr/share/doc/dso"
    
    # Copy binary
    cp "${BUILD_DIR}/linux-${goarch}/dso" "${DEB_DIR}/usr/local/bin/"
    chmod +x "${DEB_DIR}/usr/local/bin/dso"
    
    # Create control file
    cat > "${DEB_DIR}/DEBIAN/control" <<EOF
Package: dso
Version: ${VERSION}
Section: utils
Priority: optional
Architecture: ${arch}
Maintainer: Ismail MOUYAHADA <dev@dso-cli.dev>
Description: DevSecOps Oracle - Local AI-powered security CLI
 DSO is a DevSecOps CLI assistant powered by local AI that provides
 intelligent security analysis with zero configuration.
 .
 Features:
  - 100% local operation (no data sent outside)
  - Local AI analysis with Ollama
  - Multiple security scanners (Trivy, Grype, gitleaks, tfsec)
  - Automatic fix suggestions
  - CI/CD integration
Homepage: https://github.com/dso-cli/dso-cli
EOF
    
    # Create copyright file
    cat > "${DEB_DIR}/usr/share/doc/dso/copyright" <<EOF
Format: https://www.debian.org/doc/packaging-manuals/copyright-format/1.0/
Upstream-Name: dso
Source: https://github.com/dso-cli/dso-cli

Files: *
Copyright: 2024 Ismail MOUYAHADA
License: MIT

License: MIT
 MIT License
 .
 Copyright (c) 2024 Ismail MOUYAHADA
 .
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 .
 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.
 .
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
EOF
    
    # Build package
    dpkg-deb --build "${DEB_DIR}" "${BUILD_DIR}/dso_${VERSION}_${arch}.deb"
    echo -e "${GREEN}✅ Created: dso_${VERSION}_${arch}.deb${NC}"
}

# Function to create RPM package
create_rpm() {
    local arch=$1
    local goarch=$2
    
    echo -e "${YELLOW}📦 Creating RPM package for ${arch}...${NC}"
    
    RPM_DIR="${BUILD_DIR}/rpmbuild"
    mkdir -p "${RPM_DIR}/BUILD" "${RPM_DIR}/RPMS" "${RPM_DIR}/SOURCES" "${RPM_DIR}/SPECS"
    
    # Create spec file
    cat > "${RPM_DIR}/SPECS/dso.spec" <<EOF
Name:           dso
Version:        ${VERSION}
Release:        1%{?dist}
Summary:        DevSecOps Oracle - Local AI-powered security CLI
License:        MIT
URL:            https://github.com/dso-cli/dso-cli
Source0:        %{name}-%{version}.tar.gz

%description
DSO is a DevSecOps CLI assistant powered by local AI that provides
intelligent security analysis with zero configuration.

Features:
- 100% local operation (no data sent outside)
- Local AI analysis with Ollama
- Multiple security scanners (Trivy, Grype, gitleaks, tfsec)
- Automatic fix suggestions
- CI/CD integration

%prep
%setup -q

%build
# Binary is pre-built

%install
mkdir -p %{buildroot}/usr/local/bin
cp linux-${goarch}/dso %{buildroot}/usr/local/bin/dso
chmod +x %{buildroot}/usr/local/bin/dso

%files
/usr/local/bin/dso

%changelog
* $(date +"%a %b %d %Y") Ismail MOUYAHADA <dev@dso-cli.dev> - ${VERSION}-1
- Initial package
EOF
    
    # Copy binary
    mkdir -p "${RPM_DIR}/BUILD/linux-${goarch}"
    cp "${BUILD_DIR}/linux-${goarch}/dso" "${RPM_DIR}/BUILD/linux-${goarch}/"
    
    # Build RPM
    rpmbuild --define "_topdir ${RPM_DIR}" -bb "${RPM_DIR}/SPECS/dso.spec"
    
    # Find and copy the built RPM
    RPM_FILE=$(find "${RPM_DIR}/RPMS" -name "dso-${VERSION}*.rpm" | head -1)
    if [ -n "$RPM_FILE" ]; then
        cp "$RPM_FILE" "${BUILD_DIR}/dso_${VERSION}_${arch}.rpm"
        echo -e "${GREEN}✅ Created: dso_${VERSION}_${arch}.rpm${NC}"
    fi
}

# Function to create macOS package
create_pkg() {
    local arch=$1
    local goarch=$2
    
    echo -e "${YELLOW}📦 Creating macOS package for ${arch}...${NC}"
    
    PKG_DIR="${BUILD_DIR}/dso.pkg"
    mkdir -p "${PKG_DIR}/usr/local/bin"
    
    # Copy binary
    cp "${BUILD_DIR}/darwin-${goarch}/dso" "${PKG_DIR}/usr/local/bin/"
    chmod +x "${PKG_DIR}/usr/local/bin/dso"
    
    # Create package with pkgbuild (macOS only)
    if command -v pkgbuild &> /dev/null; then
        pkgbuild --root "${PKG_DIR}" \
                 --identifier com.dso-cli.dso \
                 --version "${VERSION}" \
                 --install-location / \
                 "${BUILD_DIR}/dso_${VERSION}_${arch}.pkg"
        echo -e "${GREEN}✅ Created: dso_${VERSION}_${arch}.pkg${NC}"
    else
        echo -e "${YELLOW}⚠️  pkgbuild not found, skipping .pkg creation${NC}"
        echo -e "${BLUE}   Binary available at: ${BUILD_DIR}/darwin-${goarch}/dso${NC}"
    fi
}

# Function to create Windows MSI (requires WiX Toolset)
create_msi() {
    local arch=$1
    local goarch=$2
    
    echo -e "${YELLOW}📦 Creating Windows MSI for ${arch}...${NC}"
    
    if ! command -v candle &> /dev/null && ! command -v light &> /dev/null; then
        echo -e "${YELLOW}⚠️  WiX Toolset not found, skipping MSI creation${NC}"
        echo -e "${BLUE}   Install WiX: https://wixtoolset.org/${NC}"
        echo -e "${BLUE}   Binary available at: ${BUILD_DIR}/windows-${goarch}/dso.exe${NC}"
        return
    fi
    
    MSI_DIR="${BUILD_DIR}/msi"
    mkdir -p "${MSI_DIR}"
    
    # Create WiX source file
    cat > "${MSI_DIR}/dso.wxs" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
    <Product Id="*" Name="DSO" Language="1033" Version="${VERSION}" Manufacturer="Ismail MOUYAHADA" UpgradeCode="YOUR-GUID-HERE">
        <Package InstallerVersion="200" Compressed="yes" InstallScope="perMachine" />
        <MajorUpgrade DowngradeErrorMessage="A newer version of DSO is already installed." />
        <MediaTemplate />
        
        <Feature Id="ProductFeature" Title="DSO" Level="1">
            <ComponentRef Id="ApplicationFiles" />
        </Feature>
        
        <Directory Id="TARGETDIR" Name="SourceDir">
            <Directory Id="ProgramFilesFolder">
                <Directory Id="INSTALLFOLDER" Name="DSO">
                    <Component Id="ApplicationFiles" Guid="YOUR-GUID-HERE">
                        <File Id="dso.exe" Source="${BUILD_DIR}/windows-${goarch}/dso.exe" KeyPath="yes" />
                    </Component>
                </Directory>
            </Directory>
        </Directory>
    </Product>
</Wix>
EOF
    
    # Build MSI
    candle "${MSI_DIR}/dso.wxs" -out "${MSI_DIR}/dso.wixobj"
    light "${MSI_DIR}/dso.wixobj" -out "${BUILD_DIR}/dso_${VERSION}_${arch}.msi"
    
    echo -e "${GREEN}✅ Created: dso_${VERSION}_${arch}.msi${NC}"
}

# Create packages based on available tools
if command -v dpkg-deb &> /dev/null; then
    create_deb "amd64" "amd64"
    create_deb "arm64" "arm64"
fi

if command -v rpmbuild &> /dev/null; then
    create_rpm "x86_64" "amd64"
    create_rpm "aarch64" "arm64"
fi

if [[ "$OS" == "darwin" ]]; then
    create_pkg "amd64" "amd64"
    create_pkg "arm64" "arm64"
fi

if [[ "$OS" == "linux" ]] || [[ "$OS" == "darwin" ]]; then
    # Try to create MSI if WiX is available (unlikely on Linux/macOS)
    create_msi "amd64" "amd64" || true
fi

echo ""
echo -e "${GREEN}🎉 Package building completed!${NC}"
echo ""
echo -e "${BLUE}Packages available in: ${BUILD_DIR}${NC}"
ls -lh "${BUILD_DIR}"/*.{deb,rpm,pkg,msi} 2>/dev/null || echo "No packages created (missing build tools)"

