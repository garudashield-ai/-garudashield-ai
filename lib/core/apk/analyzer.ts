// new release garudashield source
import { exec } from "child_process";
import util from "util";
import fs from "fs";

const execAsync = util.promisify(exec);

export async function extractApkInfo(tmpPath: string, extractDir: string) {
  let aaptStdout = "ERROR_NO_AAPT";
  let stringsOut = "";
  let frameworkReport = "";

  try {
    const { stdout } = await execAsync(`aapt dump badging ${tmpPath}`, {
      timeout: 10000,
    });
    aaptStdout = stdout;
  } catch (e) {
    aaptStdout = "ERROR_NO_AAPT";
  }

  try {
    fs.mkdirSync(extractDir, { recursive: true });
    await execAsync(`unzip -q -o ${tmpPath} -d ${extractDir}`, {
      timeout: 20000,
    });

    const isExpo = fs.existsSync(`${extractDir}/assets/app.json`) || fs.existsSync(`${extractDir}/assets/ext.json`);
    const isReactNative = fs.existsSync(`${extractDir}/assets/index.android.bundle`);
    const isFlutter = fs.existsSync(`${extractDir}/lib/arm64-v8a/libapp.so`) || fs.existsSync(`${extractDir}/lib/armeabi-v7a/libapp.so`);

    if (isExpo) {
      frameworkReport = `ℹ️ **Framework**: Aplikasi ini dibangun menggunakan Expo (React Native).\n`;
    } else if (isReactNative) {
      frameworkReport = `ℹ️ **Framework**: Aplikasi ini dibangun menggunakan React Native biasa.\n`;
    } else if (isFlutter) {
      frameworkReport = `ℹ️ **Framework**: Aplikasi ini dibangun menggunakan Flutter (.dart).\n`;
    }

    try {
      const { stdout: grepResult } = await execAsync(
        `grep -r -E -o "https?://[a-zA-Z0-9./?=_-]+" ${extractDir} | sort | uniq || true`,
        { timeout: 25000 },
      );
      stringsOut += "Ditemukan URL/Endpoint:\n" + grepResult + "\n";
      
      const { stdout: keysResult } = await execAsync(
        `grep -r -E -o '"[a-zA-Z0-9_]+"\s*:' ${extractDir}/assets/index.android.bundle ${extractDir}/lib/*/libapp.so 2>/dev/null | head -n 100 || true`,
        { timeout: 15000 },
      );
      if (keysResult) {
        stringsOut += "Sampel struktur data (rekonstruksi API):\n" + keysResult + "\n";
      }
    } catch (err) {}
    
  } catch (extractErr) {
    try {
      const { stdout: stringsResult } = await execAsync(
        `strings ${tmpPath} | grep -E -i "http|https|wa.me|telegram" || true`,
        { timeout: 15000 },
      );
      stringsOut += stringsResult;
    } catch (e) {}
  }

  return { aaptStdout, stringsOut, frameworkReport };
}
