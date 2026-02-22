---
description: Run all playwright e2e tests
---

1. Execute the playwright test suite using pnpm.
// turbo
```bash
# Ensure any existing report server is killed before running
fuser -k 9323/tcp || true
pnpm run test:e2e
pnpm exec playwright show-report
```