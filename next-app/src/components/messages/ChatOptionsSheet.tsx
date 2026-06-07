"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSettings } from "@/components/settings/SettingsProvider";
import { useT } from "@/components/providers/I18nProvider";
import {
  deleteChatForUser,
  hideChat,
  markChatAsSpam,
  restoreChatToInbox,
} from "@/lib/services/messages";

type ChatOptionsSheetProps = {
  open: boolean;
  onClose: () => void;
  chatId: string;
  currentUid: string;
  otherUserId?: string;
  otherUserName?: string;
  isHidden?: boolean;
  isSpam?: boolean;
};

export function ChatOptionsSheet({
  open,
  onClose,
  chatId,
  currentUid,
  otherUserId,
  otherUserName,
  isHidden = false,
  isSpam = false,
}: ChatOptionsSheetProps) {
  const t = useT();
  const router = useRouter();
  const { addToList } = useSettings();
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  async function run(action: () => Promise<void>, redirect?: string) {
    if (busy) return;
    setBusy(true);
    try {
      await action();
      onClose();
      if (redirect) router.push(redirect);
    } finally {
      setBusy(false);
    }
  }

  const name = otherUserName || t("user");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <button
        type="button"
        aria-label={t("cancel")}
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl bg-background pb-safe sm:rounded-2xl">
        <div className="border-b border-border px-4 py-4 text-center">
          <p className="font-semibold">{name}</p>
          <p className="mt-0.5 text-xs text-muted">{t("messagesChatOptions")}</p>
        </div>
        <ul className="py-1">
          {!isHidden && !isSpam && (
            <li>
              <button
                type="button"
                disabled={busy}
                onClick={() => run(() => hideChat(chatId, currentUid), "/messages")}
                className="block w-full px-4 py-3.5 text-left text-[15px] transition hover:bg-surface-overlay/60 disabled:opacity-50"
              >
                {t("messagesHideChat")}
              </button>
            </li>
          )}
          {(isHidden || isSpam) && (
            <li>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  run(() => restoreChatToInbox(chatId, currentUid))
                }
                className="block w-full px-4 py-3.5 text-left text-[15px] text-gold transition hover:bg-surface-overlay/60 disabled:opacity-50"
              >
                {t("messagesRestoreChat")}
              </button>
            </li>
          )}
          {!isSpam && (
            <li>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await markChatAsSpam(chatId, currentUid);
                    if (otherUserId && otherUserName) {
                      addToList("spamUsers", {
                        uid: otherUserId,
                        userName: otherUserName,
                      });
                    }
                  }, "/messages?filter=spam")
                }
                className="block w-full px-4 py-3.5 text-left text-[15px] transition hover:bg-surface-overlay/60 disabled:opacity-50"
              >
                {t("messagesMarkUnwanted")}
              </button>
            </li>
          )}
          {otherUserId && otherUserName && (
            <>
              <li>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    addToList("mutedUsers", {
                      uid: otherUserId,
                      userName: otherUserName,
                    });
                    onClose();
                  }}
                  className="block w-full px-4 py-3.5 text-left text-[15px] transition hover:bg-surface-overlay/60 disabled:opacity-50"
                >
                  {t("messagesMuteUser")}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    addToList("blockedUsers", {
                      uid: otherUserId,
                      userName: otherUserName,
                    });
                    run(() => deleteChatForUser(chatId, currentUid), "/messages");
                  }}
                  className="block w-full px-4 py-3.5 text-left text-[15px] text-red-400 transition hover:bg-surface-overlay/60 disabled:opacity-50"
                >
                  {t("messagesBlockUser")}
                </button>
              </li>
            </>
          )}
          <li>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                run(() => deleteChatForUser(chatId, currentUid), "/messages")
              }
              className="block w-full px-4 py-3.5 text-left text-[15px] text-red-400 transition hover:bg-surface-overlay/60 disabled:opacity-50"
            >
              {t("messagesDeleteChat")}
            </button>
          </li>
        </ul>
        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-surface-overlay py-3 text-sm font-semibold"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
