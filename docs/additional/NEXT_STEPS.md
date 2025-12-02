# Next Steps - DSO CLI

This document lists recommended next steps to improve DSO CLI.

## Completed

- [x] All TODOs implemented
- [x] API integration tests created
- [x] E2E tests improved
- [x] CI/CD workflow configured
- [x] Complete test documentation
- [x] Make commands for tests

## To Do (High Priority)

### 1. Go Unit Tests
- [ ] Add tests for `internal/scanner/`
- [ ] Add tests for `internal/llm/`
- [ ] Add tests for `internal/fixer/`
- [ ] Add tests for `internal/tools/`
- [ ] Goal: > 70% coverage

### 2. Documentation Improvement
- [ ] Detailed installation guide by platform
- [ ] Advanced configuration guide
- [ ] Usage examples by use case
- [ ] FAQ
- [ ] Troubleshooting guide

### 3. Performance
- [ ] Scan results caching
- [ ] Scanner parallelization
- [ ] Ollama call optimization
- [ ] API response compression

## To Do (Medium Priority)

### 4. Advanced Features
- [ ] Slack/Teams support for notifications
- [ ] Gemini/Claude API support (in addition to Ollama)
- [ ] Export to Jira, Linear, etc.
- [ ] Optional web dashboard with history
- [ ] Supabase integration for storage

### 5. Security
- [ ] Code security audit
- [ ] Go and npm dependency scanning
- [ ] Binary signatures
- [ ] Integrity verification

### 6. UX/UI
- [ ] Improve interactive TUI interface
- [ ] Themes for web interface
- [ ] Dark/light mode
- [ ] Internationalization (i18n)

## To Do (Low Priority)

### 7. Infrastructure
- [ ] Official Docker image
- [ ] Helm chart for Kubernetes
- [ ] Terraform provider
- [ ] VS Code / IntelliJ plugin

### 8. Community
- [ ] Contribution template
- [ ] Code of conduct
- [ ] Maintainer guide
- [ ] Beta tester program

## Short Term Goals (1-2 months)

1. **Test coverage > 70%**
 - Go unit tests
 - Complete integration tests
 - E2E tests for all features

2. **Complete documentation**
 - User guides
 - API documentation
 - Practical examples

3. **Optimized performance**
 - Smart caching
 - Parallelization
 - Reduced scan times

## Medium Term Goals (3-6 months)

1. **Enterprise Features**
 - Multi-tenant
 - RBAC (Role-Based Access Control)
 - Audit logs
 - SSO integrations

2. **Ecosystem**
 - System plugins
 - Rules marketplace
 - Customizable templates

3. **Scalability**
 - Support for very large projects
 - Distributed scanning
 - Queue system

## Success Metrics

- **Adoption**: > 1000 GitHub stars
- **Quality**: > 70% test coverage
- **Performance**: < 30s for average scan
- **Satisfaction**: > 4.5/5 on reviews

## Contributing

To contribute, see [CONTRIBUTING.md](../additional/CONTRIBUTING.md)

## Notes

- Features marked as "completed" are ready for production
- Priorities may change based on user feedback
- Suggestions welcome via GitHub Issues
