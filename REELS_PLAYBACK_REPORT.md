# Reels Video Oynatma Raporu

**Tarih:** 27 Haziran 2026  
**Proje:** Bosphorus Vibe (`bosphorusvibe-dbd93`)  
**Kapsam:** Reels akışında videoların yüklenip hemen oynatılamaması

---

## 1. Özet

Reels akışında videolar görünür oluyor (poster/thumbnail) ancak oynatma gecikiyor veya başlamıyordu. Kök nedenler **URL hazırlama zinciri**, **HEAD probe gecikmesi**, **prefetch kapsamı** ve **video element yaşam döngüsü** üzerinde yoğunlaşıyordu. Bu rapordaki bulgulara göre kod güncellendi; hedef: ilk frame’e **&lt;1.5 sn** ve swipe sonrası **anında** oynatma.

---

## 2. Reels Akış Mimarisi

```
/reels → useReelsPosts (2 faz: son 7 gün + popüler)
       → ReelFeed (virtual window ±2, video mount ±1)
       → ReelItem → VideoPlayer (isReels)
       → useReelsVideoSrc (URL ladder + blob cache)
       → video-sources.ts / video-blob-cache.ts / video-url-probe.ts
```

| Katman | Dosya | Rol |
|--------|-------|-----|
| Sayfa | `app/reels/page.tsx` | ReelFeed mount |
| Feed | `ReelFeed.tsx` | Aktif index, swipe, prefetch scope |
| Oynatıcı | `VideoPlayer.tsx` | `<video>`, play/pause, adaptive fallback |
| URL hook | `useReelsVideoSrc.ts` | Kalite sırası, blob, probe |
| Kaynak | `video-sources.ts` | Tokenized URL, ladder, prewarm |
| Önbellek | `video-blob-cache.ts` | Blob URL önbelleği |
| Probe | `video-url-probe.ts` | HEAD ile URL varlık kontrolü |
| Prefetch | `video-prefetch-manager.ts` | Range istekleri, iptal |
| İlk fetch | `reels-fetch.ts`, `ReelsPrefetcher.tsx` | SSR/cache sonrası prewarm |

---

## 3. Kök Neden Analizi

### 3.1 Bloklayan HEAD probe (kritik)

**Sorun:** `useReelsVideoSrc` ve `filterExistingVideoUrls`, oynatmadan önce ladder’daki her URL için sıralı HEAD isteği yapıyordu. Firestore’dan gelen token’lı URL’ler zaten güvenilir; yine de 3–6 URL × ~100–400 ms = **0.5–2+ sn** gecikme.

**Etki:** Video `src` boş kalıyor; poster görünür, ses/oynatma yok.

**Çözüm:** Token’lı / doğrudan post URL’leri **anında** `playableUrls`’e yazılıyor. Tahmin edilen ladder URL’leri (`medium.mp4`, `720p` vb.) yalnızca **arka planda** probe ediliyor (`probeVideoUrlsInBackground`).

### 3.2 `getReelsImmediatePlayback` fazla candidate

**Sorun:** `ladderExtra` ile türetilen URL’ler immediate listesine ekleniyordu → gereksiz probe ve yanlış sıralama.

**Çözüm:** Immediate playback yalnızca `postVideo`, `videoUrl`, `video720Url` ve mevcut ladder tier’larından oluşuyor; inferred URL’ler probe sonrası ekleniyor.

### 3.3 İlk render’da boş `playableUrls`

**Sorun:** Hook `useState([])` ile başlıyor; `useEffect` sonrası URL geliyordu → **1+ frame** gecikme, bazen play effect’in boş `videoSrc` ile çalışması.

**Çözüm:** `instantUrls` useMemo + `activeUrls = playableUrls.length ? playableUrls : instantUrls` fallback; sync effect ile güncelleme.

### 3.4 Blob prefetch yalnızca “next” reel

**Sorun:** Aktif reel için blob indirme yok; yalnızca bir sonraki slide prewarm ediliyordu. İlk açılışta aktif video ağdan tam indirme bekliyordu.

**Çözüm:** `prewarmReelsPosts(posts, tier, withBlobForFirst)` — aktif reel `withBlobForFirst=true`, sonraki `false` (range prewarm).

### 3.5 Video element remount (`key` değişimi)

**Sorun:** `key={post.id:videoSrc}` reels’de `src` blob’a geçince element yeniden mount → decode sıfırlanıyor.

**Çözüm:** Reels için `key={post.id}` sabit; `src` güncellemesi `video.src = videoSrc` ile yapılıyor.

### 3.6 Çift poster katmanı

**Sorun:** `ReelItem` ve `VideoPlayer` aynı poster’ı gösteriyordu; aktif slide’da gereksiz overlay.

**Çözüm:** `mountVideo && isActive` olduğunda dış poster gizleniyor.

### 3.7 İlk frame timeout çok uzun

**Sorun:** 3000 ms adaptive fallback; kullanıcı “takıldı” algısı.

**Çözüm:** `REELS_FIRST_FRAME_TIMEOUT_MS = 1500` (yalnızca reels).

### 3.8 Preload politikası

**Sorun:** `preload="metadata"` next için; reels’de next slide tam buffer istenebilir.

**Çözüm:** Reels’de `isActive || isNext` → `preload="auto"`.

---

## 4. Oynatma Zaman Çizelgesi (önce / sonra)

### Önce (tipik)

| ms | Olay |
|----|------|
| 0 | Slide görünür, poster |
| 0–2000 | HEAD probe zinciri |
| 2000+ | `videoSrc` set, `load()` |
| 2500+ | İlk frame, `play()` |

### Sonra (hedef)

| ms | Olay |
|----|------|
| 0 | `instantUrls` → `videoSrc` (token URL veya blob) |
| 0–50 | `load()` + `attemptPlay()` |
| 100–800 | İlk frame (ağ / blob cache) |
| 1500 | Fallback tier veya probe sonucu |

---

## 5. Uygulanan Değişiklikler

| Dosya | Değişiklik |
|-------|------------|
| `useReelsVideoSrc.ts` | Anında URL, blob aktif+next, arka plan probe |
| `video-sources.ts` | Immediate playback sadeleştirme, prewarm blob seçeneği |
| `video-url-probe.ts` | `probeVideoUrlsInBackground()` |
| `app-state.ts` | `REELS_FIRST_FRAME_TIMEOUT_MS` |
| `VideoPlayer.tsx` | Sabit key, src güncelleme, preload, timeout |
| `ReelFeed.tsx` | Aktif+next prewarm, prefetch scope |
| `reels-fetch.ts` | İlk 2 reel prewarm |
| `ReelsPrefetcher.tsx` | Blob ile ilk reel |

---

## 6. Hâlâ Bilinen Sınırlamalar

1. **Eski videolar:** `medium.mp4` / encode tier yoksa ladder fallback gerekir; probe 1500 ms içinde tamamlanmazsa bir tier atlanabilir.
2. **İlk ziyaret / soğuk cache:** Blob yoksa ağ hızına bağlı; 480p tier deploy edilmiş olsa da eski içerik encode bekleyebilir.
3. **Çok düşük bant:** `networkTier === "slow"` düşük kalite öncelikli; yine de ilk byte gecikmesi olabilir.
4. **iOS Safari:** Autoplay muted zorunlu; `playsInline` mevcut.
5. **Firestore maliyeti:** 2 fazlı reels pagination ayrı sorgular; playback ile doğrudan ilgili değil.

---

## 7. Test Planı

- [ ] `/reels` açılış: ilk video &lt;1.5 sn içinde hareket ediyor
- [ ] Aşağı swipe: sonraki reel anında başlıyor
- [ ] Yukarı swipe: önceki reel (mount ±1) hızlı resume
- [ ] Yavaş ağ (DevTools throttling): düşük tier, fallback çalışıyor
- [ ] İkinci ziyaret: blob cache ile anında oynatma
- [ ] Mute/unmute reels overlay ile uyumlu
- [ ] `feed/[postId]` deep link reel aynı davranış

---

## 8. İzleme Önerileri (ileride)

- `performance.mark` / `measure`: `reels-src-ready`, `reels-first-frame`
- Console veya analytics: probe süresi, blob hit oranı, fallback tetiklenme
- Cloud Functions encode job başarı oranı (`medium.mp4` varlığı)

---

## 9. Sonuç

Gecikmenin ana nedeni **oynatmadan önce zorunlu URL doğrulama** ve **aktif reel için blob/range prefetch eksikliği** idi. URL’ler anında bağlandı, probe arka plana alındı, prefetch aktif+next kapsamına genişletildi ve video element yaşam döngüsü stabilize edildi. Build başarılı (`npm run build`).
