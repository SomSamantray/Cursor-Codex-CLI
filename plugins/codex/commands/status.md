---
description: Show running and recent Codex jobs for the current repository
argument-hint: "[job-id] [--all] [--json]"
disable-model-invocation: true
allowed-tools: Shell(node:*)
---

!`node "${CURSOR_PLUGIN_ROOT}/scripts/codex-companion.mjs" status "$ARGUMENTS"`

Present the command output to the user exactly as returned.
