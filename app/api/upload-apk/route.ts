// new release garudashield source
import { checkApiRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import path from "path";
import os from "os";
import { writeFile, unlink } from "fs/promises";
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

export async function POST(request: Request) {
  const __ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (!checkApiRateLimit(__ip)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan (Rate Limit). Silakan coba lagi sebentar lagi." }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const sanitizedFileName = path.basename(file.name).replace(/[^a-zA-Z0-9.-_]/g, "");

    if (!sanitizedFileName.toLowerCase().endsWith(".apk")) {
      return NextResponse.json(
        { error: "File harus berformat .apk" },
        { status: 400 },
      );
    }

    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 100MB" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (
      buffer.length < 4 ||
      buffer[0] !== 0x50 ||
      buffer[1] !== 0x4b ||
      buffer[2] !== 0x03 ||
      buffer[3] !== 0x04
    ) {
      return NextResponse.json(
        {
          error:
            "File korup atau bukan APK asli (Gagal verifikasi Magic Bytes)",
        },
        { status: 400 },
      );
    }

    const tmpDir = os.tmpdir();
    const tmpFileName = `upload-${Date.now()}-${Math.floor(Math.random() * 1000)}.apk`;
    const tmpPath = path.join(tmpDir, tmpFileName);

    await writeFile(tmpPath, buffer);

    try {
      await execAsync(`aapt dump badging ${tmpPath}`, { timeout: 5000 });
    } catch (aaptError) {
      await unlink(tmpPath).catch(() => {});
      return NextResponse.json(
        {
          error:
            "File ditolak: Struktur APK tidak valid atau rusak (Gagal melewati verifikasi AAPT Keamanan Server).",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      tmpPath,
      fileName: sanitizedFileName,
    });
  } catch (error) {
    console.error("Upload Temp Error:", error);
    return NextResponse.json(
      { error: "Failed to upload to temp" },
      { status: 500 },
    );
  }
}
