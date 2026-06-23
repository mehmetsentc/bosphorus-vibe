import { NextRequest } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api/auth";
import { apiError, apiOk, GENERIC_ERROR } from "@/lib/api/errors";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/types";
import { generateAiCaption } from "@/lib/ai/deepseek-editor";

const schema = z.object({
  postId: z.string().min(1),
  mediaUrl: z.string().url(),
  mediaType: z.enum(["image", "video"]),
  userRole: z.string().default("user"),
  userName: z.string().default("Misafir"),
  userCaption: z.string().default(""),
  activityName: z.string().optional(),
  location: z.string().optional(),
  participantCount: z.number().int().min(0).optional(),
  language: z.enum(["tr", "en"]).default("tr"),
});

export async function POST(request: NextRequest) {
  // Auth: giriş yapmış her kullanıcı kendi postu için çağırabilir
  let decoded: Awaited<ReturnType<typeof requireSession>>;
  try {
    decoded = await requireSession();
  } catch {
    return apiError(401, "UNAUTHORIZED", "Giriş gerekli.");
  }

  let input: z.infer<typeof schema>;
  try {
    const json = await request.json();
    input = schema.parse(json);
  } catch {
    return apiError(400, "INVALID_BODY", "Geçersiz istek.");
  }

  // Post sahibi kontrolü — sadece kendi postunu güncelleyebilir
  try {
    const db = getAdminDb();
    const postRef = db.collection(COLLECTIONS.userPosts).doc(input.postId);
    const postSnap = await postRef.get();

    if (!postSnap.exists) {
      return apiError(404, "NOT_FOUND", "Post bulunamadı.");
    }

    const postData = postSnap.data()!;
    // postUser is a DocumentReference — compare uid
    const postUserId: string =
      postData.postUser?.id ??
      postData.userId ??
      postData.uid ??
      "";

    if (postUserId !== decoded.uid) {
      return apiError(403, "FORBIDDEN", "Bu posta erişim izniniz yok.");
    }

    // AI caption + tüm dil çevirileri üret
    const result = await generateAiCaption(input);

    // Firestore'u güncelle — postDescriptions map tüm dilleri içerir
    await postRef.update({
      postDescription: result.fullText,               // default (uploader dili)
      postTitle: result.caption.slice(0, 80),
      postDescriptions: result.translations,          // { tr: "...", en: "...", ru: "..." }
      aiGenerated: true,
      aiGeneratedAt: new Date(),
    });

    return apiOk({
      caption: result.caption,
      hashtags: result.hashtags,
      fullText: result.fullText,
      translations: result.translations,
    });
  } catch (err) {
    console.error("[AI Caption]", err);
    return apiError(500, "AI_FAILED", GENERIC_ERROR);
  }
}
