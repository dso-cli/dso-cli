# Build and release script for DSO (PowerShell)
# Usage: .\scripts\build-release.ps1 [version]

param(
    [string]$Version = $(git describe --tags --always --dirty 2>$null)
)

if (-not $Version) {
    $Version = "dev"
}

$BuildDate = Get-Date -Format "yyyy-MM-dd"
$BuildTime = Get-Date -Format "HH:mm:ss"

Write-Host "🔨 Building DSO version: $Version" -ForegroundColor Cyan
Write-Host "📅 Build date: $BuildDate $BuildTime" -ForegroundColor Cyan
Write-Host ""

# Clean previous builds
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}
New-Item -ItemType Directory -Path "dist" | Out-Null

# Build flags
$LDFLAGS = "-w -s -X main.version=$Version -X main.buildDate=$BuildDate -X main.buildTime=$BuildTime"

# Platforms to build
$Platforms = @(
    @{OS="linux"; ARCH="amd64"},
    @{OS="linux"; ARCH="arm64"},
    @{OS="darwin"; ARCH="amd64"},
    @{OS="darwin"; ARCH="arm64"},
    @{OS="windows"; ARCH="amd64"},
    @{OS="windows"; ARCH="arm64"}
)

foreach ($Platform in $Platforms) {
    $GOOS = $Platform.OS
    $GOARCH = $Platform.ARCH
    
    Write-Host "Building for $GOOS/$GOARCH..." -ForegroundColor Yellow
    
    $OutputDir = "dist/dso-${GOOS}-${GOARCH}"
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    
    $BinaryName = "dso"
    if ($GOOS -eq "windows") {
        $BinaryName = "dso.exe"
    }
    
    $env:GOOS = $GOOS
    $env:GOARCH = $GOARCH
    $env:CGO_ENABLED = "0"
    
    go build -ldflags="$LDFLAGS" -o "$OutputDir/$BinaryName" .
    
    # Create checksum
    Push-Location $OutputDir
    $Hash = (Get-FileHash -Algorithm SHA256 $BinaryName).Hash
    "$Hash  $BinaryName" | Out-File -Encoding ASCII "$BinaryName.sha256"
    Pop-Location
    
    Write-Host "✅ Built: $OutputDir/$BinaryName" -ForegroundColor Green
}

Write-Host ""
Write-Host "📦 Creating release archives..." -ForegroundColor Cyan

Push-Location dist
Get-ChildItem -Directory | ForEach-Object {
    $DirName = $_.Name
    Push-Location $DirName
    if ($DirName -like "*windows*") {
        Compress-Archive -Path * -DestinationPath "../${DirName}.zip" -Force
        Write-Host "  ✅ ${DirName}.zip" -ForegroundColor Green
    } else {
        # Note: tar requires PowerShell 7+ or WSL
        if (Get-Command tar -ErrorAction SilentlyContinue) {
            tar -czf "../${DirName}.tar.gz" *
            Write-Host "  ✅ ${DirName}.tar.gz" -ForegroundColor Green
        } else {
            Compress-Archive -Path * -DestinationPath "../${DirName}.zip" -Force
            Write-Host "  ✅ ${DirName}.zip (using zip instead of tar.gz)" -ForegroundColor Yellow
        }
    }
    Pop-Location
}
Pop-Location

Write-Host ""
Write-Host "🎉 Build completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  Version: $Version"
Write-Host "  Build date: $BuildDate $BuildTime"
Write-Host "  Binaries: dist/dso-*/"
Write-Host "  Archives: dist/*.tar.gz, dist/*.zip"
Write-Host ""

