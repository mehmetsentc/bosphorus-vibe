"use client";

import { Suspense, useState } from "react";
import { ChatList } from "@/components/messages/ChatList";
import { NewMessageSheet } from "@/components/messages/NewMessageSheet";
import { useT } from "@/components/providers/I18nProvider";

function MessagesPageContent() {
  const t = useT();
  const [composeOpen, setComposeOpen] = useState(false);

  return (
    <>
      <div className="mx-auto flex h-[calc(100dvh-4rem)] max-w-[935px] border border-border md:mt-4 md:h-[calc(100dvh-2rem)] md:rounded-2xl md:bg-background">
        <aside className="flex w-full flex-col border-r border-border md:w-[350px] md:shrink-0">
          <ChatList onCompose={() => setComposeOpen(true)} />
        </aside>
        <section className="hidden flex-1 flex-col items-center justify-center bg-background md:flex">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-border">
            <svg
              className="h-10 w-10 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold">{t("messagesInboxTitle")}</h2>
          <p className="mt-2 max-w-xs text-center text-sm text-muted">
            {t("messagesInboxDesc")}
          </p>
          <button
            type="button"
            onClick={() => setComposeOpen(true)}
            className="mt-4 text-sm font-semibold text-gold hover:brightness-110"
          >
            {t("messagesSendMessage")}
          </button>
        </section>
      </div>

      <NewMessageSheet open={composeOpen} onClose={() => setComposeOpen(false)} />
    </>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      }
    >
      <MessagesPageContent />
    </Suspense>
  );
}
