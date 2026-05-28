Write-Host "==============================================="
Write-Host "🛡️  GarudaShield AI - Windows Install Script 🛡️"
Write-Host "==============================================="
Write-Host "Skrip ini akan menginstal Node.js dan dependensi via Winget/Choco"

# Check for Administrator privileges
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-Not $isAdmin) {
    Write-Warning "Harap jalankan PowerShell sebagai Administrator!"
    exit
}

Write-Host "`n[1/3] Menginstal alat dasar (Node.js, Git)..."
winget install -e --id OpenJS.NodeJS
winget install -e --id Git.Git

Write-Host "`n[2/3] Menginstal Nmap & Tor..."
winget install -e --id Insecure.Nmap
winget install -e --id TorProject.TorBrowser

Write-Host "`n[3/3] Instalasi ZAP & Apktool memerlukan setup manual atau WSL."
Write-Host "Sangat direkomendasikan menggunakan WSL (Windows Subsystem for Linux) (Ubuntu) untuk pengalaman terbaik."

Write-Host "`n==============================================="
Write-Host "✅ Selesai! Silakan jalankan 'npm install' lalu 'npm run dev'"
Write-Host "==============================================="
