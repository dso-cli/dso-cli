# Contributing Guide

Thank you for your interest in contributing to DSO! 

## How to Contribute

### 1. Fork and Clone

```bash
git clone https://github.com/your-username/dso-cli.git
cd dso-cli
```

### 2. Create a Branch

```bash
git checkout -b feature/my-new-feature
```

### 3. Develop

- Follow Go code conventions
- Add tests for new features
- Document your code

### 4. Test

```bash
make test
make build
```

### 5. Commit and Push

```bash
git commit -m "feat: add my feature"
git push origin feature/my-new-feature
```

### 6. Open a Pull Request

Create a PR on GitHub with a clear description of your changes.

## Conventions

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Refactoring
- `test:` Tests
- `chore:` Maintenance
- `style:` Code style changes (formatting, etc.)
- `perf:` Performance improvements
- `ci:` CI/CD changes
- `build:` Build system changes

Examples:
```
feat: add GitHub Actions support
fix: fix Trivy results parsing
docs: update README
refactor: improve error handling
test: add unit tests for scanner
```

### Code Style

- Use `gofmt` to format code
- Follow standard Go conventions
- Comment public functions
- Keep functions short and focused
- Use meaningful variable names
- Handle errors explicitly

### Testing

Add tests for:
- New features
- Bug fixes
- Edge cases

Run tests before submitting:
```bash
# Go tests
go test ./...

# Web tests
cd web && npm run test

# E2E tests
cd web && npm run test:e2e
```

### Code Review Process

1. All PRs require at least one approval
2. All tests must pass
3. Code must be reviewed and approved
4. Documentation must be updated if needed

## Contribution Ideas

### Easy (Good First Issues)

- [ ] Improve error messages
- [ ] Add support for more languages
- [ ] Improve documentation
- [ ] Add examples
- [ ] Fix typos in documentation

### Intermediate

- [ ] Support more scanners
- [ ] Improve AI analysis
- [ ] Add integration tests
- [ ] Support GitLab (in addition to GitHub)
- [ ] Improve UI/UX

### Advanced

- [ ] Watch mode (continuous monitoring)
- [ ] Slack/Teams integration
- [ ] OPA/Rego policy generation
- [ ] Support external AI models (OpenAI, Anthropic)
- [ ] Performance optimizations

## Development Setup

### Prerequisites

- Go 1.21+
- Node.js 18+ (for web UI)
- Ollama (for AI features)

### Setup

```bash
# Clone repository
git clone https://github.com/dso-cli/dso-cli.git
cd dso-cli

# Install Go dependencies
go mod download

# Install web dependencies
cd web && npm install && cd ..

# Build
go build -o dso .

# Run tests
make test-all
```

## Questions?

Open an issue to discuss your ideas before starting to code!

## Code of Conduct

Please be respectful, inclusive, and constructive. We're all here to learn and improve DSO together. 

See [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) for details.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

