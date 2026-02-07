# Testing and CI/CD Setup

This document provides an overview of the testing infrastructure and CI/CD pipelines set up for Circle Overwatch Web.

## 🧪 Testing Setup

### Installed Dependencies

- **vitest** - Fast unit test framework for Vite projects
- **@testing-library/react** - React testing utilities
- **@testing-library/jest-dom** - Custom jest matchers for DOM testing
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM implementation for Node.js
- **@vitest/ui** - Beautiful UI for running and debugging tests

### Configuration Files

#### `vitest.config.ts`
- Configured with jsdom environment for React components
- Global test utilities enabled
- Code coverage with v8 provider
- Path alias support (`@/` for `src/`)
- Setup file integration

#### `src/test/setup.ts`
- Extends Vitest with jest-dom matchers
- Automatic cleanup after each test
- Global test configuration

### Available Test Scripts

```bash
# Run tests in watch mode (interactive)
npm run test

# Run tests in UI mode (browser-based interface)
npm run test:ui

# Run tests once (for CI/CD)
npm run test:run

# Run tests with coverage report
npm run test:coverage

# TypeScript type checking
npm run type-check
```

### Running Tests Locally

```bash
# Interactive watch mode (recommended for development)
npm run test

# Visual UI mode
npm run test:ui
# Then open http://localhost:51204/__vitest__/

# Single run (like CI)
npm run test:run

# With coverage
npm run test:coverage
# Coverage report will be in ./coverage/
```

### Writing Tests

Example test file structure:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <YourComponent />
      </BrowserRouter>
    );
  });

  it('displays expected text', () => {
    render(
      <BrowserRouter>
        <YourComponent />
      </BrowserRouter>
    );

    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## 🚀 CI/CD Pipeline

### GitHub Actions Workflows

Two automated workflows are configured in `.github/workflows/`:

#### 1. CI/CD Pipeline (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

1. **Quality Check** (runs first)
   - TypeScript type checking (`npm run type-check`)
   - ESLint linting (`npm run lint`)

2. **Tests** (runs after quality check passes)
   - Runs full test suite (`npm run test:run`)
   - Generates code coverage
   - Uploads coverage reports as artifacts

3. **Build** (runs after tests pass)
   - Builds production bundle (`npm run build`)
   - Uploads build artifacts
   - Ready for deployment

4. **Bundle Analysis** (runs after build)
   - Analyzes bundle size
   - Reports size in logs

**Pipeline Flow:**
```
Push/PR → Quality Check → Tests → Build → Bundle Analysis
           ↓ fail          ↓ fail   ↓ fail
          ❌ Stop        ❌ Stop  ❌ Stop
```

#### 2. Security Scan (`security.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch
- Scheduled: Every Monday at 9 AM UTC

**Jobs:**
- Dependency vulnerability scanning
- Security audit reporting
- Automated fix suggestions

### Setting Up Environment Variables

For production builds in CI/CD:

1. Go to GitHub repository → Settings → Secrets and Variables → Actions
2. Add these secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - Any other environment variables

3. Uncomment in `.github/workflows/ci.yml`:
```yaml
env:
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

### CI/CD Best Practices

✅ **Always run locally before pushing:**
```bash
npm run type-check  # Check types
npm run lint        # Check code quality
npm run test:run    # Run all tests
npm run build       # Verify build works
```

✅ **Write tests for:**
- New components
- Bug fixes
- Critical business logic
- User interactions

✅ **Keep builds green:**
- Fix failing tests immediately
- Don't merge PRs with failing CI
- Monitor bundle size warnings

## 📊 Current Test Coverage

Run `npm run test:coverage` to see detailed coverage report.

Current status:
- ✅ 59 tests passing
- ✅ 3 test files
- ✅ All type checks passing
- ✅ Production build successful

## 🔍 Viewing CI/CD Results

After pushing to GitHub:

1. Go to your repository on GitHub
2. Click the "Actions" tab
3. View workflow runs, logs, and artifacts
4. Download coverage reports from artifacts

## 📝 Next Steps

### Recommended Improvements:

1. **Add more component tests**
   - Test all critical user flows
   - Test error states
   - Test loading states

2. **Set up deployment workflow**
   - Add deployment job after successful build
   - Deploy to staging/production environments

3. **Add E2E tests**
   - Consider Playwright or Cypress
   - Test complete user journeys

4. **Code quality gates**
   - Set minimum coverage threshold
   - Add automated PR comments with coverage

5. **Performance monitoring**
   - Add Lighthouse CI for performance scores
   - Track bundle size over time

## 🐛 Troubleshooting

### Tests failing locally but CI passes
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version matches CI (v20)

### Tests passing locally but CI fails
- Check for missing dependencies
- Verify environment variables
- Review CI logs for specific errors

### Build size warnings
- Consider code splitting with dynamic imports
- Analyze bundle with `npm run build` and review output
- Use manual chunks in Vite config if needed

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/react)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Vite Build Optimization](https://vitejs.dev/guide/build.html)
