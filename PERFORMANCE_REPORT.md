# Bosphorus Vibe — Video Performance Optimization Report

**Date:** June 27, 2026  
**Goal:** Enterprise-grade video feed comparable to TikTok / Instagram Reels / YouTube Shorts — architecture-first, not quality sacrifice.

---

## Executive Summary

The app already had partial optimizations (reels video windowing, adaptive MP4 tiers, Cloud Function transcode, poster-first UX). The main bottlenecks were **unbounded DOM growth**, **simultaneous video loading**, **unused blob prefetch**, **inefficient Firestore reads**, and **no feed virtualization**.

This pass implements **strict 3-video memory policy**, **window-scrolled feed virtualization**, **cancellable smart prefetch**, **LRU blob cache for next reel**, **indexed reels queries**, **480p encode tier**, and **client telemetry**.

---

## Modified Files

| File | Change |
|------|--------|
| `next-app/package.json` | Added `@tanstack/react-virtual` |
| `next-app/src/lib/performance/app-state.ts` | `REELS_DOM_WINDOW_RADIUS`, `SESSION_POSTS_MAX`, poster prefetch caps |
| `next-app/src/lib/performance/video-prefetch-manager.ts` | **New** — abortable prefetch, reel scope (current + next only) |
| `next-app/src/lib/performance/video-metrics.ts` | **New** — TTFF, video start, buffer, FPS telemetry |
| `next-app/src/components/feed/VirtualFeedList.tsx` | **New** — window virtualizer for home feed |
| `next-app/src/components/home/FeedInfinite.tsx` | Uses `VirtualFeedList`; reduced poster prefetch |
| `next-app/src/components/reels/ReelFeed.tsx` | DOM windowing, strict video window, prefetch cancel |
| `next-app/src/components/post/FeedPostCard.tsx` | Unmount video off-screen; conditional poster prefetch |
| `next-app/src/components/profile/ProfilePostFeed.tsx` | Same DOM/video windowing as reels |
| `next-app/src/components/events/EventMediaFeed.tsx` | Poster-only grid (no `AdaptiveVideo` decoders) |
| `next-app/src/components/video/VideoPlayer.tsx` | Pass `isNext` to reels hook |
| `next-app/src/lib/hooks/useReelsVideoSrc.ts` | Blob cache + metrics + next-only prefetch |
| `next-app/src/lib/utils/video-sources.ts` | Managed prefetch, medium tier ladder, capped image preload |
| `next-app/src/lib/utils/video-blob-cache.ts` | Wired + abort + LRU (3 entries, 12MB cap) |
| `next-app/src/lib/services/firestore.ts` | Indexed `getVideoPostsPage` (`postVideo != ""`) |
| `next-app/src/store/appStore.ts` | Session memory cap (`SESSION_POSTS_MAX = 120`) |
| `next-app/src/types/index.ts` | `postVideoURL_medium`, `postVideoURL_hls` fields |
| `next-app/src/lib/media/video-encode.ts` | 480p `serverMedium` tier |
| `firebase/functions/video-encode.js` | 480p encode profile + `medium.mp4` path |
| `firebase/functions/index.js` | Transcode pipeline outputs `medium.mp4` |
| `next-app/src/i18n/messages/xk.ts` | Fixed pre-existing export typo (build blocker) |

---

## Optimizations by Requirement

### Step 2 — Never load every video
- **Reels:** Only `activeIndex ± 1` mount `<video>` (`REELS_VIDEO_WINDOW_RADIUS = 1`). Removed bug that always mounted index 0.
- **Feed:** Video element unmounts when card leaves near/active viewport.
- **Events grid:** Posters only — zero grid decoders.
- **Prewarm:** Max 1 hidden `<video>` element (was 2).

### Step 3 — Feed virtualization
- `VirtualFeedList` uses `@tanstack/react-virtual` `useWindowVirtualizer`.
- Only visible rows (+ 4 overscan) exist in DOM.
- Constant memory during long scroll sessions.

### Step 4 — Smart prefetch
- `video-prefetch-manager.ts` aborts stale Range fetches on swipe.
- `prewarmReelsPosts` prefetches **next clip only** (X+1).
- Blob cache prefetches next reel preview into memory with LRU eviction.

### Step 5 — Instant thumbnail
- Unchanged poster-first architecture; feed cards show `FeedVideoPoster` until `onPlaying`.
- Poster prefetch capped and scoped to near-visible cards.

### Step 6 — Adaptive streaming
- **MP4 ladder:** preview (540p) → **medium (480p)** → low (720p) → high (1080p).
- Cloud Function now encodes `medium.mp4` with `+faststart`.
- **HLS:** `postVideoURL_hls` field reserved; full HLS pipeline documented as future work (see below).

### Step 7 — CDN
- Existing `Cache-Control: public, max-age=31536000, immutable` on all uploads + transcodes unchanged.
- Firebase Storage + Google CDN edge caching remains; no signed-URL churn on playback.

### Step 8–10 — Upload / compression / fast start
- Server transcode outputs all tiers with H.264 + AAC + `movflags +faststart`.
- Client upload preview unchanged; feed never processes raw original when transcode `done`.

### Step 11 — Player optimization
- `VideoPlayer` releases src when outside load window (reels).
- Global play singleton preserved.
- Blob URL playback when prefetched.

### Step 12 — Scroll performance
- Virtual feed eliminates layout thrash from hundreds of cards.
- Reels use lightweight spacer slides outside DOM window.

### Step 13 — Firestore
- Reels pagination uses indexed query: `where("postVideo", "!=", "")` + cursor pagination.
- Eliminates client-side filter loop wasting reads.

### Step 14 — Media cache
- Blob LRU: 3 entries, 12MB max per clip.
- Session posts capped at 120 in Zustand.

### Step 15–16 — Images / skeleton
- Image preload cap (48 URLs max).
- Existing skeleton loaders unchanged.

### Step 17 — Background processing
- Video decode stays on browser media thread; no main-thread FFmpeg on client.

### Step 18 — Memory profiling fixes
- Removed unbounded poster prefetch (6 → 2 per card).
- Fixed catalog DOM duplication impact via virtualization + session trim.
- Probe generation counter prevents stale URL probe updates.

### Step 19 — Analytics
- `video-metrics.ts` tracks TTFF, video start time, buffer stalls, quality downgrades, prefetch cancels, FPS drops.
- Dev: `console.debug`; prod: `window` event `bv:video-metric` for analytics wiring.

### Step 20 — Refactoring
- Centralized prefetch/metrics modules.
- Reels prefetch scope extracted from scattered effects.

### Step 21 — UX target (~300ms start)
- Next-reel blob prefetch + leading-byte Range + preview-first ladder targets sub-300ms on good WiFi when transcode complete.

---

## Before / After (Expected)

| Metric | Before | After (expected) |
|--------|--------|------------------|
| Feed DOM nodes at 100 posts | ~100 full cards | ~8–12 visible rows |
| Reels `<video>` elements | Up to N (windowed but all slide DOM) | Max 3 decoders |
| Reels DOM slides | All N slides with posters | Active ±2 posters, rest spacers |
| Event grid decoders | 1 per video cell | 0 until tap |
| Reels Firestore reads/page | Up to 20 docs filtered in JS | Exact page size via index |
| Session post memory | Unbounded | 120 max |
| Blob prefetch | Implemented, unused | Active for next reel |
| Prefetch on fast swipe | Continues downloading | Aborted |
| Encode tiers | 540p / 720p / 1080p | + 480p medium |

*Production metrics should be collected via `getVideoMetricsSummary()` after deployment.*

---

## Remaining Bottlenecks

1. **No HLS/DASH yet** — Progressive MP4 tier switching requires new file fetch on downgrade. Recommend FFmpeg HLS packaging in Cloud Functions + `hls.js` when `postVideoURL_hls` is set.

2. **Feed Firestore query** — Still scans non-media posts for mixed photo/video feed (`getFeedPostsPage`). Recommend adding `hasMedia: true` field on publish for indexed feed query.

3. **Firebase Storage direct delivery** — No dedicated video CDN (Cloudflare Stream / Mux). Acceptable at current scale; consider at >10k DAU.

4. **Catalog cycling** — Still duplicates post IDs in infinite scroll when all pages loaded; virtualization mitigates DOM cost but logical duplicates remain.

5. **Legacy posts** — Need admin transcode backfill for `medium.mp4` on existing content.

6. **No Firestore offline persistence** — Custom Zustand cache only.

---

## Future Improvements

1. **HLS adaptive streaming** — Generate `master.m3u8` + 360p/480p/720p/1080p segments in Cloud Functions; integrate `hls.js` with native Safari fallback.

2. **`hasMedia` composite index** — Single indexed feed query for photo + video posts.

3. **Dedicated video CDN** — Cloudflare cache in front of Storage bucket or migrate to Stream.

4. **Wire metrics to Vercel Analytics / Datadog** — Listen for `bv:video-metric` events.

5. **Reels virtualizer** — Full `@tanstack/react-virtual` snap scroll (current DOM windowing is ~90% of benefit with lower risk).

6. **Admin backfill** — Run transcode batch for `medium.mp4` on historical posts.

---

## Deployment Notes

```bash
# Deploy updated Cloud Functions (480p tier)
npm run firebase:deploy:transcode

# Deploy indexes (postVideo index already exists)
npm run firebase:deploy:indexes

# Web app
npm run build && npm start
```

New encode tier applies to **new uploads and re-transcoded posts** only. Existing posts continue on preview/low/high until batch transcode runs.

---

## Architecture Diagram

```
Upload → Firebase Storage (original + client preview + thumb)
              ↓
     Cloud Function transcodeVideoPost
              ↓
   preview.mp4 | medium.mp4 | low.mp4 | high.mp4 | thumb.jpg
   (+faststart, immutable cache headers)
              ↓
     Firestore (tokenized URLs + transcode status)
              ↓
┌─────────────┴─────────────┐
│  Feed (VirtualFeedList)   │  Reels (DOM window + video window)
│  Poster → lazy <video>    │  Poster → active ±1 <video>
│  Unmount off-screen       │  Blob prefetch next clip only
└───────────────────────────┘
              ↓
     video-metrics telemetry
```

---

*Report generated as part of the Bosphorus Vibe professional video performance optimization initiative.*
