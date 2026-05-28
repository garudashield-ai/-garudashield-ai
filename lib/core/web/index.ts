// new release garudashield source
import { saveReport } from "@/lib/db";
import { getWhoisData, getDnsSubdomains } from "./dns";
import {
  checkActiveUrl,
  getNmapData,
  getSslData,
  getHeaderData,
} from "./network";
import {
  crawlWebsite,
  getArchiveData,
  getDarkWebData,
  getWhatwebData,
} from "./crawler";
import { runZapScan } from "./zap";
import { analyzeWebHeuristics } from "./heuristics";
import { evaluateWithAI } from "../ai/judge";

export const activeIPs = new Set<string>();

export async function runBackgroundScan(
  url: string,
  reportId: string,
  isPrivate: boolean,
  ip: string,
  useVulnScan: boolean,
  depth: number = 1,
) {
  try {
    await performScan(url, reportId, isPrivate, useVulnScan, depth);
  } catch (error) {
    console.error("Background scan error:", error);
    try {
      await saveReport({
        id: reportId,
        type: "web",
        target: url,
        report: `**STATUS: ERROR**\nPemindaian gagal karena kesalahan internal server. Silakan coba lagi.\n\nDetail: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: Date.now(),
        status: "warning",
        isPrivate: Boolean(isPrivate),
      });
    } catch (e) {
      console.error("Failed to save error report:", e);
    }
  } finally {
    if (ip !== "unknown") {
      activeIPs.delete(ip);
    }
  }
}

async function performScan(
  url: string,
  reportId: string,
  isPrivate: boolean,
  useVulnScan: boolean,
  depth: number = 1,
) {
  const urlObj = new URL(url);
  const domain = urlObj.hostname;

  const isActive = await checkActiveUrl(url, domain);
  if (!isActive) {
    await saveReport({
      id: reportId,
      type: "web",
      target: url,
      report: `**STATUS: OFFLINE (TIDAK AKTIF)**\n\nTarget URL \`${url}\` saat ini tidak dapat diakses atau sudah mati. Domain mungkin tidak terdaftar (DNS tidak ditemukan), server sedang down, atau telah dihapus/diblokir oleh penyedia layanan.\n\nSitus penipuan yang sudah tidak aktif tidak dapat dipindai lebih lanjut, namun dapat dianggap **Aman** karena tidak lagi membahayakan pengunjung.`,
      timestamp: Date.now(),
      status: "safe",
      isPrivate: Boolean(isPrivate),
    });
    return;
  }

  const crawlResult = await crawlWebsite(url);
  const cookiesString = crawlResult.cookiesString || "";
  const crawlData = crawlResult.text || "";
  const finalUrl = crawlResult.finalUrl || url;

  const derivedScanMode = depth >= 3 ? "deep" : "standard";

  const [
    whoisData,
    nmapData,
    sslData,
    dnsReport,
    archiveReport,
    darkWebReport,
    whatwebData,
    headerData,
    zapData,
  ] = await Promise.all([
    getWhoisData(domain),
    getNmapData(domain, derivedScanMode),
    getSslData(urlObj, domain),
    getDnsSubdomains(domain, derivedScanMode),
    getArchiveData(domain),
    getDarkWebData(domain),
    getWhatwebData(domain, derivedScanMode, cookiesString),
    getHeaderData(url, cookiesString),
    runZapScan(url, reportId, useVulnScan, depth, cookiesString, domain),
  ]);

  const heuristics = analyzeWebHeuristics(
    url,
    finalUrl,
    crawlData.toLowerCase(),
    crawlData,
    derivedScanMode,
  );
  let {
    score,
    heuristicBullets,
    leakBullets,
    discoveredRoutes,
    trackerBullets,
  } = heuristics;

  let fallbackStatus: "safe" | "warning" | "danger" = "safe";
  if (score >= 4) {
    fallbackStatus = "danger";
  } else if (score >= 2) {
    fallbackStatus = "warning";
  } else {
    fallbackStatus = "safe";
    heuristicBullets += `- ✅ Struktur URL terlihat normal.\n`;
    heuristicBullets += `- ✅ Tidak ditemukan anomali teks scam atau form berbahaya yang mencolok.\n`;
    heuristicBullets += `- ✅ Tidak ditemukan file sensitif yang bocor (.env, .git) dalam pemindaian standar.\n`;
  }

  let nativeReport = `## Analisis Bukti Sistem (Garuda Heuristik & OSINT)\n\n${heuristicBullets}${leakBullets}\n`;

  if (discoveredRoutes) {
    nativeReport += discoveredRoutes;
  }

  if (trackerBullets.length > 0) {
    nativeReport += `### 🔍 Analisis Pelacak & Kontak (Garuda Tracker & Checker)\nSistem berhasil mengekstrak ID pelacak atau kontak dari kode situs. Data ini dapat diverifikasi lebih lanjut terkait rekam jejak pemilik/pengelola situs:\n${trackerBullets.join("\n")}\n\n`;
  } else if (fallbackStatus === "danger" || fallbackStatus === "warning") {
    nativeReport += `### 🔍 Analisis Pelacak & Kontak (Garuda Tracker)\nSistem telah menyisir kode sumber situs untuk mencari jejak kontak atau analitik (No HP, WA, Telegram, Email), namun entitas pembuat situs menyembunyikannya.\n\n`;
  }
  nativeReport += `## Modul Reconnaissance (Garuda Heuristics)\n\n`;

  if (headerData) {
    nativeReport += `### Analisis Header HTTP (Garuda Inspector)\n\`\`\`text\n${headerData.substring(0, 500)}\n\`\`\`\n`;
  }
  if (
    whoisData &&
    whoisData !== "Data WHOIS tidak tersedia atau waktu pencarian habis."
  ) {
    const cleanWhois = whoisData
      .split("\n")
      .filter(
        (line) =>
          line.trim() !== "" &&
          !line.startsWith("%") &&
          !line.startsWith(">>>") &&
          !line.toLowerCase().includes("terms of use"),
      )
      .slice(0, 15)
      .join("\n");
    nativeReport += `### Ekstraksi Registri Domain (Garuda WHOIS)\n\`\`\`text\n${cleanWhois}\n\`\`\`\n`;
  }
  if (dnsReport) nativeReport += dnsReport;
  if (zapData)
    nativeReport += `### Pemindaian Kerentanan Lanjutan (Garuda Scanner)\n${zapData}\n\n`;
  if (whatwebData) {
    const cleanWhatweb = whatwebData.replace(/\x1b\[[0-9;]*m/g, "");
    const formattedWhatweb = cleanWhatweb
      .split("\n")
      .map((line) => {
        const parts = line.split(", ");
        if (parts.length > 1)
          return (
            parts[0] +
            "\n  - " +
            parts
              .slice(1)
              .map((p) => p.replace(/^([^\[]+)\[(.*)\]$/, "$1: $2"))
              .join("\n  - ")
          );
        return line;
      })
      .join("\n\n");
    nativeReport += `### Analisis Fingerprint Server (Garuda Engine)\n\`\`\`text\n${formattedWhatweb}\n\`\`\`\n`;
    if (cleanWhatweb.toLowerCase().includes("wordpress"))
      nativeReport += `- ℹ️ **CMS**: Situs ini terdeteksi menggunakan WordPress.\n`;
  }
  if (nmapData) {
    const openPorts = nmapData
      .split("\n")
      .filter((line) => line.includes("open"))
      .map((line) => line.replace(/Nmap/g, "Scanner"))
      .join("\n");
    if (openPorts)
      nativeReport += `\n### Pemindaian Celah Port (Garuda Scanner)\n\`\`\`text\n${openPorts}\n\`\`\`\n`;
  }
  if (sslData) {
    nativeReport += `\n### Analisis Sertifikat Enkripsi (Garuda SSL)\n\`\`\`text\n${sslData}\n\`\`\`\n`;
    if (
      sslData.toLowerCase().includes("let's encrypt") ||
      sslData.toLowerCase().includes("zerossl")
    )
      nativeReport += `- ℹ️ **SSL Info**: Menggunakan SSL gratis (Let's Encrypt / ZeroSSL), umum digunakan namun sering disalahgunakan oleh situs phishing.\n`;
  }
  if (!whatwebData && !nmapData && !sslData && !headerData) {
    nativeReport += `- ℹ️ **Sistem:** Modul pemindaian lanjut tidak berjalan di server. Analisis menggunakan mode standar.\n`;
  }
  if (darkWebReport) nativeReport += darkWebReport;
  if (archiveReport) nativeReport += archiveReport;

  const promptOpinion = `Anda adalah AI Analitik Keamanan GarudaShield (Ultimate Judge). Anda bertugas meninjau bukti dari mesin heuristik dan OSINT, lalu menarik KESIMPULAN FINAL apakah situs ${url} aman, mencurigakan, atau berbahaya.
      
Bukti Heuristik & URL:
${heuristicBullets}

Bukti OSINT & Rute:
${discoveredRoutes.substring(0, 500)}
${trackerBullets.join("\n").substring(0, 500)}

PENTING: Mesin heuristik kadang terlalu sensitif (false positive) terhadap situs sah. Gunakan kecerdasan Anda untuk menilai konteks sebenarnya. JANGAN melabeli situs sebagai bahaya kecuali ada indikator scam/phishing/judol/malware yang jelas.

Berikan analisis komprehensif Anda (maksimal 3-4 paragraf) yang menyimpulkan semua data di atas.
Di baris paling akhir dari respons Anda, Anda WAJIB memberikan satu baris persis seperti ini untuk sistem:
[FINAL_STATUS: AMAN] atau [FINAL_STATUS: MENCURIGAKAN] atau [FINAL_STATUS: BAHAYA]`;

  const { finalStatus, aiOpinion } = await evaluateWithAI(
    promptOpinion,
    fallbackStatus,
  );

  let header = "";
  if (finalStatus === "danger") {
    header = `**STATUS: BAHAYA TINGGI (DANGER)**\nBerdasarkan konfirmasi AI dan Sistem, situs ini sangat berpotensi sebagai alat penipuan, perjudian ilegal (judol), malware, atau phishing.\n\n`;
  } else if (finalStatus === "warning") {
    header = `**STATUS: MENCURIGAKAN (WARNING)**\nBerdasarkan analisis gabungan, ditemukan beberapa kejanggalan pada situs ini. Harap berhati-hati.\n\n`;
  } else {
    header = `**STATUS: AMAN (SAFE)**\nSistem dan AI menyimpulkan bahwa situs ini aman dan tidak ditemukan indikator bahaya yang jelas.\n\n`;
  }

  const finalReport = `${header}${aiOpinion}${nativeReport}`;

  await saveReport({
    id: reportId,
    type: "web",
    target: url,
    report: finalReport,
    timestamp: Date.now(),
    status: finalStatus,
    isPrivate: Boolean(isPrivate),
  });
}
