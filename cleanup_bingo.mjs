/**
 * Bingo duplikasyonlarını temizler — 1 tane bırakır.
 * Kullanım: node cleanup_bingo.mjs
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
  // Bingo ile başlayan tüm isimleri yakala
  const snap = await db.collection("eventListPortyApp")
    .where("Category", "==", "weekly")
    .get();

  const bingoDocs = snap.docs.filter(d => {
    const name = (d.data().Event_Name ?? "").toLowerCase();
    return name.includes("bingo");
  });

  console.log(`Bingo döküman sayısı: ${bingoDocs.length}`);

  if (bingoDocs.length <= 1) {
    console.log("✅ Duplikasyon yok.");
    process.exit(0);
  }

  const toDelete = bingoDocs.slice(1);
  for (const d of toDelete) {
    console.log(`🗑  Silindi: ${d.id} — ${d.data().Event_Name}`);
    await d.ref.delete();
  }
  console.log(`✅ ${toDelete.length} silindi, 1 kaldı.`);
  process.exit(0);
})().catch(err => { console.error("❌", err.message); process.exit(1); });
