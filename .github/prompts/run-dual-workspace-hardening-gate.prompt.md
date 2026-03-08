---
name: "Run Dual Workspace Hardening Gate"
description: "Run the alec-hq dual-workspace hardening gate against the current working-tree change set and return the boundary classification decision in guard format."
argument-hint: "Optional scope override or notes about the diff under review."
agent: "Dual Workspace Boundary Guard"
tools: [execute, read, search]
---
Run the dual-workspace classification hardening gate against the current working-tree change set in this workspace.

Primary references:
- [dual-workspace spec](../../docs/dual-workspace-catalog-execution-spec.md)
- [guard agent](../agents/dual-workspace-boundary-guard.agent.md)

Required process:
1. Inspect the current working-tree change set first, including staged, unstaged, and untracked files.
2. Enumerate changed files and identify which ones intersect schema, migrations, database types, routes, queries, mappers, validation, auth, hooks, stores, tests, or documentation.
3. Read only the files needed to classify and validate the boundary-sensitive changes.
4. Apply the classification hardening gate from the spec to the changed artifacts only.
5. If the diff is empty, return PASS with a short reason stating that no changed artifacts were found.

Use this command sequence as the starting point when available:

```powershell
git status --short
git diff --name-only
git diff --cached --name-only
git ls-files --others --exclude-standard
git diff --stat
```

If a comparison target is needed and the working tree is clean, compare against the default branch head.

Output requirements:
- Return exactly the guard agent format.
- Base the Classification Inventory on changed files only.
- For files outside the hardening-gate scope, state that they were reviewed and deemed out of scope.
- If any artifact is UNKNOWN or any enforcement layer fails, return FAIL and include the required archive path and archive actions in Next Action.