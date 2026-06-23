/**
 * Mini Disko duplikasyonlarını temizler — 1 tane bırakır, gerisini siler.
 * Kullanım: node cleanup_mini_disko.mjs
 */
import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SA_PATH = join(__dirname, "bosphorusvibe-dbd93-firebase-adminsdk-fbsvc-299c1777aa.json");

initializeApp({ credential: cert(JSON.parse(readFileSync(SA_PATH, "utf8"))) });
const db = getFirestore();

(async () => {
  const snap = await db.collection("eventListPortyApp")
    .where("Event_Name", "==", "Mini Disko")
    .get();

  console.log(`Bulunan Mini Disko sayısı: ${snap.docs.length}`);

  if (snap.docs.length <= 1) {
    console.log("✅ Duplikasyon yok, bir şey yapılmadı.");
    process.exit(0);
  }

  // İlkini tut, gerisini sil
  const toDelete = snap.docs.slice(1);
  for (const d of toDelete) {
    await d.ref.delete();
    console.log(`🗑  Silindi: ${d.id}`);
  }

  console.log(`✅ ${toDelete.length} duplikasyon silindi, 1 tane kaldı.`);
  process.exit(0);
})().catch(err => { console.error("❌", err.message); process.exit(1); });
