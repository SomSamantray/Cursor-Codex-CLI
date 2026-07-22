---
title: "Fork codex-plugin-cc for Cursor Agent CLI with host abstraction"
date: "2026-07-22"
category: architecture-patterns
module: codex-plugin
problem_type: architecture_pattern
component: tooling
severity: medium
applies_when:
  - "Porting a Claude Code plugin to Cursor Agent CLI while keeping upstream mergeable"
  - "One Node runtime must serve multiple agent CLIs with different session paths and env vars"
tags:
  - codex
  - cursor
  - plugin
  - host-abstraction
  - fork
---

# Fork codex-plugin-cc for Cursor Agent CLI with host abstraction

## Context

OpenAI's [codex-plugin-cc](https://github.com/openai/codex-plugin-cc) integrates Codex into Claude Code via slash commands, hooks, and a shared Node companion (`codex-companion.mjs`). Cursor Agent CLI (`agent`) uses a parallel plugin marketplace (`.cursor-plugin/`) and different tool names (`Shell`, `AskQuestion`, `Task`) and session directories (`~/.cursor/projects`). A greenfield rewrite would duplicate fragile app-server broker and job-tracking logic.

## Guidance

Fork upstream and introduce a thin **host abstraction** (`plugins/codex/scripts/lib/host.mjs`) instead of scattering host checks across the runtime.

**Centralize host resolution:**

- `hostName()` — detect active CLI from `CURSOR_PLUGIN_ROOT`, `COMMANDCODE_PLUGIN_ROOT`, or `CLAUDE_PLUGIN_ROOT`
- `resolvePluginRoot()` — first set env var wins, else fallback from `import.meta.url`
- `resolveHostProjectsDir()` — map host to `~/.cursor/projects`, `~/.claude/projects`, or `~/.commandcode/projects`
- `resolvePluginDataEnvName()` / `resolveHookEnvFile()` — host-aware state and hook env injection

**Rename session transfer generically:** replace Claude-only `claude-session-transfer.mjs` with `session-transfer.mjs` that validates JSONL paths under any allowed projects dir. Keep `claude-session-transfer.mjs` as a thin re-export for upstream merge compatibility.

**Package for Cursor without dropping Claude manifests:**

- Add `.cursor-plugin/marketplace.json` and `.cursor-plugin/plugin.json` for `agent plugin marketplace add`
- Keep `.claude-plugin/` so upstream merges stay mechanical
- Point command markdown and skills at `${CURSOR_PLUGIN_ROOT}` for the primary host; runtime code uses `host.mjs` for dual-host behavior

**Adapt command prose only where the host contract differs:**

| Claude Code | Cursor Agent CLI |
|-------------|------------------|
| `Bash(...)` | `Shell(...)` |
| `AskUserQuestion` | `AskQuestion` |
| `Agent` subagent | `Task` subagent |
| `CLAUDE_PLUGIN_ROOT` | `CURSOR_PLUGIN_ROOT` |

**Hooks:** use shell fallback so one `hooks.json` works for both marketplaces:

```json
"command": "sh -c 'node \"${CURSOR_PLUGIN_ROOT:-$CLAUDE_PLUGIN_ROOT}/scripts/session-lifecycle-hook.mjs\" SessionStart'"
```

**Track upstream:** add `upstream` remote, document merge workflow in `docs/UPSTREAM-MERGES.md`, bump both marketplace manifests in `scripts/bump-version.mjs`.

## Why This Matters

The companion runtime (broker lifecycle, git-backed reviews, background jobs) is host-agnostic once paths and env vars are abstracted. Host-specific work stays in markdown templates, marketplace JSON, and `host.mjs` — the layers upstream merge conflicts actually hit. Without this split, every upstream security fix in `codex-companion.mjs` risks breaking Cursor packaging or reintroducing hardcoded `~/.claude/projects` paths.

## When to Apply

- Porting any multi-host agent plugin (Cursor + Claude + future CLIs)
- Maintaining a fork that must track an upstream single-host repo
- Adding a second host integration surface (e.g. CommandCode skills in `adapters/commandcode/` for v1.1)

## Examples

**Before (Claude-only session validation):**

```javascript
// Hardcoded ~/.claude/projects check
```

**After (multi-host):**

```javascript
import { resolveHostSessionPath } from "./session-transfer.mjs";

const source = resolveHostSessionPath(cwd, { host: hostName() });
```

**Cursor install flow:**

```bash
agent plugin marketplace add SomSamantray/Cursor-Codex-CLI
agent plugin install codex@somsamantray-codex
# in agent session: /reload-plugins → /codex:setup
```

**Test matrix:** add `tests/host.test.mjs` for env precedence and `tests/commands.cursor.test.mjs` (or extend `commands.test.mjs`) to lock Cursor tool names and `${CURSOR_PLUGIN_ROOT}` wiring.

## Related

- [docs/UPSTREAM-MERGES.md](../../UPSTREAM-MERGES.md) — merge workflow
- [adapters/commandcode/README.md](../../../adapters/commandcode/README.md) — v1.1 CommandCode path
- Upstream: [openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc)
