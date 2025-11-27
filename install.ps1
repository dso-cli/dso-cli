# DSO Installation Script for Windows
# Requires: PowerShell 5.1 or later
# Usage: .\install.ps1

$ErrorActionPreference = "Stop"

Write-Host "🔒 Installing DSO - DevSecOps Oracle" -ForegroundColor Cyan
Write-Host ""

# Check Go
try {
    $goVersion = go version
    Write-Host "✅ Go found: $goVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Go is not installed." -ForegroundColor Red
    Write-Host "   Install it from: https://go.dev/doc/install" -ForegroundColor Yellow
    Write-Host "   Make sure Go is in your PATH"
    exit 1
}

Write-Host ""

# Build
Write-Host "🔨 Building binary..." -ForegroundColor Cyan
$env:GOOS = "windows"
$env:GOARCH = "amd64"
go build -o dso.exe .
Write-Host "✅ Build completed" -ForegroundColor Green
Write-Host ""

# Check Ollama
try {
    $ollamaVersion = ollama --version 2>&1
    Write-Host "✅ Ollama found" -ForegroundColor Green
    
    # Check if model exists
    $models = ollama list 2>&1
    if ($models -match "llama3.1:8b") {
        Write-Host "✅ Model llama3.1:8b already installed" -ForegroundColor Green
    } else {
        Write-Host "📥 Downloading model llama3.1:8b (this may take a few minutes)..." -ForegroundColor Yellow
        ollama pull llama3.1:8b
    }
} catch {
    Write-Host "⚠️  Ollama is not installed." -ForegroundColor Yellow
    Write-Host "   Install it from: https://ollama.ai" -ForegroundColor Yellow
    Write-Host "   Or using winget: winget install Ollama.Ollama" -ForegroundColor Yellow
    Write-Host "   Or using scoop: scoop install ollama" -ForegroundColor Yellow
    Write-Host "   Then run: ollama pull llama3.1:8b" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Installation completed!" -ForegroundColor Green
Write-Host ""
Write-Host "To use DSO:" -ForegroundColor Cyan
Write-Host "  .\dso.exe audit ." -ForegroundColor White
Write-Host ""
Write-Host "To install globally (add to PATH):" -ForegroundColor Cyan
Write-Host "  1. Copy dso.exe to a directory in your PATH (e.g., C:\Program Files\Go\bin)" -ForegroundColor White
Write-Host "  2. Or add the current directory to your PATH" -ForegroundColor White
Write-Host ""

