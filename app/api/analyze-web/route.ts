// new release garudashield source
import { checkApiRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { saveReport, checkRateLimit, updateRateLimit } from "@/lib/db";
import { activeIPs, runBackgroundScan } from "@/lib/core/web";
import dns from "dns/promises";

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
          "Sabar ya! Permintaan pemindaian Anda sebelumnya masih diproses. Tunggu sampai selesai.",
      },
      { status: 429 },
    );
  }
  const {
    url,
    id: rawId,
    isPrivate = false,
    useVulnScan = false,
    depth = 1,
  } = await request.json();

  const id = rawId ? String(rawId).replace(/[^a-zA-Z0-9_-]/g, "") : undefined;

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    
    const dangerousUrlChars = /[;$|`<>\\"'\n\r\t$]/;
    if (dangerousUrlChars.test(url)) {
      throw new Error("Dangerous characters in URL");
    }

    const validHostname = /^[a-zA-Z0-9.-]+$/;
    if (!validHostname.test(hostname)) {
      throw new Error("Invalid hostname structure");
    }

    
    if (hostname.includes('nd-labs.id') || hostname.includes('nd-labs.dev')) {
      return NextResponse.json({
        error: "🎉 KEJUTAN! Anda mencoba memindai domain pencipta (ND-Labs). Sistem GarudaShield menolak memindai tuannya sendiri! 😎",
      }, { status: 403 });
    }

    
    const isPrivateString = (host: string) => {
      return (
        host === "localhost" ||
        host.startsWith("127.") ||
        host.startsWith("192.168.") ||
        host.startsWith("10.") ||
        host.startsWith("169.254.") || 
        host.startsWith("0.") ||
        host.includes("::") ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
      );
    };

    if (isPrivateString(hostname)) {
      return NextResponse.json({
        error: "Aduhai, mau ngapain scan IP lokal/localhost? Sistem menolak permintaan ini karena alasan keamanan jaringan internal (SSRF Protection).",
      }, { status: 403 });
    }

    
    try {
      const { address } = await dns.lookup(hostname);
      if (isPrivateString(address)) {
        return NextResponse.json({
          error: "Domain ini me-resolve ke IP privat/internal. Pemindaian ditolak demi keamanan (SSRF Protection).",
        }, { status: 403 });
      }
    } catch (dnsErr) {
      return NextResponse.json({ error: "Gagal me-resolve domain target." }, { status: 400 });
    }

  } catch (e) {
    return NextResponse.json({ error: "URL tidak valid atau memiliki struktur berbahaya." }, { status: 400 });
  }

  if (depth >= 4) {
    const isAllowed = await checkRateLimit(ip);
    if (!isAllowed) {
      return NextResponse.json(
        {
          error: "Batas Limit: Mode Deep Scan tingkat tinggi (Depth 4/5) hanya diizinkan 1 minggu sekali untuk mencegah beban server berlebih.",
        },
        { status: 429 },
      );
    }
    await updateRateLimit(ip);
  }

  const reportId =
    id || Date.now().toString() + Math.floor(Math.random() * 1000);

  await saveReport({
    id: reportId,
    type: "web",
    target: url,
    report: "",
    timestamp: Date.now(),
    status: "processing",
    isPrivate,
  });

  if (ip !== "unknown") {
    activeIPs.add(ip);
  }

  runBackgroundScan(url, reportId, isPrivate, ip, useVulnScan, depth);

  return NextResponse.json({
    success: true,
    id: reportId,
    status: "processing",
  });
}
