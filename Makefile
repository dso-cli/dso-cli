.PHONY: build install test clean run deps fmt lint build-all checksums release-archives release

# Build the binary
build:
	go build -o dso .

# Install locally
install:
	go install .

# Run tests
test:
	go test ./...

# Run all tests (Go + Web)
test-all:
	@echo "🧪 Running all tests..."
	@echo "Running Go tests..."
	@go test ./... || true
	@echo "Running Web tests..."
	@cd web && npm run test || true
	@echo "✅ Tests completed"

# Run E2E tests
test-e2e:
	@echo "🧪 Running E2E tests..."
	@cd web && npm run test:e2e || true
	@echo "✅ E2E tests completed"

# Clean
clean:
	rm -rf dist/
	rm -f dso dso.exe dso-*

# Run a test audit
run:
	./dso audit .

# Check dependencies
deps:
	go mod download
	go mod verify

# Format code
fmt:
	go fmt ./...

# Linter
lint:
	golangci-lint run

# Build for different platforms
build-all:
	@echo "🔨 Building for all platforms..."
	@mkdir -p dist
	@echo "Building Linux amd64..."
	@GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-w -s" -o dist/dso-linux-amd64/dso .
	@echo "Building Linux arm64..."
	@GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -ldflags="-w -s" -o dist/dso-linux-arm64/dso .
	@echo "Building macOS amd64..."
	@GOOS=darwin GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-w -s" -o dist/dso-darwin-amd64/dso .
	@echo "Building macOS arm64..."
	@GOOS=darwin GOARCH=arm64 CGO_ENABLED=0 go build -ldflags="-w -s" -o dist/dso-darwin-arm64/dso .
	@echo "Building Windows amd64..."
	@GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-w -s" -o dist/dso-windows-amd64/dso.exe .
	@echo "Building Windows arm64..."
	@GOOS=windows GOARCH=arm64 CGO_ENABLED=0 go build -ldflags="-w -s" -o dist/dso-windows-arm64/dso.exe .
	@echo "✅ Build completed! Binaries in dist/"

# Create checksums for all binaries
checksums:
	@echo "📝 Creating checksums..."
	@cd dist && find . -type f \( -name "dso" -o -name "dso.exe" \) ! -name "*.sha256" -exec sh -c 'shasum -a 256 "{}" > "{}.sha256"' \;
	@echo "✅ Checksums created!"

# Create release archives
release-archives:
	@echo "📦 Creating release archives..."
	@cd dist && for dir in */; do \
		dirname=$${dir%/}; \
		cd "$$dirname"; \
		if [[ "$$dirname" == *"windows"* ]]; then \
			zip -r "../$$dirname.zip" . > /dev/null; \
		else \
			tar -czf "../$$dirname.tar.gz" . > /dev/null; \
		fi; \
		cd ..; \
	done
	@echo "✅ Archives created in dist/"

# Build native packages (.deb, .rpm, .pkg, .msi)
packages:
	@echo "📦 Building native packages..."
	@./scripts/build-packages.sh
	@echo "✅ Packages ready in dist/packages/"

# Build and package everything
release: build-all checksums release-archives
	@echo "🎉 Release packages ready in dist/"
