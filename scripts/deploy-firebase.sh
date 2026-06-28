#!/usr/bin/env bash
# Bosphorus Vibe — Firebase deploy (doğru proje: bosphorusvibe-dbd93)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT="bosphorusvibe-dbd93"
FB="npx --yes firebase-tools@15.22.3"

echo "→ Firebase projesi: $PROJECT"
echo "→ Giriş kontrolü..."
$FB login:list || { echo "Önce: npx firebase-tools login"; exit 1; }

cd "$ROOT/firebase"
$FB use "$PROJECT"

echo "→ Storage rules deploy..."
$FB deploy -P "$PROJECT" --only storage

echo "→ Video pipeline functions deploy..."
$FB deploy -P "$PROJECT" --only \
  functions:transcodeVideoPost,\
functions:transcodeVideoPostOnUpdate,\
functions:processPendingVideoTranscodes,\
functions:runVideoTranscodeBatch,\
functions:adminRunTranscodeBatch,\
functions:runStorageVideoSyncBatch,\
functions:adminRunStorageVideoSync,\
functions:configureAllVideoStorage,\
functions:autoMaintainVideoStorage

echo "→ Artifact cleanup policy (opsiyonel uyarı giderici)..."
$FB functions:artifacts:setpolicy -P "$PROJECT" --force || true

echo "→ Storage CORS (Range prefetch için)..."
node "$ROOT/scripts/storage-video-pipeline.mjs" --cors-only || echo "⚠ CORS script atlandı (service account gerekli)"

echo "✓ Firebase deploy tamam."
echo "  Tam backfill: npm run storage:configure"
