import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import {
  hostName,
  listAllowedSessionProjectDirs,
  resolveHostProjectsDir,
  resolvePluginRoot
} from "../plugins/codex/scripts/lib/host.mjs";
import { resolveHostSessionPath } from "../plugins/codex/scripts/lib/session-transfer.mjs";

test("hostName returns cursor when CURSOR_PLUGIN_ROOT is set", () => {
  const previous = process.env.CURSOR_PLUGIN_ROOT;
  process.env.CURSOR_PLUGIN_ROOT = "/tmp/cursor-plugin";
  try {
    assert.equal(hostName(), "cursor");
    assert.equal(resolveHostProjectsDir(), path.join(os.homedir(), ".cursor", "projects"));
  } finally {
    if (previous === undefined) {
      delete process.env.CURSOR_PLUGIN_ROOT;
    } else {
      process.env.CURSOR_PLUGIN_ROOT = previous;
    }
  }
});

test("resolvePluginRoot falls back to plugin tree when env is unset", () => {
  const previous = [...process.env.CURSOR_PLUGIN_ROOT ? ["CURSOR_PLUGIN_ROOT"] : [], ...process.env.CLAUDE_PLUGIN_ROOT ? ["CLAUDE_PLUGIN_ROOT"] : []];
  delete process.env.CURSOR_PLUGIN_ROOT;
  delete process.env.CLAUDE_PLUGIN_ROOT;
  delete process.env.COMMANDCODE_PLUGIN_ROOT;
  try {
    const root = resolvePluginRoot();
    assert.match(root, /plugins[\\/]codex$/);
  } finally {
    for (const name of previous) {
      // no-op; env restored below by not setting
    }
  }
});

test("resolveHostSessionPath accepts cursor project transcripts", () => {
  const projectsDir = path.join(os.homedir(), ".cursor", "projects");
  const sessionDir = path.join(projectsDir, "test-workspace");
  fs.mkdirSync(sessionDir, { recursive: true });
  const sessionFile = path.join(sessionDir, "session.jsonl");
  fs.writeFileSync(sessionFile, '{"type":"message"}\n', "utf8");

  try {
    const resolved = resolveHostSessionPath(process.cwd(), {
      source: sessionFile,
      host: "cursor"
    });
    assert.equal(resolved, fs.realpathSync(sessionFile));
  } finally {
    fs.rmSync(sessionFile, { force: true });
    fs.rmSync(sessionDir, { recursive: true, force: true });
  }
});

test("resolveHostSessionPath rejects files outside allowed project dirs", () => {
  const outside = path.join(os.tmpdir(), `codex-session-${Date.now()}.jsonl`);
  fs.writeFileSync(outside, "{}", "utf8");
  try {
    assert.throws(
      () => resolveHostSessionPath(process.cwd(), { source: outside, host: "cursor" }),
      /supported project directories/
    );
  } finally {
    fs.rmSync(outside, { force: true });
  }
});

test("listAllowedSessionProjectDirs includes cursor, claude, and commandcode", () => {
  const dirs = listAllowedSessionProjectDirs();
  assert.ok(dirs.some((dir) => dir.endsWith(`${path.sep}.cursor${path.sep}projects`)));
  assert.ok(dirs.some((dir) => dir.endsWith(`${path.sep}.claude${path.sep}projects`)));
  assert.ok(dirs.some((dir) => dir.endsWith(`${path.sep}.commandcode${path.sep}projects`)));
});
