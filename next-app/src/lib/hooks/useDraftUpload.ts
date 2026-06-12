"use client";

/**
 * useDraftUpload — Instagram-style background upload.
 *
 * Starts uploading to Firebase Storage as soon as a file is selected, so
 * publishing only needs a Firestore write when the user taps Share.
 */

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { isVideoFile } from "@/lib/utils/media-compress";
import {
  uploadVideoPost,
  uploadImagePost,
} from "@/lib/services/firestore";
import {
  uploadStoryImage,
  uploadStoryVideo,
} from "@/lib/services/stories";

export type DraftUploadMode = "post" | "story";

export type DraftStatus = "idle" | "uploading" | "ready" | "error";

export type DraftResult = {
  isVideo: boolean;
  originalUrl: string;
  lowUrl: string;
  thumbnailUrl?: string;
  /** Story cover — image URL or video poster */
  photoUrl?: string;
};

export type DraftState = {
  status: DraftStatus;
  /** 0–100 */
  progress: number;
  result: DraftResult | null;
  error: string | null;
};

export type UseDraftUploadReturn = DraftState & {
  /** Resolves when the in-flight upload finishes (or immediately if ready). */
  waitUntilReady: () => Promise<DraftResult>;
};

const IDLE: DraftState = {
  status: "idle",
  progress: 0,
  result: null,
  error: null,
};

type DraftUploadOptions = {
  enabled?: boolean;
  mode?: DraftUploadMode;
  /** Latest cover frame / custom image — read when uploading thumb.jpg */
  thumbnailRef?: RefObject<Blob | null>;
};

async function runDraftUpload(
  file: File,
  userId: string,
  mode: DraftUploadMode,
  onProgress: (pct: number) => void,
  thumbnailRef?: RefObject<Blob | null>,
): Promise<DraftResult> {
  const isVideo = isVideoFile(file);

  if (mode === "story") {
    if (isVideo) {
      const { originalUrl, lowUrl, thumbnailUrl } = await uploadStoryVideo(
        file,
        userId,
        onProgress,
        {
          getThumbnailBlob: () => thumbnailRef?.current ?? null,
        },
      );
      return {
        isVideo: true,
        originalUrl,
        lowUrl,
        thumbnailUrl,
        photoUrl: thumbnailUrl,
      };
    }
    const photoUrl = await uploadStoryImage(file, userId, onProgress);
    return {
      isVideo: false,
      originalUrl: photoUrl,
      lowUrl: photoUrl,
      photoUrl,
    };
  }

  if (isVideo) {
    const { originalUrl, lowUrl, thumbnailUrl } = await uploadVideoPost(
      file,
      userId,
      onProgress,
      {
        getThumbnailBlob: () => thumbnailRef?.current ?? null,
      },
    );
    return { isVideo: true, originalUrl, lowUrl, thumbnailUrl };
  }

  const { originalUrl, lowUrl } = await uploadImagePost(file, userId, onProgress);
  return { isVideo: false, originalUrl, lowUrl };
}

export function useDraftUpload(
  file: File | null,
  userId: string | undefined,
  options: boolean | DraftUploadOptions = true,
): UseDraftUploadReturn {
  const opts: DraftUploadOptions =
    typeof options === "boolean" ? { enabled: options } : options;
  const enabled = opts.enabled ?? true;
  const mode = opts.mode ?? "post";
  const thumbnailRef = opts.thumbnailRef;

  const [state, setState] = useState<DraftState>(IDLE);
  const abortRef = useRef(false);
  const inflightRef = useRef<Promise<DraftResult> | null>(null);
  const resultRef = useRef<DraftResult | null>(null);

  useEffect(() => {
    if (!file || !userId || !enabled) {
      inflightRef.current = null;
      resultRef.current = null;
      setState(IDLE);
      return;
    }

    abortRef.current = false;
    resultRef.current = null;
    setState({ status: "uploading", progress: 0, result: null, error: null });

    const promise = runDraftUpload(file, userId, mode, (pct) => {
      if (!abortRef.current) {
        setState((s) => ({ ...s, progress: pct }));
      }
    }, thumbnailRef)
      .then((result) => {
        if (!abortRef.current) {
          resultRef.current = result;
          setState({
            status: "ready",
            progress: 100,
            result,
            error: null,
          });
        }
        return result;
      })
      .catch((err) => {
        if (!abortRef.current) {
          console.error("[DraftUpload]", err);
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
  }, [file, userId, enabled, mode]);

  const waitUntilReady = useCallback(async (): Promise<DraftResult> => {
    if (resultRef.current) return resultRef.current;
    const inflight = inflightRef.current;
    if (inflight) return inflight;
    throw new Error("No draft upload in progress");
  }, []);

  return { ...state, waitUntilReady };
}
