#!/bin/bash

# DSO Installation Script
# Supports: macOS, Linux (Ubuntu/Debian), and provides Windows instructions
# Usage: ./install.sh

set -e

echo "🔒 Installing DSO - DevSecOps Oracle"
echo ""

# Detect OS
OS="$(uname -s)"
ARCH="$(uname -m)"

case "${OS}" in
    Linux*)     OS_TYPE="linux" ;;
    Darwin*)    OS_TYPE="darwin" ;;
    *)          OS_TYPE="unknown" ;;
esac

# Function to install Go
install_go() {
    echo "📦 Installing Go..."
    
    case "${OS_TYPE}" in
        darwin)
            if command -v brew &> /dev/null; then
                brew install go
            else
                echo "❌ Homebrew not found. Please install Homebrew first:"
                echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
                exit 1
            fi
            ;;
        linux)
            if [ -f /etc/debian_version ]; then
                # Debian/Ubuntu
                sudo apt-get update
                sudo apt-get install -y golang-go
            elif [ -f /etc/redhat-release ]; then
                # RHEL/CentOS/Fedora
                sudo dnf install -y golang 2>/dev/null || sudo yum install -y golang
            else
                echo "⚠️  Please install Go manually: https://go.dev/doc/install"
                exit 1
            fi
            ;;
    esac
    
    if command -v go &> /dev/null; then
        echo "✅ Go installed: $(go version)"
    else
        echo "❌ Go installation failed"
        exit 1
    fi
}

# Check Go
if ! command -v go &> /dev/null; then
    install_go
else
    echo "✅ Go found: $(go version)"
fi
echo ""

# Download dependencies
echo "📦 Downloading Go dependencies..."
go mod download
go mod tidy
echo "✅ Dependencies downloaded"
echo ""

# Build
echo "🔨 Building binary..."
BINARY_NAME="dso"
if [ "${OS_TYPE}" = "linux" ] && [ "${ARCH}" = "x86_64" ]; then
    GOOS=linux GOARCH=amd64 go build -o ${BINARY_NAME} .
elif [ "${OS_TYPE}" = "darwin" ] && [ "${ARCH}" = "arm64" ]; then
    GOOS=darwin GOARCH=arm64 go build -o ${BINARY_NAME} .
elif [ "${OS_TYPE}" = "darwin" ]; then
    GOOS=darwin GOARCH=amd64 go build -o ${BINARY_NAME} .
else
    go build -o ${BINARY_NAME} .
fi
echo "✅ Build completed"
echo ""

# Function to install Ollama
install_ollama() {
    echo "📦 Installing Ollama..."
    
    case "${OS_TYPE}" in
        darwin)
            if command -v brew &> /dev/null; then
                brew install ollama
            else
                curl -fsSL https://ollama.ai/install.sh | sh
            fi
            ;;
        linux)
            curl -fsSL https://ollama.ai/install.sh | sh
            ;;
    esac
    
    if command -v ollama &> /dev/null; then
        echo "✅ Ollama installed"
        # Start Ollama
        if ! pgrep -x "ollama" > /dev/null; then
            echo "🚀 Starting Ollama..."
            if [ "${OS_TYPE}" = "darwin" ]; then
                brew services start ollama 2>/dev/null || ollama serve &
            else
                systemctl --user start ollama 2>/dev/null || ollama serve &
            fi
            sleep 3
        fi
    else
        echo "⚠️  Ollama installation may have failed"
    fi
}

# Function to select and download models
select_models() {
    echo ""
    echo "🤖 Available AI Models:"
    echo ""
    echo "  1) llama3.1:8b      (~4.7 GB) - Recommended"
    echo "  2) phi3              (~2.3 GB) - Lightweight"
    echo "  3) mistral:7b        (~4.1 GB) - Good balance"
    echo "  4) gemma:7b          (~5.2 GB) - Google's model"
    echo "  5) qwen2.5:7b        (~4.7 GB) - High quality"
    echo "  6) Skip"
    echo ""
    
    read -p "Select model to install (1-6): " -n 1 -r
    echo
    
    case $REPLY in
        1) MODEL="llama3.1:8b" ;;
        2) MODEL="phi3" ;;
        3) MODEL="mistral:7b" ;;
        4) MODEL="gemma:7b" ;;
        5) MODEL="qwen2.5:7b" ;;
        6)
            echo "⏭️  Skipping model installation"
            return
            ;;
        *)
            echo "⚠️  Invalid choice, using default: llama3.1:8b"
            MODEL="llama3.1:8b"
            ;;
    esac
    
    echo "📥 Downloading model: $MODEL..."
    ollama pull "$MODEL" || echo "⚠️  Download failed"
    
    # Save to config
    mkdir -p ~/.dso
    echo "DSO_MODEL=$MODEL" > ~/.dso/config
    echo "✅ Default model set to: $MODEL"
}

# Check/Install Ollama
if ! command -v ollama &> /dev/null; then
    install_ollama
else
    echo "✅ Ollama found"
fi

# Select and download models
if command -v ollama &> /dev/null; then
    INSTALLED=$(ollama list 2>/dev/null | tail -n +2 | wc -l | tr -d ' ')
    if [ "$INSTALLED" -gt 0 ]; then
        echo "✅ Models already installed:"
        ollama list 2>/dev/null | tail -n +2 | awk '{print "  • " $1}'
        read -p "Install additional models? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            select_models
        fi
    else
        select_models
    fi
fi

echo ""
echo "🎉 Installation completed!"
echo ""
echo "To use DSO:"
echo "  ./${BINARY_NAME} audit ."
echo ""

# Installation instructions based on OS
if [ "${OS_TYPE}" = "linux" ]; then
    echo "To install globally (Linux):"
    echo "  sudo cp ${BINARY_NAME} /usr/local/bin/"
    echo "  sudo chmod +x /usr/local/bin/${BINARY_NAME}"
elif [ "${OS_TYPE}" = "darwin" ]; then
    echo "To install globally (macOS):"
    echo "  sudo cp ${BINARY_NAME} /usr/local/bin/"
    echo "  sudo chmod +x /usr/local/bin/${BINARY_NAME}"
    echo ""
    echo "Or using Homebrew (if installed):"
    echo "  brew install --formula ${BINARY_NAME}"
fi

echo ""
echo "💡 For Windows installation, see: README.md or run install.ps1"
