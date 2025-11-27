.PHONY: build install test clean run

# Build le binaire
build:
	go build -o dso .

# Installer localement
install:
	go install .

# Lancer les tests
test:
	go test ./...

# Nettoyer
clean:
	rm -f dso dso.exe

# Lancer un audit de test
run:
	./dso audit .

# Vérifier les dépendances
deps:
	go mod download
	go mod verify

# Format le code
fmt:
	go fmt ./...

# Linter
lint:
	golangci-lint run

# Build for different platforms
build-all:
	@echo "Building for all platforms..."
	GOOS=linux GOARCH=amd64 go build -o dso-linux-amd64 .
	GOOS=linux GOARCH=arm64 go build -o dso-linux-arm64 .
	GOOS=darwin GOARCH=amd64 go build -o dso-darwin-amd64 .
	GOOS=darwin GOARCH=arm64 go build -o dso-darwin-arm64 .
	GOOS=windows GOARCH=amd64 go build -o dso-windows-amd64.exe .
	GOOS=windows GOARCH=arm64 go build -o dso-windows-arm64.exe .
	@echo "✅ Build completed for all platforms"

