# npm-audit-guard

A powerful CLI tool for npm security audits with blacklist functionality, progress bar, and JUnit XML reports for CI/CD integration.

## ✨ Features

- 🔍 **Security Scanning**: Runs npm audit and groups vulnerabilities by severity level
- 🚫 **Blacklist Function**: Ignore known packages and display them separately
- ⚡ **Progress Bar**: Visual feedback during the audit process
- 📊 **JUnit XML Reports**: Perfect for Jenkins, GitLab CI, and other CI/CD systems
- ⚙️ **Config File Support**: Configuration via `.auditguardrc.json` file
- 🎨 **Colored Output**: Clear, color-coded terminal output
- 🔄 **Flexible Options**: Scan with or without dev dependencies

## 📦 Installation

### Global

```bash
npm install -g npm-audit-guard
```

### Local (per project)

```bash
npm install --save-dev npm-audit-guard
```

## 🚀 Usage

### Basic Scan

Standard scan without dev dependencies:

```bash
audit-guard
```

or with npx:

```bash
npx npm-audit-guard
```

### With Dev Dependencies

```bash
audit-guard --dev
```

### With Blacklist

```bash
audit-guard --blacklist="axios,lodash,moment"
```

### JUnit XML Report

```bash
# Standard output (./audit-results.xml)
audit-guard --junit

# Custom output path
audit-guard --junit --output="./test-results/security-audit.xml"
```

**Important:** The JUnit XML also includes **blacklist warnings as failures**!  
If a package is on the blacklist but has no security issues, this will be reported as a failure in Jenkins/CI.  
This helps keep your blacklist clean.

### Combined

```bash
audit-guard --dev --blacklist="old-package,legacy-dep" --junit --output="./reports/audit.xml"
```

## 📋 Example Output

```
Running security audit... [████████████████████] 100%

Security Audit Results:

Critical:
- axios (>=0.8.1 <0.21.2)
- lodash (>=1.0.0 <4.17.21)

High:
- express (>=4.0.0 <4.17.3)

Moderate:
- moment (>=2.0.0 <2.29.2)

Low:
(none)

Ignored:
- old-package (high)
- legacy-dep (moderate)

Warning: Following blacklisted packages have no security issues: another-package

Total vulnerabilities found: 4 (excluding ignored)
```

## ⚙️ Configuration

### Config File (.auditguardrc.json)

Create a `.auditguardrc.json` file in your project root:

```json
{
  "blacklist": [
    "package-name-1",
    "package-name-2",
    "old-legacy-package"
  ],
  "includeDev": false
}
```

**Note:** CLI parameters override config file settings.

### CLI Options

| Option | Description | Example |
|--------|-------------|---------|
| `--dev` | Include dev dependencies in scan | `audit-guard --dev` |
| `--blacklist <packages>` | Comma-separated list of packages to ignore | `audit-guard --blacklist="pkg1,pkg2"` |
| `--junit` | Generate JUnit XML report | `audit-guard --junit` |
| `--output <path>` | Path for JUnit XML output | `audit-guard --output="./reports/audit.xml"` |
| `--help` | Display help | `audit-guard --help` |
| `--version` | Display version | `audit-guard --version` |

## 🔄 CI/CD Integration

### Jenkins

```groovy
pipeline {
    agent any
    stages {
        stage('Security Audit') {
            steps {
                sh 'npx npm-audit-guard --junit --output="./test-results/audit.xml"'
            }
            post {
                always {
                    junit 'test-results/audit.xml'
                }
            }
        }
    }
}
```

### GitLab CI

```yaml
security_audit:
  script:
    - npx npm-audit-guard --junit --output="audit-results.xml"
  artifacts:
    when: always
    reports:
      junit: audit-results.xml
```

### GitHub Actions

```yaml
name: Security Audit

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx npm-audit-guard --junit --output="audit-results.xml"
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: audit-results
          path: audit-results.xml
```

## 📊 Exit Codes

| Code | Meaning |
|------|---------|
| `0` | No vulnerabilities found (or all ignored) |
| `1` | Vulnerabilities found |
| `2` | Execution error (e.g., no package.json) |

## 📄 Requirements

- Node.js >= 16.0.0
- npm >= 7.0.0

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.
