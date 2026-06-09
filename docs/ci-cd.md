# CI/CD Quality Gates

Talent Sprint uses GitHub Actions as the deployment gate. The pipeline intentionally runs checks in
this order:

1. Unit checks
2. Automation tests
3. Security, pen-test, and quality scans
4. Vercel deployment

The Vercel Git integration is disabled in `vercel.json` so a Git push does not bypass the pipeline.
Deployments should happen through the `deploy_vercel` job after all required checks pass.

## Workflow

Primary workflow:

```text
.github/workflows/ci-cd.yml
```

Scheduled CodeQL scan:

```text
.github/workflows/codeql.yml
```

## Gate 1: Unit Tests

The `unit_tests` job runs first:

```bash
npm ci
npm run test:unit
npm run lint
npm run typecheck
```

This catches lint, type, business logic, scoring, authorization, and question-bank regressions before
automation tests start.

## Gate 2: Automation Tests

The `automation_tests` job runs only after unit tests pass:

```bash
npx playwright install --with-deps chromium
npm run test:automation
```

Automation covers candidate, examiner, and administrator role journeys, positive and negative
authorization checks, practice selection/solve/report flow, assessment submission, email API
validation, and basic reflected-script smoke checks.

## Gate 3: Security and Quality

Security/quality jobs run only after automation passes.

### Dependency Audit

The pipeline blocks deployment for high and critical npm vulnerabilities:

```bash
npm run security:audit
```

Moderate findings are printed but not currently deployment-blocking because the current Next.js
PostCSS advisory suggests a breaking downgrade. This can be tightened later once the upstream fix is
available in the selected Next.js version.

### CodeQL

CodeQL scans JavaScript and TypeScript code and publishes alerts to GitHub code scanning.

### Semgrep SAST

Semgrep Community Edition runs open-source static analysis rules:

```bash
semgrep scan --config p/default --config p/javascript --config p/typescript --error
```

This catches common insecure coding patterns before deployment. It is intentionally separate from
CodeQL so both engines can catch different classes of findings.

### Secret Scan

Gitleaks scans the Git history for accidentally committed secrets:

```bash
gitleaks git --redact --verbose
```

This blocks hardcoded API keys, tokens, private keys, and similar credential leaks.

### OWASP ZAP Baseline

The pipeline builds the production app, starts it locally, and runs the OWASP ZAP baseline scan
against the local URL before deployment:

```text
zaproxy/action-baseline@v0.15.0
```

The baseline scan is a passive/non-invasive DAST check. It fails the workflow when ZAP reports
alerts, and uploads the ZAP report as a workflow artifact.

### SonarQube / SonarCloud

SonarQube scan is configured but opt-in:

```text
SONAR_ENABLED=true
SONAR_TOKEN=<repository secret>
```

The scanner uses:

```text
SonarSource/sonarqube-scan-action@v7
```

and waits for the quality gate:

```text
sonar.qualitygate.wait=true
```

Configure project identity in:

```text
sonar-project.properties
```

Update `sonar.projectKey` and `sonar.organization` if the SonarCloud organization differs from the
GitHub owner.

## Gate 4: Deployment

Deployment runs only after dependency audit, CodeQL, Semgrep, Gitleaks, OWASP ZAP, and SonarQube
quality gate succeed or SonarQube is intentionally skipped.

Required GitHub repository secrets:

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

If those secrets are missing, the deploy job does not deploy and prints a clear message.

## Branch Protection Recommendation

In GitHub repository settings, protect `main` and require these checks before merge:

```text
1. Unit Tests
2. Automation Tests
3a. Dependency Vulnerability Gate
3b. CodeQL Security Analysis
3c. Semgrep SAST
3d. Secret Scan
3e. OWASP ZAP Baseline
3f. SonarQube Quality Gate
```

If SonarQube is not enabled yet, keep the `SONAR_ENABLED` repository variable unset and do not require
that check until the Sonar project and token are configured.

## References

- GitHub Actions workflow: `.github/workflows/ci-cd.yml`
- CodeQL scheduled scan: `.github/workflows/codeql.yml`
- Sonar project configuration: `sonar-project.properties`
- Vercel Git deploy bypass disabled: `vercel.json`
- SonarQube GitHub Actions quality gate:
  `https://docs.sonarsource.com/sonarqube-cloud/analyzing-source-code/ci-based-analysis/github-actions-for-sonarcloud`
- GitHub CodeQL code scanning:
  `https://docs.github.com/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning-with-codeql`
- Playwright CI setup:
  `https://playwright.dev/docs/ci`
- Vercel Git deployment configuration:
  `https://vercel.com/docs/project-configuration/git-configuration`
- Semgrep Community Edition in CI:
  `https://docs.semgrep.dev/deployment/oss-deployment`
- Gitleaks secret scanning:
  `https://github.com/gitleaks/gitleaks`
- OWASP ZAP baseline action:
  `https://github.com/zaproxy/action-baseline`
