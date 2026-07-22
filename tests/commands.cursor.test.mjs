import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLUGIN_ROOT = path.join(ROOT, "plugins", "codex");

function read(relativePath) {
  return fs.readFileSync(path.join(PLUGIN_ROOT, relativePath), "utf8");
}

test("review command uses AskQuestion and background Shell while staying review-only", () => {
  const source = read("commands/review.md");
  assert.match(source, /AskQuestion/);
  assert.match(source, /\bShell\(/);
  assert.match(source, /Do not fix issues/i);
  assert.match(source, /review-only/i);
  assert.match(source, /return Codex's output verbatim to the user/i);
  assert.match(source, /```bash/);
  assert.match(source, /```typescript/);
  assert.match(source, /review "\$ARGUMENTS"/);
  assert.match(source, /\[--scope auto\|working-tree\|branch\]/);
  assert.match(source, /block_until_ms:\s*0/);
  assert.match(source, /command:\s*`node "\$\{CURSOR_PLUGIN_ROOT\}\/scripts\/codex-companion\.mjs" review "\$ARGUMENTS"`/);
  assert.match(source, /description:\s*"Codex review"/);
  assert.doesNotMatch(source, /AskUserQuestion/);
  assert.doesNotMatch(source, /\bBash\(/);
});

test("adversarial review command uses AskQuestion and background Shell while staying review-only", () => {
  const source = read("commands/adversarial-review.md");
  assert.match(source, /AskQuestion/);
  assert.match(source, /\bShell\(/);
  assert.match(source, /Do not fix issues/i);
  assert.match(source, /review-only/i);
  assert.match(source, /return Codex's output verbatim to the user/i);
  assert.match(source, /adversarial-review "\$ARGUMENTS"/);
  assert.match(source, /block_until_ms:\s*0/);
  assert.match(source, /command:\s*`node "\$\{CURSOR_PLUGIN_ROOT\}\/scripts\/codex-companion\.mjs" adversarial-review "\$ARGUMENTS"`/);
});

test("rescue command routes through Task subagent and CURSOR_PLUGIN_ROOT", () => {
  const source = read("commands/rescue.md");
  assert.match(source, /\bTask\b/);
  assert.match(source, /codex:codex-rescue/);
  assert.match(source, /CURSOR_PLUGIN_ROOT/);
  assert.match(source, /task-resume-candidate --json/);
  assert.doesNotMatch(source, /\bAgent\b/);
});

test("simple commands invoke companion via CURSOR_PLUGIN_ROOT", () => {
  for (const command of ["transfer.md", "status.md", "result.md", "cancel.md"]) {
    const source = read(`commands/${command}`);
    assert.match(source, /CURSOR_PLUGIN_ROOT/, command);
    assert.match(source, /codex-companion\.mjs/, command);
  }
});

test("codex-rescue agent forwards through Shell and CURSOR_PLUGIN_ROOT", () => {
  const source = read("agents/codex-rescue.md");
  assert.match(source, /\bShell\b/);
  assert.match(source, /CURSOR_PLUGIN_ROOT/);
  assert.doesNotMatch(source, /\bBash\b/);
});
