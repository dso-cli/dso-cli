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

# Check Ollama
if ! command -v ollama &> /dev/null; then
    echo "⚠️  Ollama is not installed."
    echo "   Install it from: https://ollama.ai"
    if [ "${OS_TYPE}" = "linux" ]; then
        echo "   Or run: curl -fsSL https://ollama.ai/install.sh | sh"
    elif [ "${OS_TYPE}" = "darwin" ]; then
        echo "   Or run: brew install ollama"
    fi
    echo "   Then run: ollama pull llama3.1:8b"
else
    echo "✅ Ollama found"
    
    # Check if model exists
    if ollama list 2>/dev/null | grep -q "llama3.1:8b"; then
        echo "✅ Model llama3.1:8b already installed"
    else
        echo "📥 Downloading model llama3.1:8b (this may take a few minutes)..."
        ollama pull llama3.1:8b || echo "⚠️  Download failed. You can do it manually later."
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
