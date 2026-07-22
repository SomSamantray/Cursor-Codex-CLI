import fs from "node:fs";
import path from "node:path";

import { ensureAbsolutePath } from "./fs.mjs";
import { hostName, listAllowedSessionProjectDirs, resolveHostProjectsDir } from "./host.mjs";

export const TRANSCRIPT_PATH_ENV = "CODEX_COMPANION_TRANSCRIPT_PATH";

function resolveUserPath(cwd, value) {
  if (value === "~") {
    return process.env.HOME ?? "";
  }
  if (String(value).startsWith("~/")) {
    const home = process.env.HOME ?? "";
    return path.join(home, String(value).slice(2));
  }
  return ensureAbsolutePath(cwd, value);
}

function isPathWithinProjectsDir(sourcePath, projectsDir) {
  let source;
  let projects;
  try {
    source = fs.realpathSync(sourcePath);
    projects = fs.realpathSync(projectsDir);
  } catch {
    return false;
  }
  const relative = path.relative(projects, source);
  return !(relative === "" || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative));
}

function formatAllowedProjectsDirs() {
  return listAllowedSessionProjectDirs().join(", ");
}

export function resolveHostSessionPath(cwd, options = {}) {
  const requestedPath = options.source || process.env[TRANSCRIPT_PATH_ENV];
  if (!requestedPath) {
    throw new Error(
      "Could not identify the current agent transcript. Retry with --source <path-to-session-jsonl>."
    );
  }

  const sourcePath = resolveUserPath(cwd, requestedPath);
  if (path.extname(sourcePath) !== ".jsonl") {
    throw new Error(`Session source must be a JSONL file: ${sourcePath}`);
  }

  let source;
  try {
    source = fs.realpathSync(sourcePath);
  } catch {
    throw new Error(`Session file not found: ${sourcePath}`);
  }

  const preferredProjectsDir = resolveHostProjectsDir(options.host);
  const candidateDirs = preferredProjectsDir ? [preferredProjectsDir] : listAllowedSessionProjectDirs();
  if (candidateDirs.some((projectsDir) => isPathWithinProjectsDir(source, projectsDir))) {
    return source;
  }

  const host = options.host ?? hostName();
  throw new Error(
    `Codex can import agent sessions only from supported project directories (${formatAllowedProjectsDirs()}). Host: ${host}. Path: ${source}`
  );
}

export function resolveClaudeSessionPath(cwd, options = {}) {
  return resolveHostSessionPath(cwd, { ...options, host: options.host ?? "claude" });
}
