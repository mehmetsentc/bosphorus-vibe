# Bosphorus Vibe — Deploy Rehberi (Basit)

Bu rehber teknik bilgi gerektirmez. **Çoğu iş zaten yapıldı.**

## Proje bilgileri

| | |
|---|---|
| **Uygulama** | Bosphorus Vibe |
| **Firebase Project ID** | `bosphorusvibe-dbd93` |
| **Site** | https://www.bosphorusvibe.com |
| **GitHub** | mehmetsentc/bosphorus-vibe |

> Eski `reyliax` projesi **bu uygulama değil**. Yanlış Firebase hesabı/proje seçilmişti; artık scriptler doğru projeyi kullanıyor.

---

## Zaten yapılanlar ✓

1. **Kod GitHub’a push edildi** (`main` branch)
2. **Video performans optimizasyonları** commit edildi
3. **Firebase Cloud Functions** `bosphorusvibe-dbd93` projesine deploy edildi:
   - `transcodeVideoPost` (yeni videoları otomatik encode eder)
   - `processPendingVideoTranscodes`
   - `runVideoTranscodeBatch`
   - `adminRunTranscodeBatch`
4. Deploy scriptleri `-P bosphorusvibe-dbd93` ile sabitlendi

---

## Web sitesi (Vercel) — otomatik

GitHub’a push yapıldığında Vercel genelde **kendiliğinden** yeni sürümü yayınlar.

**Kontrol:** https://vercel.com/dashboard → projeniz → son deployment “Ready” mi?

Push sonrası 2–5 dakika bekleyin, sonra https://www.bosphorusvibe.com adresini açın.

---

## Firebase — tekrar deploy gerekirse

Terminalde proje klasöründe:

```bash
cd /Users/user/Desktop/bosphorus_vibe
chmod +x scripts/deploy-firebase.sh
./scripts/deploy-firebase.sh
```

İlk seferde Firebase girişi istenirse:

```bash
npx firebase-tools login
```

(Google hesabınız: `mehmetsentc@gmail.com`)

---

## Eski videolar için transcode (admin)

Yeni encode tier’ları (480p medium) **yeni yüklemeler** için otomatik. Eski videolar için admin panelden transcode batch çalıştırın veya:

Admin → Tools → Video transcode batch

---

## Sorun çıkarsa

| Belirti | Çözüm |
|---------|--------|
| Site güncellenmedi | Vercel dashboard’da deployment durumuna bakın |
| Video yavaş / eski kalite | Admin’den transcode backfill |
| Firebase 403 hatası | `npx firebase-tools login` + doğru Google hesabı |
| Yanlış proje | Asla `reyliax` değil; her zaman `bosphorusvibe-dbd93` |

---

Detaylı performans raporu: [PERFORMANCE_REPORT.md](./PERFORMANCE_REPORT.md)
