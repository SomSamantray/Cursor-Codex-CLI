import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOST_PROJECT_DIRS = {
  cursor: path.join(os.homedir(), ".cursor", "projects"),
  claude: path.join(os.homedir(), ".claude", "projects"),
  commandcode: path.join(os.homedir(), ".commandcode", "projects")
};

export const PLUGIN_ROOT_ENV_NAMES = ["CURSOR_PLUGIN_ROOT", "CLAUDE_PLUGIN_ROOT", "COMMANDCODE_PLUGIN_ROOT"];
export const PLUGIN_DATA_ENV_NAMES = ["CURSOR_PLUGIN_DATA", "CLAUDE_PLUGIN_DATA"];
export const HOOK_ENV_FILE_NAMES = ["CURSOR_ENV_FILE", "CLAUDE_ENV_FILE"];

export function hostName() {
  if (process.env.CURSOR_PLUGIN_ROOT) {
    return "cursor";
  }
  if (process.env.COMMANDCODE_PLUGIN_ROOT) {
    return "commandcode";
  }
  if (process.env.CLAUDE_PLUGIN_ROOT) {
    return "claude";
  }
  return "unknown";
}

export function resolvePluginRoot(fallbackDir = null) {
  for (const name of PLUGIN_ROOT_ENV_NAMES) {
    const value = process.env[name];
    if (value) {
      return value;
    }
  }
  if (fallbackDir) {
    return fallbackDir;
  }
  return path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
}

export function resolvePluginDataEnvName() {
  for (const name of PLUGIN_DATA_ENV_NAMES) {
    if (process.env[name]) {
      return name;
    }
  }
  return PLUGIN_DATA_ENV_NAMES[0];
}

export function resolvePluginDataDir() {
  const envName = resolvePluginDataEnvName();
  return process.env[envName] ?? null;
}

export function resolveHookEnvFile() {
  for (const name of HOOK_ENV_FILE_NAMES) {
    const value = process.env[name];
    if (value) {
      return value;
    }
  }
  return null;
}

export function resolveHostProjectsDir(explicitHost = null) {
  const host = explicitHost ?? hostName();
  if (host !== "unknown" && HOST_PROJECT_DIRS[host]) {
    return HOST_PROJECT_DIRS[host];
  }
  return null;
}

export function listAllowedSessionProjectDirs() {
  return Object.values(HOST_PROJECT_DIRS);
}
