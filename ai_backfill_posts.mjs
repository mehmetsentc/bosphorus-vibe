/**
 * Mevcut postlara AI editorial caption yazdırır.
 * Komik, neşeli, tatil havasında — görseli, kişiyi ve katılımı yorumlar.
 *
 * Kullanım: node ai_backfill_posts.mjs
 * İlk 10 postu işler. Hepsini işlemek için: node ai_backfill_posts.mjs --all
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

// Set DEEPSEEK_API_KEY in your environment: export DEEPSEEK_API_KEY=sk-...
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY ?? "";
const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

const ALL_LOCALES = ["tr", "en", "ru", "de", "pl", "sq", "uk", "ro"];

const LOCALE_NAMES = {
  en: "English", ru: "Russian", de: "German",
  pl: "Polish", sq: "Albanian", uk: "Ukrainian", ro: "Romanian",
};

const ANIMATION_ROLES = ["Animation Team", "Porty Club Animation Team"];

// ─── DeepSeek Call ────────────────────────────────────────────────────────────

async function callDeepSeek(messages, jsonMode = false) {
  const body = {
    model: "deepseek-chat",
    messages,
    max_tokens: jsonMode ? 1200 : 400,
    temperature: jsonMode ? 0.3 : 0.9,
  };
  if (jsonMode) body.response_format = { type: "json_object" };

  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

// ─── Caption Generation ───────────────────────────────────────────────────────

async function generateCaption(post, userData) {
  const isAnimTeam = ANIMATION_ROLES.includes(userData?.role ?? "");
  const posterType = isAnimTeam ? "animasyon ekibi üyesi" : "otel misafiri";
  const userName = userData?.display_name ?? userData?.userName ?? "Misafir";

  // Gerçek katılımcı sayısını kullan, yoksa numViews proxy olarak kullan
  const participantCount = post.participant_count ?? post.participantCount ?? post.numViews ?? 0;
  const participantHint = participantCount > 20 ? `Yoğun katılım vardı (${participantCount}+ kişi).` :
                          participantCount > 8  ? `Orta düzeyde katılım (${participantCount} kişi).` :
                          participantCount > 0  ? `Az ama seçkin katılım (${participantCount} kişi) 😄` :
                                                  "Katılım sayısı bilinmiyor.";

  const mediaType = post.postVideo ? "video" : "fotoğraf";
  // GPS koordinatlarını atla — mekan her zaman Bosphorus Sorgun Hotel
  const rawLoc = post.location ?? "";
  const isGps = /^-?\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+$/.test(rawLoc.trim());
  const location = (!isGps && rawLoc) ? rawLoc : (post.activityName ?? "Bosphorus Sorgun Hotel");

  const systemPrompt = `Sen Bosphorus Vibe'ın yapay zeka sosyal medya editörüsün.

KRİTİK ÇIKTI KURALI:
Doğrudan metni yaz. "Of course", "İşte", "Tabii ki", "Metnin hazır" gibi giriş cümleleri KESİNLİKLE YASAK.
İlk kelimeden itibaren editorial metin başlar. Başka hiçbir şey ekleme.

GÖREV: Görsele bakarak KOMIK, NEŞELİ, tatil havasında 2-3 cümle + 5-6 hashtag yaz.

YAZI STİLİ:
- Magazin muhabiri gibi yaz — canlı, sahada, anı yakalayan
- Görselde NE OLDUĞUNU gerçekten anlat. Uydurma bilgi YAZMA.
- Paylaşan kişiye ve katılım sayısına özel espri/yorum yap
- Enerji, atmosfer, duygu hissettir

KATILIM TONU:
- 20+ kişi → dans pisti dolup taştı, enerji zirveye çıktı
- 8-20 kişi → neşeli, pozitif, hafif espri
- 1-8 kişi → "az ama öz", sıcak, mizansel

ANİMASYON EKİBİ → etkinlik muhabiri tonu
MİSAFİR → sıcak, tatil anısı tonu

ÖRNEK (TAM OLARAK BU FORMATTA YAZ — giriş cümlesi olmadan):
Terrace Stage bu gece DJ'in elleriyle alev aldı. Lazer ışıklar sahneyi yalarken misafirler ritme kendini kaptırdı — Bosphorus Sorgun'da gece böyle başlar, sabaha kadar sürer. 🎧🔥
#BosphorusVibe #TerraceStage #DJNight #GeceBuBaşlar #BosphorusSorgun`;

  const userPrompt = `Paylaşan: ${userName} (${posterType})
Konum: ${location}
İçerik türü: ${mediaType}
${participantHint}
${post.postDescription ? `Kullanıcı notu: "${post.postDescription}"` : ""}

Bu paylaşım için Bosphorus Vibe feed'ine yakışır, komik ve neşeli editorial metin yaz.
Sadece metni ve hashtag'leri yaz, başka hiçbir şey ekleme.`;

  // Try with image
  let messages;
  const imageUrl = post.postPhotoURL || post.postPhotoURL_original || post.postVideothumbnail;
  if (imageUrl) {
    messages = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: imageUrl } },
          { type: "text", text: userPrompt },
        ],
      },
    ];
  } else {
    messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];
  }

  try {
    return await callDeepSeek(messages);
  } catch {
    // Fallback: text only
    return await callDeepSeek([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);
  }
}

// ─── Translation ──────────────────────────────────────────────────────────────

async function translateAll(trCaption, hashtags) {
  const targetList = Object.entries(LOCALE_NAMES)
    .map(([k, v]) => `"${k}": "${v}"`)
    .join(", ");

  const prompt = `Translate this hotel social media editorial text into these languages: ${targetList}.
Keep the fun, holiday vibe. Return ONLY valid JSON with locale codes as keys.

Text:
"""
${trCaption}
"""

Format: { "en": "...", "ru": "...", "de": "...", "pl": "...", "sq": "...", "uk": "...", "ro": "..." }`;

  try {
    const raw = await callDeepSeek([
      { role: "system", content: "Professional multilingual translator. Return valid JSON only." },
      { role: "user", content: prompt },
    ], true);
    const parsed = JSON.parse(raw);
    // Attach hashtags to each
    const result = {};
    for (const [locale, text] of Object.entries(parsed)) {
      result[locale] = `${text}\n\n${hashtags}`;
    }
    return result;
  } catch {
    return {};
  }
}

// ─── Parse Output ─────────────────────────────────────────────────────────────

function parseCaption(raw) {
  const hashtagRegex = /(#[\wğüşıöçĞÜŞİÖÇ\w]+)/g;
  const hashtags = Array.from(raw.match(hashtagRegex) ?? []);
  const caption = raw.replace(hashtagRegex, "").replace(/\n{2,}/g, "\n").trim();

  const defaults = ["#BosphorusVibe", "#BosphorusSorgun", "#HolidayVibes", "#TatilAnları"];
  const allTags = hashtags.length >= 3
    ? hashtags
    : [...hashtags, ...defaults.filter(t => !hashtags.includes(t))].slice(0, 6);

  return { caption, hashtagStr: allTags.join(" "), fullText: `${caption}\n\n${allTags.join(" ")}` };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  const doAll = process.argv.includes("--all");
  const limitCount = doAll ? 200 : 10;

  console.log(`\n🤖 AI Caption Backfill — ${doAll ? "TÜM" : "İLK 10"} post\n`);

  const snap = await db.collection("userPosts")
    .orderBy("timePosted", "desc")
    .limit(limitCount)
    .get();

  console.log(`📦 ${snap.docs.length} post bulundu\n`);

  let success = 0;
  let fail = 0;

  for (const docSnap of snap.docs) {
    const post = { id: docSnap.id, ...docSnap.data() };

    // Kullanıcı verisini çek
    let userData = null;
    try {
      const userId = post.postUser?.id ?? post.userId;
      if (userId) {
        const userSnap = await db.collection("users").doc(userId).get();
        userData = userSnap.data();
      }
    } catch { /* ignore */ }

    const displayName = userData?.display_name ?? userData?.userName ?? "Misafir";
    process.stdout.write(`  ✏️  [${post.id.slice(0,8)}] ${displayName} → `);

    try {
      // 1. TR caption üret
      const raw = await generateCaption(post, userData);
      const { caption, hashtagStr, fullText } = parseCaption(raw);

      // 2. Diğer dillere çevir
      const otherTranslations = await translateAll(caption, hashtagStr);

      // 3. Tüm dil map'ini oluştur
      const postDescriptions = {
        tr: fullText,
        ...otherTranslations,
      };

      // 4. Firestore güncelle
      await docSnap.ref.update({
        postDescription: fullText,
        postTitle: caption.slice(0, 80),
        postDescriptions,
        aiGenerated: true,
        aiGeneratedAt: new Date(),
      });

      console.log(`✅ ${caption.slice(0, 60)}…`);
      success++;

      // Rate limit için küçük bekleme
      await new Promise(r => setTimeout(r, 800));
    } catch (err) {
      console.log(`❌ ${err.message}`);
      fail++;
    }
  }

  console.log(`\n✅ ${success} başarılı  ❌ ${fail} hatalı\n`);
  process.exit(0);
})().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
