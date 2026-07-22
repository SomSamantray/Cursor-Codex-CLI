# Concepts

> Shared domain vocabulary for this project — entities, named processes, and status concepts with project-specific meaning. Seeded with core domain vocabulary, then accretes as ce-compound and ce-compound-refresh process learnings; direct edits are fine. Glossary only, not a spec or catch-all.

## Plugin integration

### Host
The agent CLI that loads this plugin and injects host-specific environment variables (Cursor, Claude Code, or CommandCode). The active host determines session project directories and which `*_PLUGIN_ROOT` env var is set.

### Host abstraction
The `host.mjs` module that resolves plugin root, plugin data dir, hook env file, and session projects directory from the active host without hardcoding Claude paths.

### Companion runtime
The shared Node layer (`codex-companion.mjs` and `lib/`) that talks to the Codex app-server broker, tracks background jobs, runs reviews, and handles session transfer. Host-agnostic once paths are resolved through the host abstraction.

### Marketplace manifest
JSON under `.cursor-plugin/` or `.claude-plugin/` that declares plugin identity, version, and install paths for the respective CLI marketplace.

## Codex workflows

### Review gate
Optional Stop hook that runs a Codex review before the agent session can end; configured via `/codex:setup`.

### Session transfer
Importing the current agent transcript (JSONL under the host projects directory) into a resumable Codex thread via `/codex:transfer`.

### Background job
A Codex task launched in the background (`--background`); tracked in workspace-keyed state and managed with `/codex:status`, `/codex:result`, and `/codex:cancel`.
