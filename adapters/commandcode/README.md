# CommandCode adapter (v1.1)

CommandCode support is planned for **v1.1**. This directory will contain skill and agent definitions that call the shared `plugins/codex/scripts/codex-companion.mjs` runtime.

## Planned install (v1.1)

```bash
commandcode skills add SomSamantray/codex-plugin-cursor --path adapters/commandcode/skills/codex-review
```

## v1 status

Use the **Cursor Agent CLI** plugin for now:

```bash
agent plugin marketplace add SomSamantray/codex-plugin-cursor
agent plugin install codex@somsamantray-codex
```
