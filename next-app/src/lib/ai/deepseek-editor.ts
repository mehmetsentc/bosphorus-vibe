/**
 * Bosphorus Vibe — AI Editör Motoru
 * DeepSeek V3 ile magazin / sosyal medya editörü
 */

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat"; // DeepSeek V3

const ANIMATION_ROLES = ["Animation Team", "Porty Club Animation Team"];

export interface AiCaptionInput {
  mediaUrl: string;          // Görsel veya video thumbnail URL
  mediaType: "image" | "video";
  userRole: string;          // Firebase role string
  userName: string;
  userCaption: string;       // Kullanıcının yazdığı açıklama (boş olabilir)
  location?: string;
  participantCount?: number;
  language: "tr" | "en";
}

export interface AiCaptionOutput {
  caption: string;
  hashtags: string[];
  fullText: string;                        // TR/EN caption + hashtags (postDescription)
  translations: Record<string, string>;    // { tr, en, ru, de, pl, sq, uk, ro } — postDescriptions
}

/** Uygulama tarafından desteklenen tüm diller */
export const SUPPORTED_LOCALES = ["tr", "en", "ru", "de", "pl", "sq", "uk", "ro"] as const;

const LOCALE_NAMES: Record<string, string> = {
  tr: "Turkish",
  en: "English",
  ru: "Russian",
  de: "German",
  pl: "Polish",
  sq: "Albanian",
  uk: "Ukrainian",
  ro: "Romanian",
};

// ─── System Prompt ───────────────────────────────────────────────────────────

function buildSystemPrompt(language: "tr" | "en"): string {
  if (language === "tr") {
    return `Sen Bosphorus Vibe'ın yapay zeka sosyal medya editörüsün. Bosphorus Sorgun Hotel'in canlı dijital magazinisin.

ÇIKTI KURALI — EN ÖNEMLİ:
Doğrudan metni yaz. "Of course", "İşte", "Tabii ki", "Metnin hazır" gibi giriş cümleleri KESINLIKLE YASAK.
İlk kelimeden itibaren editorial metin başlar. Başka hiçbir şey ekleme.

GÖREV: Görsele bakarak 2-3 cümle editorial metin + 5-6 hashtag üret.

YAZI STİLİ:
- Magazin muhabiri gibi yaz — canlı, sahada, anı yakalayan
- Görselde NE OLDUĞUNU, KİMLERİN OLDUĞUNU, NASIL BİR HAVA OLDUĞUNU yaz
- Enerji, duygu, atmosfer hissettir
- Uydurma bilgi (koordinat, tarih, rakam) YAZMA — sadece görselden gördüklerini yaz

KATILIM TONU:
- 10+ kişi → "Dans pisti dolup taştı", "Terrace bu gece çılgına döndü"
- 5-10 kişi → neşeli, pozitif, hafif espri
- 1-5 kişi → sıcak, kişisel, "az ama öz" mizanseni

ANİMASYON EKİBİ → muhabir tonu, etkinliği tanımlayan haber dili
MİSAFİR → sıcak, kişisel, "tatil anısı" tonu

ÖRNEK ÇIKTILAR (bu formatta yaz):
---
Terrace Stage bu gece DJ'in elleriyle alev aldı. Lazer ışıklar sahneyi yalarken misafirler müziğin ritmine kendini kaptırdı — Bosphorus Sorgun'da gece böyle başlar, sabaha kadar sürer.
#BosphorusVibe #TerraceStage #DJNight #GeceBuBaşlar #BosphorusSorgun #PartyVibes
---
Dart okları hedefe giderken rekabet de tırmandı. [İsim] misafirleri bu sabah yine birbiriyle yarıştırdı — kazananlar belli ama eğlence herkese eşit dağıtıldı.
#BosphorusVibe #DartTurnuvası #AnimasyonEkibi #OtelEğlencesi #BosphorusSorgun
---
Bosphorus Sorgun'dan bir tatil karesi daha: deniz, güneş ve o anın tam ortasında olmak. Bazı anlar kelimelerle anlatılmaz, fotoğrafla bile zor — ama biz yine de paylaşıyoruz.
#BosphorusVibe #TatilAnısı #BosphorusSorgun #HolidayMoments #OtelHayatı`;
  }

  return `You are the AI social media editor of Bosphorus Vibe — the live digital magazine of Bosphorus Sorgun Hotel.

CRITICAL OUTPUT RULE:
Start writing the editorial text IMMEDIATELY. NEVER begin with "Of course", "Sure!", "Here is", "Here's your text" or any conversational opener.
First word = first word of the caption. Nothing else.

TASK: Look at the image and write 2-3 sentences of editorial content + 5-6 hashtags.

WRITING STYLE:
- Write like a live event reporter on the ground
- Describe what you SEE: who's there, what's happening, the energy and atmosphere
- Make the reader FEEL the moment
- NEVER invent data (coordinates, numbers, dates) — only write what you see

PARTICIPATION TONE:
- 10+ people → "The dance floor packed out", "Terrace went wild tonight"
- 5-10 people → upbeat, positive, lightly playful
- 1-5 people → warm, personal, "small but mighty" angle

ANIMATION TEAM → reporter tone, event-focused news language
GUEST → warm, personal, vacation memory tone

EXAMPLE OUTPUTS (write in this exact format):
---
The Terrace Stage ignited tonight as the DJ turned up the energy and the crowd answered back. Laser lights swept the room while guests lost themselves in the rhythm — at Bosphorus Sorgun, the night always starts like this and never ends early.
#BosphorusVibe #TerraceStage #DJNight #NightLife #BosphorusSorgun #PartyVibes
---
Arrows flew, scores climbed, and the competition got real on the dart court this morning. The animation team kept the energy high as guests discovered their inner champion — or at least had a great laugh trying.
#BosphorusVibe #DartGame #AnimationTeam #HotelFun #BosphorusSorgun
---`;
}

// ─── User Prompt ─────────────────────────────────────────────────────────────

function buildUserPrompt(input: AiCaptionInput): string {
  const isAnimationTeam = ANIMATION_ROLES.includes(input.userRole);
  const posterType = isAnimationTeam ? "Animasyon ekibi üyesi" : "Otel misafiri";

  const participantLine = input.participantCount
    ? `Katılımcı sayısı: ${input.participantCount} kişi`
    : "";

  const locationLine = input.location ? `Konum: ${input.location}` : "";
  const userCaptionLine = input.userCaption
    ? `Kullanıcı notu: "${input.userCaption}"`
    : "";

  const mediaLine =
    input.mediaType === "video"
      ? "İçerik türü: Video / Reel"
      : "İçerik türü: Fotoğraf";

  const parts = [
    `Paylaşım sahibi: ${input.userName} (${posterType})`,
    mediaLine,
    locationLine,
    participantLine,
    userCaptionLine,
  ].filter(Boolean);

  return `${parts.join("\n")}

Bu bilgilere ve görsele bakarak, Bosphorus Vibe feed'i için editorial metin yaz. Sadece metni ve hashtag'leri döndür, başka hiçbir şey ekleme.`;
}

// ─── DeepSeek API Call ────────────────────────────────────────────────────────

async function callDeepSeek(
  systemPrompt: string,
  userPrompt: string,
  mediaUrl: string,
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY not configured");

  // Try with vision format first (image in content array)
  const messages: object[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: { url: mediaUrl },
        },
        { type: "text", text: userPrompt },
      ],
    },
  ];

  let res = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      max_tokens: 400,
      temperature: 0.85,
    }),
  });

  // If vision not supported, fall back to text-only
  if (!res.ok && res.status === 400) {
    const messagesTextOnly: object[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];
    res = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: messagesTextOnly,
        max_tokens: 400,
        temperature: 0.85,
      }),
    });
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

// ─── Parse Output ─────────────────────────────────────────────────────────────

function parseOutput(raw: string): AiCaptionOutput {
  // Split hashtags from caption
  const hashtagRegex = /(#[\wğüşıöçĞÜŞİÖÇ]+)/g;
  const hashtags: string[] = Array.from(raw.match(hashtagRegex) ?? []);
  const caption = raw
    .replace(hashtagRegex, "")
    .replace(/\n{2,}/g, "\n")
    .trim();

  // Build default hashtags if AI didn't include enough
  const defaultTags: string[] = [
    "#BosphorusVibe",
    "#BosphorusSorgun",
    "#HolidayMoments",
    "#HotelLife",
    "#AnimationTeam",
  ];
  const allHashtags: string[] =
    hashtags.length >= 3
      ? hashtags
      : [...hashtags, ...defaultTags.filter((t) => !hashtags.includes(t))].slice(0, 7);

  const fullText = `${caption}\n\n${allHashtags.join(" ")}`;

  return { caption, hashtags: allHashtags, fullText, translations: {} };
}

// ─── Translation ──────────────────────────────────────────────────────────────

/** Tüm desteklenen dillere tek call'da çeviri yapar, JSON döner */
async function generateTranslations(
  baseCaption: string,
  baseLang: string,
): Promise<Record<string, string>> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return {};

  const targetLocales = SUPPORTED_LOCALES.filter((l) => l !== baseLang);
  const targetList = targetLocales
    .map((l) => `"${l}": "${LOCALE_NAMES[l]}"`)
    .join(", ");

  const prompt = `You are a professional translator for a hotel social media app.

Translate the following editorial text into these languages: ${targetList}.

Rules:
- Keep the editorial/magazine style and energy
- Keep hashtags ONLY in English and Turkish (do not translate hashtags)
- Return ONLY a valid JSON object with locale codes as keys
- No extra text, no markdown, just raw JSON

Text to translate:
"""
${baseCaption}
"""

Return format:
{
  ${targetLocales.map((l) => `"${l}": "translation here"`).join(",\n  ")}
}`;

  try {
    const res = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: "You are a professional multilingual translator. Always return valid JSON only." },
          { role: "user", content: prompt },
        ],
        max_tokens: 1200,
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) return {};

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content?.trim() ?? "{}";
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed;
  } catch {
    return {};
  }
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export async function generateAiCaption(
  input: AiCaptionInput,
): Promise<AiCaptionOutput> {
  const systemPrompt = buildSystemPrompt(input.language);
  const userPrompt = buildUserPrompt(input);

  const raw = await callDeepSeek(systemPrompt, userPrompt, input.mediaUrl);
  const parsed = parseOutput(raw);

  // Çevirileri paralel üret
  const otherTranslations = await generateTranslations(parsed.caption, input.language);

  // Tüm dilleri birleştir
  const translations: Record<string, string> = {
    [input.language]: parsed.fullText,
    ...Object.fromEntries(
      Object.entries(otherTranslations).map(([locale, text]) => [
        locale,
        `${text}\n\n${parsed.hashtags.join(" ")}`,
      ]),
    ),
  };

  return { ...parsed, translations };
}
