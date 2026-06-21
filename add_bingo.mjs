/**
 * Bingo Game etkinliğini Firestore'a ekler.
 * Her Salı (2) ve Cuma (5) saat 22:30 — Terrace Stage
 * Kullanım: node add_bingo.mjs
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

const IMAGE_URL = "https://firebasestorage.googleapis.com/v0/b/bosphorusvibe-dbd93.firebasestorage.app/o/cms_uploads%2FeventListPortyApp%2Fbingo.png?alt=media&token=916bc4fd-9670-42ee-80c1-e71d1c817d2d";

(async () => {
  const docRef = db.collection("eventListPortyApp").doc();
  await docRef.set({
    Event_Name:     "Bingo Game",
    Event_Time:     "22:30",
    Event_Date:     new Date("2026-06-22T22:30:00"),  // başlangıç tarihi
    Category:       "weekly",     // haftalık tekrarlayan
    eventDays:      [2, 5],       // 2=Salı, 5=Cuma
    Event_Location: "Terrace Stage",
    Event_image:    IMAGE_URL,
    aboutEvent:     "Bingo Game — Show sonrası eğlence! Her Salı ve Cuma 22:30'da Terrace Stage'de. Kazananlar ödül alır!",
    isHighlight:    false,
    id:             998,
    view:           0,
  });

  console.log("✅  Bingo Game eklendi!");
  console.log("    Firestore ID :", docRef.id);
  console.log("    Günler       : Salı (2) & Cuma (5)");
  console.log("    Saat         : 22:30");
  console.log("    Konum        : Terrace Stage");
  process.exit(0);
})().catch(err => {
  console.error("❌  Hata:", err.message);
  process.exit(1);
});
