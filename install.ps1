# DSO Installation Script for Windows
# Requires: PowerShell 5.1 or later
# Usage: .\install.ps1

$ErrorActionPreference = "Stop"

Write-Host "🔒 Installing DSO - DevSecOps Oracle" -ForegroundColor Cyan
Write-Host ""

# Function to install Go
function Install-Go {
    Write-Host "📦 Installing Go..." -ForegroundColor Yellow
    
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Write-Host "Installing Go via winget..." -ForegroundColor Cyan
        winget install GoLang.Go
    } elseif (Get-Command scoop -ErrorAction SilentlyContinue) {
        Write-Host "Installing Go via scoop..." -ForegroundColor Cyan
        scoop install go
    } else {
        Write-Host "❌ Go is not installed and no package manager found." -ForegroundColor Red
        Write-Host "   Install it from: https://go.dev/doc/install" -ForegroundColor Yellow
        Write-Host "   Or install winget/scoop first, then run this script again" -ForegroundColor Yellow
        exit 1
    }
    
    # Refresh PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    if (Get-Command go -ErrorAction SilentlyContinue) {
        $goVersion = go version
        Write-Host "✅ Go installed: $goVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Go installation failed. Please restart your terminal and try again." -ForegroundColor Red
        exit 1
    }
}

# Check Go
try {
    $goVersion = go version
    Write-Host "✅ Go found: $goVersion" -ForegroundColor Green
} catch {
    Install-Go
}

Write-Host ""

# Download dependencies
Write-Host "📦 Downloading Go dependencies..." -ForegroundColor Cyan
go mod download
go mod tidy
Write-Host "✅ Dependencies downloaded" -ForegroundColor Green
Write-Host ""

# Remove old binary if exists
if (Test-Path "dso.exe") {
    Write-Host "🗑️  Removing old binary..." -ForegroundColor Cyan
    Remove-Item -Force dso.exe
}

# Update repository if in git repo
if (Test-Path ".git") {
    Write-Host "📥 Updating to latest version..." -ForegroundColor Cyan
    git fetch origin 2>$null
    git pull origin main 2>$null
    if ($LASTEXITCODE -ne 0) {
        git pull origin master 2>$null
    }
    Write-Host ""
}

# Build
Write-Host "🔨 Building binary..." -ForegroundColor Cyan
$env:GOOS = "windows"
$env:GOARCH = "amd64"
go build -o dso.exe .
Write-Host "✅ Build completed" -ForegroundColor Green
Write-Host ""

# Function to install Ollama
function Install-Ollama {
    Write-Host "📦 Installing Ollama..." -ForegroundColor Yellow
    
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Write-Host "Installing Ollama via winget..." -ForegroundColor Cyan
        winget install Ollama.Ollama
    } elseif (Get-Command scoop -ErrorAction SilentlyContinue) {
        Write-Host "Installing Ollama via scoop..." -ForegroundColor Cyan
        scoop install ollama
    } else {
        Write-Host "⚠️  Please install Ollama manually:" -ForegroundColor Yellow
        Write-Host "   Download from: https://ollama.ai" -ForegroundColor Yellow
        return $false
    }
    
    # Refresh PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    if (Get-Command ollama -ErrorAction SilentlyContinue) {
        Write-Host "✅ Ollama installed" -ForegroundColor Green
        return $true
    } else {
        Write-Host "⚠️  Ollama installation may have failed. Please restart terminal." -ForegroundColor Yellow
        return $false
    }
}

# Function to select and download models
function Select-Models {
    Write-Host ""
    Write-Host "🤖 Available AI Models:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  1) llama3.1:8b      (~4.7 GB) - Recommended" -ForegroundColor White
    Write-Host "  2) phi3              (~2.3 GB) - Lightweight" -ForegroundColor White
    Write-Host "  3) mistral:7b        (~4.1 GB) - Good balance" -ForegroundColor White
    Write-Host "  4) gemma:7b          (~5.2 GB) - Google's model" -ForegroundColor White
    Write-Host "  5) qwen2.5:7b        (~4.7 GB) - High quality" -ForegroundColor White
    Write-Host "  6) Skip" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Select model to install (1-6)"
    
    switch ($choice) {
        "1" { $MODEL = "llama3.1:8b" }
        "2" { $MODEL = "phi3" }
        "3" { $MODEL = "mistral:7b" }
        "4" { $MODEL = "gemma:7b" }
        "5" { $MODEL = "qwen2.5:7b" }
        "6" {
            Write-Host "⏭️  Skipping model installation" -ForegroundColor Yellow
            return
        }
        default {
            Write-Host "⚠️  Invalid choice, using default: llama3.1:8b" -ForegroundColor Yellow
            $MODEL = "llama3.1:8b"
        }
    }
    
    Write-Host "📥 Downloading model: $MODEL..." -ForegroundColor Yellow
    ollama pull $MODEL
    
    # Save to config
    $configDir = "$env:USERPROFILE\.dso"
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir | Out-Null
    }
    "DSO_MODEL=$MODEL" | Out-File -FilePath "$configDir\config" -Encoding ASCII
    Write-Host "✅ Default model set to: $MODEL" -ForegroundColor Green
}

# Check/Install Ollama
try {
    $ollamaVersion = ollama --version 2>&1
    Write-Host "✅ Ollama found" -ForegroundColor Green
} catch {
    Install-Ollama
}

# Select and download models
try {
    $models = ollama list 2>&1
    $installedCount = ($models | Select-String -Pattern "^\w" | Measure-Object).Count
    
    if ($installedCount -gt 0) {
        Write-Host "✅ Models already installed:" -ForegroundColor Green
        $models | Select-String -Pattern "^\w" | ForEach-Object { Write-Host "  • $_" -ForegroundColor White }
        $installMore = Read-Host "Install additional models? (y/N)"
        if ($installMore -eq "y" -or $installMore -eq "Y") {
            Select-Models
        }
    } else {
        Select-Models
    }
} catch {
    Write-Host "⚠️  Could not check models. Make sure Ollama is running." -ForegroundColor Yellow
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

