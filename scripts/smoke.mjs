#!/usr/bin/env node
/**
 * Runtime smoke check — the gate `tsc` + unit tests can't give (they never boot Next).
 * Boots the dev server (or reuses one already running at SMOKE_URL) and asserts the
 * canonical routes compile + route correctly: public pages render, the admin guard
 * redirects, and the login page serves. A red smoke blocks the merge (git-workflow §4).
 *
 *   npm run smoke              # reuse a running server, or spawn `next dev`, check, tear down
 *   SMOKE_URL=http://… npm run smoke
 *
 * Note: this needs the dev DATABASE reachable (public pages read lib/data). The DB-free
 * static gate is `npm run typecheck`, which CI runs on every PR.
 */
import { spawn, spawnSync } from "node:child_process";

const BASE = (process.env.SMOKE_URL || "http://localhost:3000").replace(/\/$/, "");

// path · expected status · (optional) substring the Location header must contain.
// Checks run UNAUTHENTICATED, so every guarded /admin/* route must bounce to the login
// page — that bounce (and the public pages rendering) is the regression signal here.
const CHECKS = [
  { path: "/", status: 200 },
  { path: "/projects", status: 200 },
  { path: "/admin/login", status: 200 },
  { path: "/admin/dashboard", status: 307, location: "/admin/login" },
  { path: "/admin", status: 307, location: "/admin/login" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function reachable() {
  try {
    await fetch(BASE, { signal: AbortSignal.timeout(2500) });
    return true;
  } catch {
    return false;
  }
}

async function waitFor(predicate, timeoutMs, everyMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await predicate()) return true;
    await sleep(everyMs);
  }
  return false;
}

function killTree(pid) {
  if (!pid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    try {
      process.kill(-pid, "SIGTERM");
    } catch {
      /* already gone */
    }
  }
}

async function run() {
  let child = null;

  if (!(await reachable())) {
    console.log("• No server at " + BASE + " — starting `next dev`…");
    const isWin = process.platform === "win32";
    child = spawn(isWin ? "npm.cmd" : "npm", ["run", "dev"], {
      stdio: "ignore",
      detached: !isWin,
      // Node 20+ rejects spawning .cmd/.bat without a shell (EINVAL) on Windows.
      shell: isWin,
      env: process.env,
    });
    const up = await waitFor(reachable, 90_000, 2_000);
    if (!up) {
      killTree(child.pid);
      console.error("✗ dev server did not become reachable within 90s");
      process.exit(1);
    }
  } else {
    console.log("• Reusing server already running at " + BASE);
  }

  const failures = [];
  for (const c of CHECKS) {
    try {
      const res = await fetch(BASE + c.path, {
        redirect: "manual",
        signal: AbortSignal.timeout(20_000),
      });
      const loc = res.headers.get("location") || "";
      const okStatus = res.status === c.status;
      const okLoc = !c.location || loc.includes(c.location);
      if (okStatus && okLoc) {
        console.log(`  ✓ ${c.path} → ${res.status}${c.location ? ` (${loc})` : ""}`);
      } else {
        failures.push(`${c.path} → ${res.status}${loc ? ` (${loc})` : ""} (expected ${c.status}${c.location ? ` → …${c.location}` : ""})`);
        console.log(`  ✗ ${c.path} → ${res.status}${loc ? ` (${loc})` : ""}`);
      }
    } catch (e) {
      failures.push(`${c.path} → request failed: ${e.message}`);
      console.log(`  ✗ ${c.path} → request failed: ${e.message}`);
    }
  }

  if (child) killTree(child.pid);

  if (failures.length > 0) {
    console.error(`\n✗ Smoke FAILED (${failures.length}):\n  - ${failures.join("\n  - ")}`);
    process.exit(1);
  }
  console.log("\n✓ Smoke passed.");
}

run().catch((e) => {
  console.error("smoke runner error:", e);
  process.exit(1);
});
