/**
 * Tüm postlardaki AI yazılarını temizler (postDescriptions, aiGenerated, postTitle).
 * Kullanım: node reset_captions.mjs
 * Sonrasında: node ai_backfill_posts.mjs --all
 */
import { readFileSync, existsSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SA_PATH = join(__dirname, "bosphorusvibe-dbd93-firebase-adminsdk-fbsvc-299c1777aa.json");
initializeApp({ credential: cert(JSON.parse(readFileSync(SA_PATH, "utf8"))) });
const db = getFirestore();

(async () => {
  console.log("\n🧹 AI Caption Reset — tüm postlar temizleniyor...\n");

  const snap = await db.collection("userPosts")
    .orderBy("timePosted", "desc")
    .limit(500)
    .get();

  console.log(`📦 ${snap.docs.length} post bulundu\n`);

  let cleared = 0;
  const BATCH_SIZE = 400;
  let batch = db.batch();
  let batchCount = 0;

  for (const doc of snap.docs) {
    batch.update(doc.ref, {
      postDescriptions: FieldValue.delete(),
      aiGenerated: FieldValue.delete(),
      aiGeneratedAt: FieldValue.delete(),
      postTitle: FieldValue.delete(),
    });
    batchCount++;
    cleared++;

    if (batchCount >= BATCH_SIZE) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) await batch.commit();

  console.log(`✅ ${cleared} posttan AI yazıları temizlendi.\n`);
  console.log("👉 Şimdi çalıştır: node ai_backfill_posts.mjs --all\n");
  process.exit(0);
})().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
