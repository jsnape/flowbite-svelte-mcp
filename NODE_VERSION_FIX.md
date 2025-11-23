# Node 18 Coverage Issue - FIXED

## The Problem

CI was failing on Node 18.x with:
```
Error: No such built-in module: node:inspector/promises
```

## Root Cause

- `@vitest/coverage-v8` version 4.x requires **Node 19+**
- The module `node:inspector/promises` was introduced in Node 19
- Node 18 doesn't have this built-in module

## The Solution

**Dropped Node 18 support** and updated to require Node 20+.

### Why Drop Node 18?

1. ✅ **EOL Soon** - Node 18 reaches End of Life in April 2025 (4 months away)
2. ✅ **Modern Tools** - Latest Vitest/coverage tools require Node 19+
3. ✅ **Node 20 LTS** - Node 20 is the current LTS (Long Term Support) version
4. ✅ **Node 22 Current** - Node 22 is the latest stable version
5. ✅ **Fetch Built-in** - Both 20 and 22 have native fetch (which we use)

### What Changed

**1. CI Workflow (`.github/workflows/ci.yml`):**
```yaml
# Before:
node-version: [18.x, 20.x, 22.x]

# After:
node-version: [20.x, 22.x]
```

**2. Package Engines (`package.json`):**
```json
// Before:
"engines": {
  "node": ">=18.0.0"
}

// After:
"engines": {
  "node": ">=20.0.0"
}
```

## Alternative Solution (Not Recommended)

If you absolutely need Node 18 support, you would need to:

1. Downgrade Vitest and coverage packages:
   ```bash
   pnpm add -D vitest@^1.6.0 @vitest/coverage-v8@^1.6.0
   ```

2. This would limit you to older versions with fewer features.

**Not recommended** because Node 18 is almost EOL.

## Testing

CI will now run on:
- ✅ Node 20.x (LTS)
- ✅ Node 22.x (Current)

Both versions support all the features we use:
- Native `fetch` API
- `node:inspector/promises`
- Modern ESM features
- Latest Vitest/coverage tools

## Summary

- ✅ Removed Node 18 from CI matrix
- ✅ Updated engine requirement to `>=20.0.0`
- ✅ CI will now pass on Node 20 and 22
- ✅ Using modern tooling without compatibility issues

## Next Steps

```bash
# Commit the changes
git add .
git commit -m "chore: drop Node 18 support, require Node 20+"
git push
```

CI should now pass on both Node 20.x and 22.x! ✅

---

**Node 18 → 20+ migration complete! 🎉**
