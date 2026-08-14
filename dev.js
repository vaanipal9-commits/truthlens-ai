#!/usr/bin/env node
// TruthLens AI — single-command dev launcher.
// Starts the Vite frontend and the Node/Express backend concurrently.
//
// Usage:  npm run dev
//
// Reads .env from the project root (via dotenv in server/server.js).

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envPath = path.join(__dirname, ".env");
if (!fs.existsSync(envPath)) {
  console.log("\n\x1b[33m⚠  No .env file found at project root.\x1b[0m");
  console.log("   Copy \x1b[36m.env.example\x1b[0m → \x1b[36m.env\x1b[0m and add your GROQ_API_KEY,");
  console.log("   otherwise live verification will not work.\n");
}

const isWin = process.platform === "win32";
const npmCmd = isWin ? "npm.cmd" : "npm";
const nodeCmd = isWin ? "node.exe" : "node";

const procs = [];

function start(name, cmd, args, color) {
  const child = spawn(cmd, args, {
    cwd: __dirname,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
  });
  const prefix = `\x1b[${color}m[${name}]\x1b[0m`;
  const pipe = (stream, isErr = false) => {
    stream.setEncoding("utf8");
    stream.on("data", (chunk) => {
      const lines = chunk.split(/\r?\n/);
      for (const line of lines) {
        if (line.trim().length === 0) continue;
        (isErr ? process.stderr : process.stdout).write(`${prefix} ${line}\n`);
      }
    });
  };
  pipe(child.stdout);
  pipe(child.stderr, true);
  child.on("exit", (code) => {
    console.log(`${prefix} exited with code ${code}`);
    shutdown(code || 0);
  });
  procs.push(child);
}

function shutdown(code = 0) {
  for (const p of procs) {
    try {
      if (!p.killed) p.kill("SIGTERM");
    } catch {}
  }
  setTimeout(() => process.exit(code), 200);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log("\n🔍 Starting TruthLens AI (frontend + backend)…\n");

start("backend ", nodeCmd, ["server/server.js"], "36"); // cyan
start("frontend", npmCmd, ["run", "dev:client"], "35"); // magenta
