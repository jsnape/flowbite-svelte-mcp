# Test Suite

This directory contains the test suite for the Flowbite-Svelte MCP server.

## Test Structure

```text
tests/
├── parser.test.ts       # Unit tests for parsing logic
├── integration.test.ts  # Integration tests with real data
└── README.md           # This file
```

## Running Tests

### Run all tests
```bash
pnpm test
```

### Run tests in watch mode (auto-rerun on changes)
```bash
pnpm test:watch
```

### Run tests with coverage report
```bash
pnpm test:coverage
```

## Test Coverage

### Unit Tests (`parser.test.ts`)
Tests the core parsing and validation utilities:

- **`parseLlmsTxt()`** - Parses llms.txt format
  - ✅ Standard format parsing
  - ✅ Comment and empty line handling
  - ✅ Metadata filtering
  - ✅ Different URL prefixes
  - ✅ Nested directory paths
  - ✅ Edge cases (empty content, whitespace, etc.)

- **`isValidFilePath()`** - Validates file paths for security
  - ✅ Valid relative paths
  - ✅ Rejects empty paths
  - ✅ Rejects path traversal (`../`)
  - ✅ Rejects absolute paths (`/`, `C:\`)
  - ✅ Rejects invalid characters

- **`getDirectory()`** - Extracts directory from path
  - ✅ Nested directories
  - ✅ Root-level files

- **`getExtension()`** - Extracts file extension
  - ✅ Common extensions (.md, .txt, .json)
  - ✅ Files without extensions
  - ✅ Hidden files

- **`isValidLlmsTxtFormat()`** - Validates llms.txt format
  - ✅ Standard format
  - ✅ Edge cases

### Integration Tests (`integration.test.ts`)
Tests with real data:

- ✅ Parses actual `llms.txt` file from the project
- ✅ Validates all parsed paths
- ✅ Checks for expected directories
- ✅ Security validation
- ✅ No duplicates

## Why Testing?

### 1. **Security** 🔒
- Prevents path traversal attacks
- Validates file paths before downloading
- Ensures no malicious URLs are processed

### 2. **Reliability** ✅
- Catches regressions early
- Ensures parsing logic works correctly
- Validates edge cases

### 3. **Documentation** 📚
- Tests serve as usage examples
- Shows expected behavior
- Documents edge cases

### 4. **Confidence** 💪
- Safe to refactor
- CI/CD integration
- Quick feedback loop

## Adding New Tests

1. **Unit tests** - Add to `parser.test.ts` for pure functions
2. **Integration tests** - Add to `integration.test.ts` for end-to-end scenarios

Example test:
```typescript
import { describe, it, expect } from 'vitest';
import { parseLlmsTxt } from '../src/lib/parser';

describe('My feature', () => {
  it('should do something', () => {
    const result = parseLlmsTxt('...');
    expect(result).toEqual([...]);
  });
});
```

## CI/CD Integration

Add this to your CI pipeline:
```yaml
- name: Run tests
  run: pnpm test

- name: Check coverage
  run: pnpm test:coverage
```

## Test Philosophy

- ✅ **Test behavior, not implementation** - Focus on what functions do, not how
- ✅ **Keep tests simple** - One concept per test
- ✅ **Use descriptive names** - Test names should explain what's being tested
- ✅ **Test edge cases** - Empty input, nulls, special characters, etc.
- ✅ **Make tests independent** - Each test should run in isolation

## Coverage Goals

- Parser functions: **100%** (critical security component)
- Integration tests: Validate real-world usage
- Overall project: **>80%** coverage
