#!/bin/bash

echo "==============================================="
echo "🛡️  GarudaShield AI - Installation Script 🛡️"
echo "==============================================="
echo "Skrip ini akan menginstal semua dependensi sistem yang dibutuhkan oleh GarudaShield AI."
echo ""


if [ "$EUID" -ne 0 ]; then
  echo "⚠️ Harap jalankan skrip ini sebagai root (gunakan sudo)"
  exit 1
fi

echo "[1/4] Memperbarui repositori paket..."
apt-get update -y

echo ""
echo "[2/4] Menginstal dependensi jaringan dan intelijen (Web & OSINT)..."
apt-get install -y nmap curl whois tor proxychains4 jq

apt-get install -y whatweb || echo "Peringatan: whatweb gagal diinstal (bisa diabaikan atau instal manual)"

echo ""
echo "[3/4] Menginstal dependensi pembedah APK & Steganografi..."
apt-get install -y aapt apktool binwalk libimage-exiftool-perl

apt-get install -y steghide rubygems || true
gem install zsteg || true

echo ""
echo "[4/4] Menginstal OWASP ZAP (Pemindai Kerentanan Web)..."
if ! command -v zaproxy &> /dev/null; then
    apt-get install -y zaproxy || echo "Peringatan: zaproxy tidak ada di repositori APT standar. Anda mungkin perlu menginstalnya secara manual (menggunakan snap atau paket distribusi langsung)."
else
    echo "OWASP ZAP sudah terinstal."
fi

echo ""
echo "==============================================="
echo "✅ Instalasi dependensi sistem selesai!"
echo "==============================================="
echo "Langkah selanjutnya:"
echo "1. Pastikan layanan Tor berjalan: 'sudo systemctl start tor'"
echo "2. Jalankan instalasi dependensi Node.js: 'npm install'"
echo "3. Mulai aplikasi: 'npm run dev' atau gunakan PM2"
echo "==============================================="
