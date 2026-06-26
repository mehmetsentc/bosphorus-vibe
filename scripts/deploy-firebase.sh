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

echo "→ Transcode functions deploy..."
$FB deploy -P "$PROJECT" --only \
  functions:transcodeVideoPost,\
functions:processPendingVideoTranscodes,\
functions:runVideoTranscodeBatch,\
functions:adminRunTranscodeBatch

echo "→ Artifact cleanup policy (opsiyonel uyarı giderici)..."
$FB functions:artifacts:setpolicy -P "$PROJECT" --force || true

echo "✓ Firebase deploy tamam."
