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

REM Download dependencies
echo 📦 Downloading Go dependencies...
go mod download
go mod tidy
echo ✅ Dependencies downloaded
echo.

REM Remove old binary if exists
if exist dso.exe (
    echo 🗑️  Removing old binary...
    del /f dso.exe
)

REM Update repository if in git repo
if exist .git (
    echo 📥 Updating to latest version...
    git fetch origin 2>nul
    git pull origin main 2>nul
    if %ERRORLEVEL% NEQ 0 (
        git pull origin master 2>nul
    )
    echo.
)

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

REM Function to install Ollama
:install_ollama
echo 📦 Installing Ollama...
where winget >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Installing Ollama via winget...
    winget install Ollama.Ollama
    goto :check_ollama_after_install
)
where scoop >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Installing Ollama via scoop...
    scoop install ollama
    goto :check_ollama_after_install
)
echo ⚠️  Please install Ollama manually:
echo    Download from: https://ollama.ai
echo    Or install winget/scoop first
goto :check_models

:check_ollama_after_install
echo ⚠️  If Ollama was just installed, you may need to restart your terminal.
timeout /t 2 >nul

REM Check Ollama
:check_ollama
where ollama >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    call :install_ollama
    goto :check_ollama
)
echo ✅ Ollama found
echo.

REM Function to select model
:select_model
echo 🤖 Available AI Models:
echo.
echo   1) llama3.1:8b      (~4.7 GB) - Recommended
echo   2) phi3              (~2.3 GB) - Lightweight
echo   3) mistral:7b        (~4.1 GB) - Good balance
echo   4) gemma:7b          (~5.2 GB) - Google's model
echo   5) qwen2.5:7b        (~4.7 GB) - High quality
echo   6) Skip
echo.
set /p MODEL_CHOICE="Select model to install (1-6): "

if "%MODEL_CHOICE%"=="1" set MODEL=llama3.1:8b
if "%MODEL_CHOICE%"=="2" set MODEL=phi3
if "%MODEL_CHOICE%"=="3" set MODEL=mistral:7b
if "%MODEL_CHOICE%"=="4" set MODEL=gemma:7b
if "%MODEL_CHOICE%"=="5" set MODEL=qwen2.5:7b
if "%MODEL_CHOICE%"=="6" (
    echo ⏭️  Skipping model installation
    goto :end_models
)
if not defined MODEL (
    echo ⚠️  Invalid choice, using default: llama3.1:8b
    set MODEL=llama3.1:8b
)

echo 📥 Downloading model: %MODEL%...
ollama pull %MODEL%

REM Save to config
if not exist "%USERPROFILE%\.dso" mkdir "%USERPROFILE%\.dso"
echo DSO_MODEL=%MODEL% > "%USERPROFILE%\.dso\config"
echo ✅ Default model set to: %MODEL%

:end_models
goto :check_models

REM Check models
:check_models
ollama list 2>nul >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Checking installed models...
    ollama list 2>nul | findstr /V "NAME" >nul
    if %ERRORLEVEL% EQU 0 (
        echo Models found. Install additional models? (y/N)
        set /p INSTALL_MORE=
        if /i "%INSTALL_MORE%"=="y" (
            call :select_model
        )
    ) else (
        call :select_model
    )
) else (
    echo ⚠️  Could not check models. Make sure Ollama is running.
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
