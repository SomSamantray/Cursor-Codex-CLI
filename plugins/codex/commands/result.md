---
description: Show the final stored Codex output for a finished job
argument-hint: "[job-id] [--json]"
disable-model-invocation: true
allowed-tools: Shell(node:*)
---

!`node "${CURSOR_PLUGIN_ROOT}/scripts/codex-companion.mjs" result "$ARGUMENTS"`

Present the command output to the user exactly as returned.
