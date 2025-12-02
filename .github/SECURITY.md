# Security Policy

## Supported Versions

We actively support the following versions of DSO CLI with security updates:

| Version | Supported |
| ------- | ------------------ |
| 0.1.x | :white_check_mark: |
| < 0.1 | :x: |

## Reporting a Vulnerability

We take the security of DSO CLI seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do NOT:

- Open a public GitHub issue
- Discuss the vulnerability publicly
- Share the vulnerability with others until it has been resolved

### Please DO:

1. **Email us directly** at: [INSERT SECURITY EMAIL]
 - Include a detailed description of the vulnerability
 - Include steps to reproduce the issue
 - Include potential impact assessment
 - Include any suggested fixes (if you have them)

2. **Wait for our response** - We will acknowledge receipt within 48 hours

3. **Allow time for resolution** - We will work with you to understand and resolve the issue quickly

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
- **Initial Assessment**: We will provide an initial assessment within 7 days
- **Regular Updates**: We will keep you informed of our progress
- **Resolution**: We will work to resolve the issue as quickly as possible
- **Credit**: With your permission, we will credit you in our security advisories

### Security Best Practices

When using DSO CLI:

1. **Keep DSO updated**: Always use the latest version
2. **Keep tools updated**: Ensure all security tools (Trivy, gitleaks, etc.) are up to date
3. **Review findings**: Always review security findings before applying fixes
4. **Use in CI/CD**: Integrate DSO into your CI/CD pipeline for continuous security
5. **Local AI**: DSO uses local AI (Ollama) - ensure Ollama is properly secured
6. **Credentials**: Never commit credentials or secrets to your repository
7. **Permissions**: Run DSO with appropriate permissions - avoid running as root unless necessary

### Known Security Considerations

- **Local Execution**: DSO runs security tools locally - ensure your environment is secure
- **AI Model**: DSO uses Ollama for AI analysis - ensure Ollama is only accessible from trusted sources
- **File Access**: DSO scans your codebase - ensure you trust the codebase you're scanning
- **Network Access**: Some tools may download vulnerability databases - ensure network access is secure

### Security Features

DSO CLI includes several security features:

- **100% Local**: No data is sent to external servers
- **No Telemetry**: No usage data is collected
- **Open Source**: Full source code available for audit
- **Confirmation Required**: Destructive operations require confirmation
- **Read-Only by Default**: Scans are read-only unless explicitly fixing

### Responsible Disclosure

We follow responsible disclosure practices:

1. We will not disclose the vulnerability publicly until a fix is available
2. We will work with you to coordinate disclosure timing
3. We will credit you for responsible disclosure (with your permission)
4. We will provide a security advisory when the fix is released

Thank you for helping keep DSO CLI and its users safe!

