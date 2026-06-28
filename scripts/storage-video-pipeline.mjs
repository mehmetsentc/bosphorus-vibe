#!/usr/bin/env node
/**
 * Tüm Firebase Storage video katmanlarını otomatik yapılandırır.
 *
 *   npm run storage:configure
 *   node scripts/storage-video-pipeline.mjs --max-rounds=10
 *
 * Gerekli: bosphorusvibe-dbd93-firebase-adminsdk-*.json (repo kökü)
 */
import { readFileSync, existsSync, readdirSync } from "fs";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PROJECT = "bosphorusvibe-dbd93";
const BUCKET = "bosphorusvibe-dbd93.firebasestorage.app";
const CF_URL = `https://europe-central2-${PROJECT}.cloudfunctions.net/configureAllVideoStorage`;

const FUNCTIONS_DIR = join(ROOT, "firebase/functions");
const requireFunctions = createRequire(join(FUNCTIONS_DIR, "package.json"));

const admin = requireFunctions("firebase-admin");
const { syncStorageBatch, enqueueTranscodeBatch, initFirebaseAdmin } =
  requireFunctions("./storage-video-sync.js");

function loadEnv() {
  const envPath = join(ROOT, "next-app/.env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^([\w_]+)=(.*)$/);
    if (!m || process.env[m[1]]) continue;
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[m[1]] = val;
  }
}

function loadServiceAccount() {
  const fromRoot = readdirSync(ROOT).filter(
    (f) => f.includes("firebase-adminsdk") && f.endsWith(".json"),
  );
  for (const name of fromRoot) {
    return JSON.parse(readFileSync(join(ROOT, name), "utf8"));
  }
  throw new Error(
    `Service account JSON bulunamadı — repo köküne ${PROJECT}-firebase-adminsdk-*.json koyun`,
  );
}

function ensureAdminInitialized() {
  const sa = loadServiceAccount();
  initFirebaseAdmin({
    credential: admin.credential.cert(sa),
    projectId: PROJECT,
    storageBucket: BUCKET,
  });
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    corsOnly: args.includes("--cors-only"),
    maxRounds: Number(
      args.find((a) => a.startsWith("--max-rounds="))?.split("=")[1] || 20,
    ),
    syncLimit: Number(
      args.find((a) => a.startsWith("--sync="))?.split("=")[1] || 50,
    ),
    enqueueLimit: Number(
      args.find((a) => a.startsWith("--enqueue="))?.split("=")[1] || 200,
    ),
    transcodeLimit: Number(
      args.find((a) => a.startsWith("--transcode="))?.split("=")[1] || 5,
    ),
  };
}

function logProgress({ phase, scanned, synced, skipped, marked, alreadyQueued }) {
  if (phase === "sync") {
    process.stdout.write(
      `\r  sync… ${scanned} tarandı, ${synced} güncellendi, ${skipped ?? 0} atlandı   `,
    );
  } else if (phase === "enqueue") {
    process.stdout.write(
      `\r  kuyruk… ${scanned} tarandı, ${marked} eklendi, ${alreadyQueued} zaten sırada   `,
    );
  }
}

async function applyStorageCors() {
  ensureAdminInitialized();
  const corsPath = join(__dirname, "storage-cors.json");
  const cors = JSON.parse(readFileSync(corsPath, "utf8"));
  await admin.storage().bucket(BUCKET).setMetadata({ cors });
  console.log("✓ Storage CORS yapılandırıldı:", BUCKET);
}

async function runLocalBatch(opts) {
  ensureAdminInitialized();

  console.log(`  Firestore ↔ Storage sync (max ${opts.syncLimit})…`);
  const sync = await syncStorageBatch(opts.syncLimit, logProgress);
  process.stdout.write("\n");

  console.log(`  Encode kuyruğu (max ${opts.enqueueLimit})…`);
  const enqueue = await enqueueTranscodeBatch(opts.enqueueLimit, logProgress);
  process.stdout.write("\n");

  console.log("  sync:", sync);
  console.log("  enqueue:", enqueue);

  const secret = process.env.TRANSCODE_BACKFILL_SECRET?.trim();
  if (!secret) {
    console.warn(
      "⚠ TRANSCODE_BACKFILL_SECRET yok — encode batch atlandı (10 dk scheduler devam eder)",
    );
    return { hasMore: Boolean(sync.hasMore || enqueue.hasMore), transcode: null };
  }

  console.log("  Cloud Function encode batch…");
  const res = await fetch(CF_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      syncLimit: 0,
      enqueueLimit: 0,
      transcodeLimit: opts.transcodeLimit,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.warn("⚠ Cloud Function transcode:", data.error || res.status);
    return { hasMore: Boolean(sync.hasMore || enqueue.hasMore), transcode: null };
  }

  console.log("  transcode:", data.transcode);
  return {
    hasMore: Boolean(sync.hasMore || enqueue.hasMore || data.hasMore),
    transcode: data.transcode,
  };
}

async function runCloudConfigureAll(opts) {
  const secret = process.env.TRANSCODE_BACKFILL_SECRET?.trim();
  if (!secret) {
    console.log("→ TRANSCODE_BACKFILL_SECRET yok, yerel sync/enqueue kullanılıyor…");
    return runLocalBatch(opts);
  }

  console.log("  Cloud Function configureAll…");
  const res = await fetch(CF_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      syncLimit: opts.syncLimit,
      enqueueLimit: opts.enqueueLimit,
      transcodeLimit: opts.transcodeLimit,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  console.log("  sync:", data.sync);
  console.log("  enqueue:", data.enqueue);
  console.log("  transcode:", data.transcode);
  return { hasMore: Boolean(data.hasMore) };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  loadEnv();
  const opts = parseArgs();

  console.log(`\n🎬 Bosphorus Vibe — Storage Video Pipeline`);
  console.log(`   Proje: ${PROJECT}\n`);

  if (opts.corsOnly) {
    await applyStorageCors();
    return;
  }

  await applyStorageCors();

  let round = 0;
  let hasMore = true;

  while (hasMore && round < opts.maxRounds) {
    round += 1;
    console.log(`\n→ Tur ${round}/${opts.maxRounds}`);
    const result = await runCloudConfigureAll(opts);
    hasMore = result.hasMore;
    if (hasMore) {
      console.log("  (devam ediyor, 3 sn bekleniyor…)");
      await sleep(3000);
    }
  }

  if (hasMore) {
    console.log(
      `\n⚠ ${opts.maxRounds} tur bitti — kalan iş var. Tekrar çalıştırın veya admin panel.`,
    );
  } else {
    console.log("\n✓ Tamamlandı (veya kuyruk boş).");
  }
}

main().catch((err) => {
  console.error("\n✗", err.message || err);
  process.exit(1);
});
