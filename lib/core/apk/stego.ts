// new release garudashield source
import { exec } from "child_process";
import util from "util";
import fs from "fs";

const execAsync = util.promisify(exec);

export async function checkSteganography(
  tmpPath: string,
  fileNameLower: string,
): Promise<string> {
  let stegoReport = "";
  try {
    if (
      fileNameLower.endsWith(".png") ||
      fileNameLower.endsWith(".jpg") ||
      fileNameLower.endsWith(".jpeg")
    ) {
      stegoReport = `\n### 🕵️ Analisis Steganografi (Garuda Stego)\nFile APK ini menyamar sebagai gambar. Memeriksa muatan tersembunyi...\n`;
      try {
        const { stdout: exif } = await execAsync(`exiftool ${tmpPath}`, {
          timeout: 5000,
        });
        if (exif.includes("Zip Archive") || exif.includes("Android Package")) {
          stegoReport += `- 🚨 **CRITICAL**: ExifTool mendeteksi struktur APK di dalam metadata gambar!\n`;
        }
      } catch (e) {}

      try {
        const { stdout: binwalk } = await execAsync(`binwalk ${tmpPath}`, {
          timeout: 10000,
        });
        if (binwalk.includes("Zip archive data")) {
          stegoReport += `- 🚨 **CRITICAL**: Binwalk mendeteksi *archive* tersembunyi. Ini positif *Polyglot Malware* (APK menyembunyikan diri sebagai gambar).\n`;
        }
      } catch (e) {}
    }
  } catch (e) {
    stegoReport = `\n- ℹ️ **Sistem:** Gagal menjalankan pemindaian Steganografi.\n`;
  }
  return stegoReport;
}
