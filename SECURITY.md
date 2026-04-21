# Security Policy

## Reporting a Vulnerability

If you find a security vulnerability in `@medalsocial/meda`, please report it responsibly.

**Do NOT open a public GitHub issue.**

Email: **security@medalsocial.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Impact assessment
- Suggested fix (if you have one)

## Response Process

| Stage | Timeline | Description |
|-------|----------|-------------|
| Acknowledgment | 48 hours | We confirm receipt of your report |
| Triage | 7 days | We assess severity and confirm or reject |
| Fix development | Varies by severity | Critical: 7 days. High: 30 days. Medium/Low: next release |
| Coordinated disclosure | 90 days max | We coordinate with you on public disclosure timing |
| Release + credit | At disclosure | Fix is released, reporter is credited |

We follow [coordinated vulnerability disclosure](https://en.wikipedia.org/wiki/Coordinated_vulnerability_disclosure). We will not take legal action against researchers who follow this process.

## Scope

- `@medalsocial/meda` — Shared Meda UI shell and runtime package
- React component API and exported interfaces
- Type definitions and exported utilities

## Not in Scope

- The Medal Social API itself (report to support@medalsocial.com)
- Vulnerabilities in dependencies (report upstream, but let us know too)

## Supported Versions

We support the latest release. Update with:

```bash
npm install @medalsocial/meda@latest
```

## Verifying Releases

npm packages are published with [provenance attestation](https://docs.npmjs.com/generating-provenance-statements). Verify with:

```bash
npm audit signatures
```
