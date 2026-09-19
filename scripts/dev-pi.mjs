#!/usr/bin/env node
// Start Pi with this extension loaded for development.
import { spawn } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const child = spawn("pi", ["--extension", resolve(projectRoot, "extensions/index.js")], {
  stdio: "inherit",
  cwd: projectRoot,
  env: { ...process.env },
});

child.on("exit", code => process.exit(code ?? 0));
