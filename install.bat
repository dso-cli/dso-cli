@echo off
REM DSO Installation Script for Windows (Batch)
REM Usage: install.bat

setlocal enabledelayedexpansion

echo 🔒 Installing DSO - DevSecOps Oracle
echo.

REM Function to install Go
:install_go
echo 📦 Installing Go...
where winget >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Installing Go via winget...
    winget install GoLang.Go
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Go installation started via winget
        echo ⚠️  Please restart your terminal after installation completes
        echo    Then run this script again
        timeout /t 5
        exit /b 0
    )
)
where scoop >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Installing Go via scoop...
    scoop install go
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Go installation started via scoop
        echo ⚠️  Please restart your terminal after installation completes
        echo    Then run this script again
        timeout /t 5
        exit /b 0
    )
)
echo ❌ Go is not installed and no package manager found.
echo    Install it from: https://go.dev/doc/install
echo    Or install winget/scoop first, then run this script again
exit /b 1

REM Check Go
:check_go
where go >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    call :install_go
    if %ERRORLEVEL% NEQ 0 (
        exit /b 1
    )
    goto :check_go
)

for /f "tokens=*" %%i in ('go version') do set GO_VERSION=%%i
echo ✅ Go found: !GO_VERSION!
echo.

REM Build
echo 🔨 Building binary...
set GOOS=windows
set GOARCH=amd64
go build -o dso.exe .
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed
    exit /b 1
)
echo ✅ Build completed
echo.

REM Check Ollama
where ollama >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Ollama is not installed.
    echo    Install it from: https://ollama.ai
    echo    Or using winget: winget install Ollama.Ollama
    echo    Or using scoop: scoop install ollama
    echo    Then run: ollama pull llama3.1:8b
) else (
    echo ✅ Ollama found
    ollama list 2>nul | findstr "llama3.1:8b" >nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Model llama3.1:8b already installed
    ) else (
        echo 📥 Downloading model llama3.1:8b (this may take a few minutes)...
        ollama pull llama3.1:8b
    )
)

echo.
echo 🎉 Installation completed!
echo.
echo To use DSO:
echo   .\dso.exe audit .
echo.
echo To verify installation:
echo   .\dso.exe check
echo   .\dso.exe tools
echo.
echo To install globally (add to PATH):
echo   1. Copy dso.exe to a directory in your PATH (e.g., C:\Program Files\Go\bin)
echo   2. Or add the current directory to your PATH
echo.

pause
