// new release garudashield source
import { checkApiRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { saveReport } from "@/lib/db";
import { activeIPs, runApkScan } from "@/lib/core/apk";

export async function POST(request: Request) {
  const __ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (!checkApiRateLimit(__ip)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan (Rate Limit). Silakan coba lagi sebentar lagi." }, { status: 429 });
  }

  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (ip !== "unknown" && activeIPs.has(ip)) {
    return NextResponse.json(
      {
        error:
          "Sabar ya! Permintaan pemindaian APK Anda sebelumnya masih diproses.",
      },
      { status: 429 },
    );
  }

  const { fileName, id: rawId, isPrivate = false, tmpPath } = await request.json();
  const id = rawId ? String(rawId).replace(/[^a-zA-Z0-9_-]/g, "") : undefined;

  if (!fileName || !tmpPath) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const reportId =
    id || Date.now().toString() + Math.floor(Math.random() * 1000);

  await saveReport({
    id: reportId,
    type: "apk",
    target: fileName,
    report: "",
    timestamp: Date.now(),
    status: "processing",
    isPrivate,
  });

  if (ip !== "unknown") {
    activeIPs.add(ip);
  }

  runApkScan(reportId, fileName, tmpPath, isPrivate, ip);

  return NextResponse.json({
    success: true,
    id: reportId,
    status: "processing",
  });
}
