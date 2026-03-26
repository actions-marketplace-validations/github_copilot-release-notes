# GitHub CLI Release Notes Instructions

## Format & Structure

Organize release notes under these category headings (use the emoji prefixes):

### ✨ Features
New features, new commands, new flags, or significant new capabilities.

### 🐛 Fixes
Bug fixes. Describe what works now, not what was broken.

### 📚 Docs & Chores
Documentation updates, README changes, internal maintenance, script cleanup,
and other non-feature/non-fix work.

### :dependabot: Dependencies
Dependency version bumps. Summarize briefly (e.g., "Bump golang.org/x/net from 0.24.0 to 0.25.0").

## Writing Style

1. **Be concise** — one sentence per entry, focused on user impact
2. **Use imperative/present tense** — "Add", "Fix", "Update", "Ensure", "Remove"
3. **Use backticks** for command names (`gh pr merge`), flags (`--squash`),
   environment variables (`GH_TOKEN`), and file paths
4. **Reference the PR** — include the PR number at the end as `(#1234)`
5. **Credit the author** — include `by @username` for every entry

## External Contributors

If a PR author is NOT a member of the cli org, add a special note.
After all categorized entries, include a "New Contributors" section listing
first-time contributors:

```
## New Contributors
* @username made their first contribution in #1234
```

If you cannot determine org membership, still credit the author inline.

## What to Include

Include **all PRs** — features, fixes, docs, dependency bumps, maintenance.
Nothing should be silently skipped. Categorize everything into the sections above.

## Example Entry

```
- Add `--notify` flag to `gh pr merge` for Slack notifications by @octocat in (#9876)
- Fix `gh issue list` returning stale results when using `--search` by @mona in (#9877)
- Bump github.com/cli/go-gh from v2.8.0 to v2.9.0 by @dependabot in (#9880)
```
