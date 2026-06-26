/**
 * Client-side video feed performance telemetry.
 * Reports to console in dev; hook for analytics providers in production.
 */

type VideoMetricEvent =
  | "ttff"
  | "video_start"
  | "buffer_stall"
  | "quality_downgrade"
  | "prefetch_cancel"
  | "feed_fps_drop";

type MetricPayload = {
  postId?: string;
  context?: "feed" | "reels" | "detail";
  ms?: number;
  quality?: string;
  detail?: string;
};

const metricsBuffer: Array<{ event: VideoMetricEvent; payload: MetricPayload; ts: number }> =
  [];

let lastFrameTime = 0;
let fpsSampleCount = 0;
let fpsBelow60Count = 0;
let fpsMonitorStarted = false;

function emit(event: VideoMetricEvent, payload: MetricPayload = {}): void {
  const entry = { event, payload, ts: Date.now() };
  metricsBuffer.push(entry);
  if (metricsBuffer.length > 200) metricsBuffer.shift();

  if (process.env.NODE_ENV === "development") {
    console.debug(`[video-metrics] ${event}`, payload);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("bv:video-metric", { detail: entry }),
    );
  }
}

export function recordTimeToFirstFrame(
  postId: string,
  ms: number,
  context: MetricPayload["context"] = "reels",
): void {
  emit("ttff", { postId, ms, context });
}

export function recordVideoStart(
  postId: string,
  ms: number,
  context: MetricPayload["context"] = "reels",
): void {
  emit("video_start", { postId, ms, context });
}

export function recordBufferStall(postId: string, context: MetricPayload["context"]): void {
  emit("buffer_stall", { postId, context });
}

export function recordQualityDowngrade(
  postId: string,
  quality: string,
  context: MetricPayload["context"],
): void {
  emit("quality_downgrade", { postId, quality, context });
}

export function recordPrefetchCancel(detail?: string): void {
  emit("prefetch_cancel", { detail });
}

export function startFeedFpsMonitor(): () => void {
  if (fpsMonitorStarted || typeof window === "undefined") return () => {};
  fpsMonitorStarted = true;

  const tick = (now: number) => {
    if (lastFrameTime > 0) {
      const delta = now - lastFrameTime;
      fpsSampleCount += 1;
      if (delta > 20) fpsBelow60Count += 1;
      if (fpsSampleCount >= 300) {
        if (fpsBelow60Count > 30) {
          emit("feed_fps_drop", {
            detail: `${fpsBelow60Count}/${fpsSampleCount} frames >20ms`,
          });
        }
        fpsSampleCount = 0;
        fpsBelow60Count = 0;
      }
    }
    lastFrameTime = now;
    rafId = requestAnimationFrame(tick);
  };

  let rafId = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(rafId);
    fpsMonitorStarted = false;
  };
}

export function getRecentVideoMetrics() {
  return [...metricsBuffer];
}

export function getVideoMetricsSummary(): Record<string, number> {
  const ttff = metricsBuffer.filter((m) => m.event === "ttff").map((m) => m.payload.ms ?? 0);
  const starts = metricsBuffer
    .filter((m) => m.event === "video_start")
    .map((m) => m.payload.ms ?? 0);
  const avg = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  return {
    ttffAvgMs: avg(ttff),
    videoStartAvgMs: avg(starts),
    bufferStalls: metricsBuffer.filter((m) => m.event === "buffer_stall").length,
    qualityDowngrades: metricsBuffer.filter((m) => m.event === "quality_downgrade").length,
    prefetchCancels: metricsBuffer.filter((m) => m.event === "prefetch_cancel").length,
    fpsDrops: metricsBuffer.filter((m) => m.event === "feed_fps_drop").length,
  };
}
