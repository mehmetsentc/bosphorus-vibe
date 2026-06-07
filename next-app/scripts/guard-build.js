const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function portInUse(port) {
  try {
    const out = execSync(`lsof -ti tcp:${port} 2>/dev/null`, {
      encoding: "utf8",
    }).trim();
    return Boolean(out);
  } catch {
    return false;
  }
}

const skipPortCheck = Boolean(process.env.CI || process.env.VERCEL);

if (!skipPortCheck) {
  for (const port of [3000, 3001, 3002, 3003, 3004, 3005]) {
    if (portInUse(port)) {
      console.error(
        `\n[prebuild] Port ${port} is in use (dev server likely running).`,
      );
      console.error(
        "Stop dev first (Ctrl+C or npm run dev:reset), then run npm run build.",
      );
      console.error(
        "Running build while dev is active corrupts .next and causes chunk 404/500 errors.\n",
      );
      process.exit(1);
    }
  }
}

const nextDir = path.join(process.cwd(), ".next");
const devMarker = path.join(nextDir, "static", "development");
if (fs.existsSync(devMarker)) {
  console.warn(
    "[prebuild] Removing stale dev artifacts from .next before production build.",
  );
  fs.rmSync(nextDir, { recursive: true, force: true });
}
