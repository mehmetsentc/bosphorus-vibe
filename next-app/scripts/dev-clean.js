const { execSync, spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const PORTS = [3000, 3001, 3002, 3003, 3004, 3005];
const ROOT = process.cwd();

function runQuiet(cmd) {
  try {
    execSync(cmd, { stdio: "ignore", cwd: ROOT });
  } catch {
    // Process may already be gone.
  }
}

function portBusy(port) {
  try {
    execSync(`lsof -ti tcp:${port}`, { stdio: "ignore", cwd: ROOT });
    return true;
  } catch {
    return false;
  }
}

function stopDevServers() {
  for (const port of PORTS) {
    runQuiet(`lsof -ti tcp:${port} | xargs kill -9`);
  }

  runQuiet(`pkill -f "${ROOT}.*next dev"`);
  runQuiet(`pkill -f "next dev -p 3000"`);

  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (!PORTS.some(portBusy)) return;
    execSync("sleep 0.5");
  }

  console.warn("[dev:clean] Some dev ports may still be busy. Continuing anyway.");
}

function wipeCache() {
  for (const target of [".next", "node_modules/.cache"]) {
    const fullPath = path.join(ROOT, target);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  }
}

function startDev(useTurbo) {
  const mode = useTurbo ? "turbo" : "webpack";
  console.log("");
  console.log(`→ http://localhost:3000 (${mode})`);
  console.log("→ Close old browser tabs, then hard refresh (Cmd+Shift+R) after Ready");
  console.log("→ Do not run npm run build while dev is active");
  console.log("");

  const args = ["next", "dev", "-p", "3000"];
  if (useTurbo) args.push("--turbo");

  const child = spawn("npx", args, {
    cwd: ROOT,
    stdio: "inherit",
    env: {
      ...process.env,
      WATCHPACK_POLLING: useTurbo ? "true" : "",
    },
    shell: process.platform === "win32",
  });

  child.on("exit", (code) => process.exit(code ?? 0));
}

stopDevServers();
execSync("sleep 1");
wipeCache();

if (process.argv.includes("--reset-only")) {
  console.log("[dev:reset] Cleared .next and node_modules/.cache");
  process.exit(0);
}

startDev(process.argv.includes("--turbo"));
