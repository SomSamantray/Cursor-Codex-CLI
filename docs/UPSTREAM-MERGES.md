# Upstream merges

This repository is a fork of [openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc). Keep an `upstream` remote pointed at OpenAI's repository and merge tagged releases periodically.

## Routine merge

```bash
git fetch upstream
git checkout main
git merge upstream/main
npm test
```

Resolve conflicts, run tests, and push to `origin`.

## Conflict-prone files

These files carry Cursor-specific changes and are most likely to conflict during upstream merges:

| Area | Files |
|------|-------|
| Host abstraction | `plugins/codex/scripts/lib/host.mjs`, `plugins/codex/scripts/lib/session-transfer.mjs` |
| Hooks | `plugins/codex/hooks/hooks.json`, `plugins/codex/scripts/session-lifecycle-hook.mjs` |
| Commands | `plugins/codex/commands/*.md` |
| Agents / skills | `plugins/codex/agents/codex-rescue.md`, `plugins/codex/skills/codex-cli-runtime/SKILL.md` |
| Packaging | `.cursor-plugin/*`, `.claude-plugin/marketplace.json`, `README.md` |
| Tests | `tests/commands.cursor.test.mjs`, `tests/host.test.mjs` |

## Merge strategy

1. Merge upstream runtime changes in `plugins/codex/scripts/lib/codex.mjs`, `app-server.mjs`, and broker code first.
2. Re-apply host abstraction and Cursor command/tool naming on top.
3. Keep `.cursor-plugin/` and Cursor README install docs out of upstream conflict resolution when possible (they are fork-only).
4. Run `npm test` before tagging a release.

## Versioning

Fork releases use `1.x.y` starting at `1.1.0`. Upstream `1.0.x` tags map to the OpenAI plugin baseline this fork extended.
