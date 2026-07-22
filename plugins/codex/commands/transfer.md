---
description: Transfer the current Cursor Agent session into a resumable Codex thread
argument-hint: "[--source <session-jsonl>]"
disable-model-invocation: true
allowed-tools: Shell(node:*)
---

!`node "${CURSOR_PLUGIN_ROOT}/scripts/codex-companion.mjs" transfer "$ARGUMENTS"`

Present the command output to the user exactly as returned. Preserve the Codex session ID and the `codex resume <session-id>` command.
