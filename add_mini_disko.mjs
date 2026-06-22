/**
 * Mini Disko etkinliğini Firestore'a ekler.
 * Pazar hariç her akşam 21:00 — Terrace Stage
 * Kullanım: node add_mini_disko.mjs
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

const IMAGE_URL = "https://firebasestorage.googleapis.com/v0/b/bosphorusvibe-dbd93.firebasestorage.app/o/cms_uploads%2FeventListPortyApp%2Fmini_disko.png?alt=media&token=3ed6a388-0498-4e7e-8707-0d6a192d6f5c";

(async () => {
  const docRef = db.collection("eventListPortyApp").doc();
  await docRef.set({
    Event_Name:     "Mini Disko",
    Event_Time:     "21:00",
    Event_Date:     new Date("2026-06-22T21:00:00"),
    Category:       "weekly",           // haftalık — uygulama eventDays'e göre filtreler
    eventDays:      [1, 2, 3, 4, 5, 6], // Pazartesi–Cumartesi (0=Pazar hariç)
    Event_Location: "Terrace Stage",
    Event_image:    IMAGE_URL,
    aboutEvent:     "Mini Disco — Kids Disco Party! 🌟 Dance, Sing & Have Fun! Fun Games & More. All our little stars are welcome!",
    isHighlight:    false,
    id:             999,
    view:           0,
  });

  console.log("✅  Mini Disko eklendi!");
  console.log("    Kategori : weekly (Pzt-Cmt, her akşam 21:00)");
  console.log("    Konum    : Terrace Stage");
  process.exit(0);
})().catch(err => { console.error("❌", err.message); process.exit(1); });
