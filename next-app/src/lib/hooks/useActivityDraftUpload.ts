"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  compressImage,
  compressVideo,
  isVideoFile,
  type CompressedVideoResult,
} from "@/lib/utils/media-compress";
import {
  uploadActivityMedia,
  type ActivityMediaUrls,
} from "@/lib/services/firestore";
import type { DraftStatus } from "@/lib/hooks/useDraftUpload";

export type ActivityDraftResult = ActivityMediaUrls & { isVideo: boolean };

type ActivityDraftState = {
  status: DraftStatus;
  progress: number;
  result: ActivityDraftResult | null;
  error: string | null;
};

const IDLE: ActivityDraftState = {
  status: "idle",
  progress: 0,
  result: null,
  error: null,
};

export type UseActivityDraftUploadReturn = ActivityDraftState & {
  waitUntilReady: () => Promise<ActivityDraftResult>;
};

/**
 * Compress + upload activity media in the background while the user fills the form.
 */
export function useActivityDraftUpload(
  file: File | null,
  userId: string | undefined,
  enabled = true,
): UseActivityDraftUploadReturn {
  const [state, setState] = useState<ActivityDraftState>(IDLE);
  const abortRef = useRef(false);
  const inflightRef = useRef<Promise<ActivityDraftResult> | null>(null);
  const resultRef = useRef<ActivityDraftResult | null>(null);
  const stampRef = useRef<number | null>(null);

  useEffect(() => {
    if (!file || !userId || !enabled) {
      inflightRef.current = null;
      resultRef.current = null;
      stampRef.current = null;
      setState(IDLE);
      return;
    }

    abortRef.current = false;
    resultRef.current = null;
    stampRef.current = Date.now();
    const stamp = stampRef.current;
    setState({ status: "uploading", progress: 0, result: null, error: null });

    const promise = (async () => {
      const isVideo = isVideoFile(file);
      setState((s) => ({ ...s, progress: 2 }));

      let compressed: CompressedVideoResult | null = null;
      const lowQualityBlob = isVideo
        ? (compressed = await compressVideo(file)).video
        : await compressImage(file);

      if (abortRef.current || stampRef.current !== stamp) {
        throw new Error("Upload cancelled");
      }

      const urls = await uploadActivityMedia(
        {
          userId,
          isVideo,
          originalFile: file,
          lowQualityBlob,
          thumbnailBlob: compressed?.thumbnail,
          stamp,
        },
        (pct) => {
          if (!abortRef.current) {
            setState((s) => ({ ...s, progress: pct }));
          }
        },
      );

      const result: ActivityDraftResult = { ...urls, isVideo };
      if (!abortRef.current && stampRef.current === stamp) {
        resultRef.current = result;
        setState({
          status: "ready",
          progress: 100,
          result,
          error: null,
        });
      }
      return result;
    })().catch((err) => {
      if (!abortRef.current) {
        console.error("[ActivityDraftUpload]", err);
        setState({
          status: "error",
          progress: 0,
          result: null,
          error: String(err),
        });
      }
      throw err;
    });

    inflightRef.current = promise;

    return () => {
      abortRef.current = true;
    };
  }, [file, userId, enabled]);

  const waitUntilReady = useCallback(async (): Promise<ActivityDraftResult> => {
    if (resultRef.current) return resultRef.current;
    const inflight = inflightRef.current;
    if (inflight) return inflight;
    throw new Error("No activity draft upload in progress");
  }, []);

  return { ...state, waitUntilReady };
}
