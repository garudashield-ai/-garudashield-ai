// new release garudashield source
import fs from "fs";
import { promisify } from "util";
import { saveReport } from "@/lib/db";
import { extractApkInfo } from "./analyzer";
import { checkSteganography } from "./stego";
import { analyzeApkHeuristics } from "./heuristics";
import { extractApkOsint } from "./osint";
import { evaluateWithAI } from "../ai/judge";

const unlink = promisify(fs.unlink);
export const activeIPs = new Set<string>();

export async function runApkScan(
  reportId: string,
  fileName: string,
  tmpPath: string,
  isPrivate: boolean,
  ip: string,
) {
  const extractDir = `${tmpPath}_extracted`;
  try {
    const { aaptStdout, stringsOut, frameworkReport } = await extractApkInfo(
      tmpPath,
      extractDir,
    );
    const stegoReport = await checkSteganography(
      tmpPath,
      fileName.toLowerCase(),
    );

    const osintReport = extractApkOsint(stringsOut);
    let { score, nativeReport } = analyzeApkHeuristics(aaptStdout, fileName);

    if (
      stegoReport.includes("menyembunyikan") ||
      stegoReport.includes("menyamar")
    ) {
      score += 5;
    }

    let fallbackStatus: "safe" | "warning" | "danger" = "safe";
    if (score >= 90) {
      fallbackStatus = "danger";
    } else if (score >= 4) {
      fallbackStatus = "warning";
    } else {
      fallbackStatus = "safe";
      nativeReport += `- ✅ Tidak ditemukan anomali berisiko tinggi pada permission.\n`;
      nativeReport += `- ✅ Nama file tidak mencurigakan.\n`;
    }
    nativeReport = frameworkReport + "\n" + nativeReport;
    nativeReport += stegoReport;
    nativeReport += osintReport;

    const prompt = `Anda adalah AI Analitik Keamanan GarudaShield (Ultimate Judge). Anda bertugas meninjau bukti dari mesin heuristik dan OSINT untuk file APK: ${fileName}, lalu menarik KESIMPULAN FINAL apakah APK ini aman, mencurigakan, atau berbahaya (Malware/Scam).

Data Output AAPT & Heuristik:
${nativeReport}
${aaptStdout ? aaptStdout.substring(0, 1000) : ""}

Bukti OSINT & Tracker (URL dan Struktur Data):
${osintReport.substring(0, 800)}

Instruksi Khusus Rekonstruksi HTTPS & Login:
Berdasarkan bukti URL dan struktur data JSON/GraphQL di atas, cobalah analisis dan REKONSTRUKSI BAGAIMANA aplikasi ini berkomunikasi dengan servernya (khususnya untuk fitur login, pengiriman data, dsb). Jelaskan potensi format Request dan Response yang digunakan aplikasi (misalnya apakah mengirim data kredensial dalam bentuk plain text ke URL tertentu). Jika APK ini dibuat dengan Expo/React Native atau Flutter (.dart), perhatikan secara khusus endpoint yang terdeteksi karena framework ini sering mem-bypass proxy biasa.

PENTING: Gunakan kecerdasan Anda untuk menilai konteks sebenarnya. Jangan melabeli APK sebagai bahaya kecuali ada indikator malware/RAT/scam yang jelas. Jika hanya permission standar, anggap aman.

Berikan analisis komprehensif Anda (maksimal 3 paragraf) yang menyimpulkan semua data di atas beserta rekonstruksi API.
Di baris paling akhir dari respons Anda, Anda WAJIB memberikan satu baris persis seperti ini untuk sistem:
[FINAL_STATUS: AMAN] atau [FINAL_STATUS: MENCURIGAKAN] atau [FINAL_STATUS: BAHAYA]`;

    const { finalStatus, aiOpinion } = await evaluateWithAI(
      prompt,
      fallbackStatus,
    );

    let header = "";
    if (finalStatus === "danger") {
      header = `**STATUS: BAHAYA TINGGI (DANGER)**\nBerdasarkan konfirmasi AI dan Sistem, APK ini sangat berpotensi sebagai Malware pencuri data (RAT) atau Scam OTP.\n\n`;
    } else if (finalStatus === "warning") {
      header = `**STATUS: MENCURIGAKAN (WARNING)**\nBerdasarkan analisis gabungan, ditemukan beberapa kejanggalan pada APK ini. Harap berhati-hati.\n\n`;
    } else {
      header = `**STATUS: AMAN (SAFE)**\nSistem dan AI menyimpulkan bahwa APK ini aman dan tidak ditemukan indikator malware yang jelas.\n\n`;
    }

    const finalReport = `${header}${aiOpinion}${nativeReport}`;
    await saveReport({
      id: reportId,
      type: "apk",
      target: fileName,
      report: finalReport,
      timestamp: Date.now(),
      status: finalStatus,
      isPrivate,
    });
  } catch (error) {
    console.error("Analyze APK error:", error);
    await saveReport({
      id: reportId,
      type: "apk",
      target: fileName,
      report: "**STATUS: ERROR**\nPemindaian gagal.",
      timestamp: Date.now(),
      status: "warning",
      isPrivate,
    });
  } finally {
    if (tmpPath) {
      unlink(tmpPath).catch(console.error);
    }
    try {
      fs.rmSync(extractDir, { recursive: true, force: true });
    } catch (e) {}
    if (ip !== "unknown") {
      activeIPs.delete(ip);
    }
  }
}
