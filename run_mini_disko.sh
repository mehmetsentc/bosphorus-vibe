#!/bin/bash
# Mini Disko'yu Firebase'e ekle
# Kullanım: bash run_mini_disko.sh
# Önce: Mini Disko görselini kopyala (sağ tık → Resmi Kopyala)

set -e
cd "$(dirname "$0")"

echo "📋 Clipboard'dan resim kaydediliyor..."
python3 - << 'PYEOF'
import subprocess, sys

script = """
use framework "AppKit"
use framework "Foundation"
set pb to current application's NSPasteboard's generalPasteboard()
set imgData to pb's dataForType_("public.png")
if imgData is missing value then
    set imgData to pb's dataForType_("public.tiff")
    if imgData is not missing value then
        set img to current application's NSImage's alloc()'s initWithData_(imgData)
        set tiff to img's TIFFRepresentation()
        set bmp to current application's NSBitmapImageRep's imageRepWithData_(tiff)
        set imgData to bmp's representationUsingType_properties_(4, missing value)
    end if
end if
if imgData is missing value then
    error "Clipboard'da resim yok! Önce resmi kopyalayın (sağ tık → Resmi Kopyala)"
end if
set p to "/tmp/mini_disko.png"
imgData's writeToFile_atomically_(p, true)
return p
"""

result = subprocess.run(['osascript', '-e', script], capture_output=True, text=True)
if result.returncode != 0:
    print("❌ " + (result.stderr.strip() or "Clipboard'da resim bulunamadı"))
    print("   Çözüm: Mini Disko görselini sağ tık → 'Resmi Kopyala' yapın, sonra tekrar çalıştırın")
    sys.exit(1)
print("✅ Resim /tmp/mini_disko.png'ye kaydedildi")
PYEOF

echo "🚀 Firebase'e yükleniyor..."
node add_mini_disko.mjs /tmp/mini_disko.png
