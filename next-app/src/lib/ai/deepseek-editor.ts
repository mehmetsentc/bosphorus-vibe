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
    return `Sen Bosphorus Vibe'ın yapay zeka editörüsün. Bosphorus Sorgun Hotel'in sosyal medya uygulaması için içerik üretiyorsun.

ROL: Magazin editörü + sosyal medya editörü + otel eğlence muhabiri

GÖREV: Yüklenen her içerik için benzersiz, okunabilir, eğlenceli, etkileşim alacak haber/magazin metni oluştur.

KURALLAR:
- Düz açıklama YAZMA. "Dart aktivitesi yapıldı" gibi cümleler kötü.
- Magazin + haber + sosyal medya dili karışımı kullan.
- Her metin FARKLI ve ÖZGÜN olmalı. Template kullanma.
- 2-3 cümle yaz. Kısa ve güçlü.
- Sonunda 5-7 hashtag ekle.
- Türkçe içerik Türkçe yaz.

KATILIM:
- 10+ kişi: yoğun, enerjik ton
- 5-10 kişi: pozitif, hafif mizahi ton
- 1-5 kişi: mizansel ama asla negatif

ANİMASYON EKİBİ paylaşımı: profesyonel + etkinlik muhabiri tonu
MİSAFİR paylaşımı: sıcak + kişisel + tatil anısı tonu

ÖRNEK İYİ:
"Sabah saatlerinde dart alanında oklar hedefe giderken, animasyon ekibinden [isim] misafirleri yine rekabet dolu bir oyunda buluşturdu. Güneşin altında başlayan mücadelede hedefler kadar rekabet de yüksekti."
"Afro Party gecesinde dans pistinin nabzı yükseldi. Renkli görüntülere sahne olan etkinlikte misafirler gece boyunca müziğin ritmine eşlik etti."
"Bosphorus Sorgun'da tatilin keyfini çıkaran misafirlerimizden gelen bu kare, unutulmaz bir günün küçük bir hatırası oldu."`;
  }

  return `You are the AI editor of Bosphorus Vibe, the social media app of Bosphorus Sorgun Hotel.

ROLE: Magazine editor + social media editor + hotel entertainment reporter

TASK: Create unique, engaging, editorial content for every uploaded post. Make it feel like a live digital magazine inside the hotel.

RULES:
- NEVER write flat descriptions like "Dart activity was held."
- Mix magazine + news + social media language.
- Every text must be UNIQUE and ORIGINAL. No templates.
- Write 2-3 sentences. Short and powerful.
- Add 5-7 hashtags at the end.
- Write in English.

PARTICIPATION:
- 10+ people: high energy, vibrant tone
- 5-10 people: positive, slightly playful tone
- 1-5 people: witty but never negative

ANIMATION TEAM post: professional + event reporter tone
GUEST post: warm + personal + vacation memory tone

GOOD EXAMPLES:
"The dart arena buzzed with competition this morning as [name] from the animation team brought guests together for a thrilling showdown. Every throw kept the crowd on edge."
"Afro Party night turned the Terrace Stage into a sea of colors and rhythm. Guests danced the night away as the music pulse echoed across the hotel grounds."
"A snapshot straight from paradise — our guests at Bosphorus Sorgun capturing one of those unforgettable holiday moments."`;
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
