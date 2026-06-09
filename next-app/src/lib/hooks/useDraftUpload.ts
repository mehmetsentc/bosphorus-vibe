"use client";

/**
 * useDraftUpload — Instagram-style background upload.
 *
 * Starts compressing + uploading to Firebase Storage immediately when a file
 * is selected, so by the time the user finishes writing a caption the media
 * is already (or nearly) uploaded. Publishing then only needs a Firestore
 * document write instead of the full upload wait.
 */

import { useEffect, useRef, useState } from "react";
import { isVideoFile } from "@/lib/utils/media-compress";
import {
  uploadVideoPost,
  uploadImagePost,
} from "@/lib/services/firestore";

export type DraftStatus = "idle" | "uploading" | "ready" | "error";

export type DraftResult = {
  isVideo: boolean;
  originalUrl: string;
  lowUrl: string;
  thumbnailUrl?: string;
};

export type DraftState = {
  status: DraftStatus;
  /** 0–100 */
  progress: number;
  result: DraftResult | null;
  error: string | null;
};

const IDLE: DraftState = {
  status: "idle",
  progress: 0,
  result: null,
  error: null,
};

export function useDraftUpload(
  file: File | null,
  userId: string | undefined,
  /** Set to false to skip background upload (e.g. for story kind). */
  enabled = true,
): DraftState {
  const [state, setState] = useState<DraftState>(IDLE);
  // Abort flag so stale async callbacks don't write to state after unmount or
  // file change.
  const abortRef = useRef(false);

  useEffect(() => {
    if (!file || !userId || !enabled) {
      setState(IDLE);
      return;
    }

    abortRef.current = false;
    setState({ status: "uploading", progress: 0, result: null, error: null });

    const isVideo = isVideoFile(file);

    async function run() {
      try {
        if (isVideo) {
          const { originalUrl, lowUrl, thumbnailUrl } = await uploadVideoPost(
            file!,
            userId!,
            (pct) => {
              if (!abortRef.current)
                setState((s) => ({ ...s, progress: pct }));
            },
          );
          if (!abortRef.current) {
            setState({
              status: "ready",
              progress: 100,
              result: { isVideo: true, originalUrl, lowUrl, thumbnailUrl },
              error: null,
            });
          }
        } else {
          const { originalUrl, lowUrl } = await uploadImagePost(
            file!,
            userId!,
            (pct) => {
              if (!abortRef.current)
                setState((s) => ({ ...s, progress: pct }));
            },
          );
          if (!abortRef.current) {
            setState({
              status: "ready",
              progress: 100,
              result: { isVideo: false, originalUrl, lowUrl },
              error: null,
            });
          }
        }
      } catch (err) {
        if (!abortRef.current) {
          console.error("[DraftUpload]", err);
          setState({
            status: "error",
            progress: 0,
            result: null,
            error: String(err),
          });
        }
      }
    }

    void run();

    return () => {
      abortRef.current = true;
    };
  }, [file, userId, enabled]);

  return state;
}
