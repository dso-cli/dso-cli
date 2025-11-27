@echo off
REM DSO Installation Script for Windows (Batch)
REM Usage: install.bat

echo 🔒 Installing DSO - DevSecOps Oracle
echo.

REM Check Go
where go >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Go is not installed.
    echo    Install it from: https://go.dev/doc/install
    echo    Make sure Go is in your PATH
    exit /b 1
)

go version
echo ✅ Go found
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
    ollama list | findstr "llama3.1:8b" >nul
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
echo   dso.exe audit .
echo.
echo To install globally (add to PATH):
echo   1. Copy dso.exe to a directory in your PATH (e.g., C:\Program Files\Go\bin)
echo   2. Or add the current directory to your PATH
echo.

pause

