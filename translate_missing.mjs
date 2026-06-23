/**
 * Tüm dil dosyalarındaki eksik çevirileri DeepSeek ile tamamlar.
 * Kullanım: node translate_missing.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = join(__dirname, "next-app/src/i18n/messages");

// .env.local dosyasından key'leri yükle
const ENV_PATH = join(__dirname, "next-app/.env.local");
if (existsSync(ENV_PATH)) {
  const envContent = readFileSync(ENV_PATH, "utf8");
  for (const line of envContent.split("\n")) {
    const m = line.match(/^(\w+)=(.+)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY ?? "";
if (!DEEPSEEK_API_KEY) {
  console.error("❌ DEEPSEEK_API_KEY bulunamadı. next-app/.env.local dosyasını kontrol et.");
  process.exit(1);
}
const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

// Desteklenen diller (en ve xk atlanır — xk=sq kopyası)
const LANGUAGES = [
  { code: "tr", name: "Turkish", file: "tr.ts" },
  { code: "ru", name: "Russian", file: "ru.ts" },
  { code: "de", name: "German", file: "de.ts" },
  { code: "pl", name: "Polish", file: "pl.ts" },
  { code: "sq", name: "Albanian", file: "sq.ts" },
  { code: "uk", name: "Ukrainian", file: "uk.ts" },
  { code: "ro", name: "Romanian", file: "ro.ts" },
];

// TypeScript dosyasından key-value çiftlerini çıkar
function parseMessages(filePath) {
  const content = readFileSync(filePath, "utf8");
  const result = {};
  // Her satırı tara — key: "value" formatı
  const lineRegex = /^\s{2}(\w+):\s*"((?:[^"\\]|\\.)*)"/gm;
  let match;
  while ((match = lineRegex.exec(content)) !== null) {
    result[match[1]] = match[2].replace(/\\"/g, '"').replace(/\\n/g, '\n');
  }
  return result;
}

// Dosyadaki belirli key'lerin değerlerini güncelle
function updateMessages(filePath, translations) {
  let content = readFileSync(filePath, "utf8");

  for (const [key, value] of Object.entries(translations)) {
    // Escape special chars for replacement
    const escapedValue = value
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n");

    // key: "..." → key: "newvalue"
    const regex = new RegExp(`(^\\s{1,4}${key}:\\s*)"[^"]*"`, "m");
    if (regex.test(content)) {
      content = content.replace(regex, `$1"${escapedValue}"`);
    }
  }

  writeFileSync(filePath, content, "utf8");
}

// DeepSeek ile toplu çeviri
async function translateBatch(strings, targetLang) {
  const keys = Object.keys(strings);
  const values = Object.values(strings);

  const prompt = `You are a professional translator for a hotel social media app called "Bosphorus Vibe" at Bosphorus Sorgun Hotel.

Translate the following UI strings to ${targetLang}.

RULES:
- Keep {placeholders} like {name}, {count}, {brand} exactly as-is
- Keep proper nouns: "Bosphorus Vibe", "Reels", "Google", "Firebase", "KVKK", "GDPR" as-is
- Keep technical terms: "SMS", "URL", "API" as-is
- Return ONLY a valid JSON object with the exact same keys
- Translations must be natural and idiomatic ${targetLang}
- For Turkish: formal but friendly tone; for others: match that energy
- Do NOT translate: email addresses, URLs, brand names

Input strings (${keys.length} items):
${JSON.stringify(strings, null, 2)}

Return format: { "key1": "translation1", "key2": "translation2", ... }`;

  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are a professional multilingual translator. Always return valid JSON only, no extra text.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 8000,
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek ${res.status}: ${err}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content?.trim() ?? "{}";
  return JSON.parse(raw);
}

// Ana fonksiyon
async function main() {
  const enPath = join(MESSAGES_DIR, "en.ts");
  const enMessages = parseMessages(enPath);
  console.log(`\n📖 English: ${Object.keys(enMessages).length} strings\n`);

  for (const lang of LANGUAGES) {
    const filePath = join(MESSAGES_DIR, lang.file);
    let existing;
    try {
      existing = parseMessages(filePath);
    } catch {
      console.log(`⚠️  ${lang.code}: dosya okunamadı, atlanıyor`);
      continue;
    }

    // İngilizce ile aynı olan (çevrilmemiş) string'leri bul
    const missing = {};
    for (const [key, enValue] of Object.entries(enMessages)) {
      const langValue = existing[key];
      if (!langValue || langValue === enValue) {
        // Çeviri yok veya İngilizce ile aynı
        missing[key] = enValue;
      }
    }

    const missingCount = Object.keys(missing).length;
    if (missingCount === 0) {
      console.log(`✅ ${lang.code} (${lang.name}): tüm çeviriler tamam`);
      continue;
    }

    console.log(`🔄 ${lang.code} (${lang.name}): ${missingCount} string çevriliyor...`);

    // Büyük batch'leri böl (DeepSeek token limiti için)
    const BATCH_SIZE = 80;
    const keys = Object.keys(missing);
    let translated = {};

    for (let i = 0; i < keys.length; i += BATCH_SIZE) {
      const batch = {};
      keys.slice(i, i + BATCH_SIZE).forEach(k => { batch[k] = missing[k]; });
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(keys.length / BATCH_SIZE);
      process.stdout.write(`  Batch ${batchNum}/${totalBatches}... `);

      try {
        const result = await translateBatch(batch, lang.name);
        const count = Object.keys(result).length;
        console.log(`${count} çevrildi`);
        translated = { ...translated, ...result };
        // Rate limit
        if (i + BATCH_SIZE < keys.length) {
          await new Promise(r => setTimeout(r, 1500));
        }
      } catch (err) {
        console.log(`❌ hata: ${err.message}`);
      }
    }

    // Dosyayı güncelle
    if (Object.keys(translated).length > 0) {
      updateMessages(filePath, translated);
      console.log(`  ✅ ${lang.file} güncellendi (${Object.keys(translated).length} string)\n`);
    }

    // Diller arası bekleme
    await new Promise(r => setTimeout(r, 2000));
  }

  // xk.ts dosyasını sq.ts'den kopyala
  try {
    const sqContent = readFileSync(join(MESSAGES_DIR, "sq.ts"), "utf8");
    const xkContent = sqContent
      .replace(/^const sq/, "const xk")
      .replace(/^export default sq/, "export default xk");
    writeFileSync(join(MESSAGES_DIR, "xk.ts"), xkContent, "utf8");
    console.log("✅ xk.ts (Kosova Arnavutçası) sq.ts'den güncellendi");
  } catch (err) {
    console.log("⚠️  xk.ts güncellenemedi:", err.message);
  }

  console.log("\n🎉 Tamamlandı!\n");
}

main().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
