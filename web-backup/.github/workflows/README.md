# GitHub Actions Workflows

This directory contains automated workflows for CI/CD and security scanning.

## Workflows

### 1. CI/CD Pipeline (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

#### Quality Check
- TypeScript type checking
- ESLint code linting
- Runs on every push and PR

#### Test
- Runs Vitest test suite
- Generates code coverage reports
- Uploads coverage artifacts
- Only runs if quality checks pass

#### Build
- Builds the production application
- Validates build succeeds
- Uploads build artifacts
- Only runs if tests pass

#### Bundle Analysis
- Analyzes the bundle size
- Reports bundle size in workflow logs
- Only runs after successful build

**Workflow Status:**
This ensures that:
- ✅ Code quality is maintained
- ✅ All tests pass before merging
- ✅ Application builds successfully
- ✅ Bundle size is tracked

### 2. Security Scan (`security.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch
- Scheduled: Every Monday at 9 AM UTC

**Jobs:**

#### Dependency Audit
- Runs `npm audit` to check for known vulnerabilities
- Reports security issues with moderate severity or higher
- Suggests fixes with `npm audit fix --dry-run`

## Adding Environment Variables

For the build job to work with your environment variables, add them to GitHub Secrets:

1. Go to your repository Settings
2. Navigate to Secrets and Variables → Actions
3. Add the following secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - Any other environment variables your app needs

Then uncomment the relevant lines in `ci.yml`:

```yaml
env:
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

## Running Tests Locally

Before pushing, you can run the same checks locally:

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Tests
npm run test:run

# Coverage
npm run test:coverage

# Build
npm run build
```

## CI/CD Pipeline Flow

```
┌─────────────────┐
│  Push / PR      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Quality Check   │ ← TypeScript + ESLint
└────────┬────────┘
         │ (passes)
         ▼
┌─────────────────┐
│     Tests       │ ← Vitest + Coverage
└────────┬────────┘
         │ (passes)
         ▼
┌─────────────────┐
│     Build       │ ← Vite Build
└────────┬────────┘
         │ (succeeds)
         ▼
┌─────────────────┐
│ Bundle Analysis │ ← Size Check
└─────────────────┘
```

## Troubleshooting

### Workflow fails on type-check
- Run `npm run type-check` locally to see TypeScript errors
- Fix type errors before pushing

### Workflow fails on lint
- Run `npm run lint` locally
- Fix linting issues or run `npm run lint -- --fix` for auto-fixes

### Workflow fails on tests
- Run `npm run test` locally to debug failing tests
- Ensure all tests pass before pushing

### Build fails
- Check environment variables are set in GitHub Secrets
- Verify build works locally with `npm run build`
