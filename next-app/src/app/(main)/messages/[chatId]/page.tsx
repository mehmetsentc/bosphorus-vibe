"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ChatList } from "@/components/messages/ChatList";
import { ChatOptionsSheet } from "@/components/messages/ChatOptionsSheet";
import { ChatThread } from "@/components/messages/ChatThread";
import { useAuth } from "@/components/providers/AuthProvider";
import { useT } from "@/components/providers/I18nProvider";
import { getUserDoc } from "@/lib/services/auth";
import { getChat, type ChatInboxFilter } from "@/lib/services/messages";

export default function ChatDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      }
    >
      <ChatDetailContent />
    </Suspense>
  );
}

function ChatDetailContent() {
  const params = useParams<{ chatId: string }>();
  const searchParams = useSearchParams();
  const chatId = params.chatId;
  const filter = (searchParams.get("filter") as ChatInboxFilter | null) ?? "inbox";
  const t = useT();
  const { user } = useAuth();
  const [otherUserName, setOtherUserName] = useState<string>();
  const [otherUserPhoto, setOtherUserPhoto] = useState<string>();
  const [otherUserId, setOtherUserId] = useState<string>();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isSpam, setIsSpam] = useState(false);

  useEffect(() => {
    if (!chatId || !user) return;
    let cancelled = false;

    async function load() {
      const chat = await getChat(chatId);
      if (!chat || cancelled) return;

      setIsHidden(chat.hiddenByIds?.includes(user!.uid) ?? false);
      setIsSpam(chat.spamByIds?.includes(user!.uid) ?? false);

      const otherId = chat.userIds.find((id) => id !== user!.uid);
      if (!otherId) return;

      setOtherUserId(otherId);
      const profile = await getUserDoc(otherId);
      if (cancelled) return;
      setOtherUserName(profile?.display_name || profile?.userName || t("user"));
      setOtherUserPhoto(profile?.photo_url);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [chatId, user, t]);

  return (
    <>
      <div className="mx-auto flex h-[calc(100dvh-4rem)] max-w-[935px] border border-border md:mt-4 md:h-[calc(100dvh-2rem)] md:rounded-2xl md:bg-background">
        <aside className="hidden w-[350px] shrink-0 flex-col border-r border-border md:flex">
          <ChatList activeChatId={chatId} filter={filter} />
        </aside>
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 md:hidden">
            <div className="flex min-w-0 items-center gap-3">
              <Link href={`/messages${filter !== "inbox" ? `?filter=${filter}` : ""}`} className="shrink-0 text-sm text-gold">
                ← {t("back")}
              </Link>
              <span className="truncate font-semibold">
                {otherUserName || t("navMessages")}
              </span>
            </div>
            {user && (
              <button
                type="button"
                onClick={() => setOptionsOpen(true)}
                aria-label={t("messagesChatOptions")}
                className="shrink-0 rounded-lg p-2 text-muted"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
            )}
          </header>
          <ChatThread
            chatId={chatId}
            otherUserName={otherUserName}
            otherUserPhoto={otherUserPhoto}
            otherUserId={otherUserId}
          />
        </section>
      </div>

      {user && (
        <ChatOptionsSheet
          open={optionsOpen}
          onClose={() => setOptionsOpen(false)}
          chatId={chatId}
          currentUid={user.uid}
          otherUserId={otherUserId}
          otherUserName={otherUserName}
          isHidden={isHidden}
          isSpam={isSpam}
        />
      )}
    </>
  );
}
