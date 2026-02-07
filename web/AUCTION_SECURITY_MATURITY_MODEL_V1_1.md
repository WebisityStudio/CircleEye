# Auction Security Maturity Model & Audit Framework v1.1
**Author:** Konrad Major

This framework introduces a layered approach (Layer 0 to 2) with transition triggers, a bridge layer (1.5), tooling recommendations, and time/resource estimates. It scales with team maturity, threat model, and compliance requirements.

## Comparison Overview

| Layer | Name | Description | Scope | Tools | Time Estimate |
| --- | --- | --- | --- | --- | --- |
| 0 | Pre-Launch | Absolute beginner safety checks | No default creds, HTTPS, backups, supported versions | Manual only | 5-10 minutes |
| 1 | Dev-Friendly | Indie devs / small projects | Authentication/Authorization, validation, secrets, dependencies, logging, infra basics | npm audit, pip-audit, GitHub alerts, OWASP ZAP, SQLMap | 2-4 hours solo / 1 day small team |
| 1.5 | Bridge | Scaling teams before full enterprise maturity | Basic RLS, connection pooling, dependency scanning, rate limiting, backup encryption | Snyk/Dependabot, WAF/Cloudflare, pgAudit | 2-5 days |
| 2 | Enterprise | SaaS, multi-tenant, regulated industries | Full audit of code, DB, RLS, infra, ops, compliance | SAST (Checkmarx/Snyk), DAST (Burp Pro), SIEM (Splunk) | 1-2 weeks (audit), 3-4 weeks (with fixes) |

## Transition Triggers (When to Upgrade)

Move to the next layer when:
- Processing payments or PII for more than 1000 users
- Multi-tenant architecture with data isolation requirements
- Regulatory compliance required (HIPAA, PCI DSS, SOC 2, GDPR)
- After a security incident or audit finding
- Before Series A funding (due diligence requirement)

## Layer Prompts

### Layer 0: Pre-Launch Prompt
Act as a security reviewer for an early project before launch. Check only the most basic issues:
- No default credentials in use (e.g., admin/admin, password123).
- No .env files or secrets committed to version control.
- HTTPS enabled (Let's Encrypt if needed).
- At least one working backup exists.
- Using supported framework/runtime versions.

Output: A yes/no checklist confirming whether these basics are satisfied.

### Layer 1: Lightweight Security Audit Prompt
Act as a security reviewer for a small project. Cover:
- Authentication: password hashing, reset flows
- Authorization: role checks, no privilege escalation
- Data validation: input sanitization, prevent SQLi/XSS
- Secrets: no hardcoded credentials, safe environment handling
- Dependencies: check for outdated libraries and known CVEs
- Logging/monitoring: no sensitive data leakage, error handling
- Infrastructure: HTTPS enabled, no debug flags in production

Output: Provide findings in a simple checklist format with pass/fail for each item and notes.

### Layer 1.5: Scaling Security Prompt
Act as a reviewer for a growing project. In addition to Layer 1, also cover:
- Basic RLS or equivalent tenant isolation on sensitive tables
- Connection pooling hygiene (session resets, safe defaults)
- Automated dependency scanning in CI/CD pipeline
- Rate limiting applied to public endpoints
- Backups are encrypted and tested

Output: Provide a pass/fail checklist with remediation notes and tool recommendations.

### Layer 2: Enterprise Security Audit Prompt
Act as an expert security researcher. Perform a full security audit.

Phase 0: Scoping
- Languages, frameworks, database type, environment, threat model

Phase 1: Analysis & Vulnerability Identification
- Authentication/session management
- Authorization & access control (including RLS)
- Database security (SQLi, privilege abuse, search_path, migrations, PITR gaps)
- Input validation & sanitization
- Data handling & encryption (PII, PCI, PHI)
- API security (authn/authz, SSRF, CSRF, rate limiting)
- Secrets management
- Dependency management (SBOM, CVEs)
- Error handling & logging
- Security configuration
- Cryptography

Phase 2: Remediation
- Document risk, exploit scenario, remediation (code + DB + infra), alternatives, implications

Phase 3: Implementation & Verification
- Before/after code & DDL
- Replay exploits, rerun SAST/DAST/linters
- Performance regression testing:
  - Benchmark queries with RLS
  - Add supporting indexes
  - Monitor optimizer plans
- Operational hardening:
  - TLS enforcement
  - VPC isolation
  - Audit logging
  - PITR (point-in-time recovery)
  - Encrypted backups

Output: Structured Markdown report with findings, severity ratings, and remediation proposals.

---

This maturity model is a scalable path from bare-minimum pre-launch hygiene (Layer 0) to full enterprise-grade audits (Layer 2).
