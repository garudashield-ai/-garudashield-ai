// new release garudashield source
import { checkApiRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { getReport } from "@/lib/db";
export async function GET(request: Request) {
  const __ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (!checkApiRateLimit(__ip)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan (Rate Limit). Silakan coba lagi sebentar lagi." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }
  const report = await getReport(id);
  if (report) {
    if (report.status === "processing") {
      return NextResponse.json({ status: "processing" });
    } else {
      let parsedReport = report.report;
      try {
        if (typeof parsedReport === "string") {
          parsedReport = JSON.parse(parsedReport);
        }
      } catch (e) {}
      
      return NextResponse.json({ 
        status: "done", 
        id: report.id, 
        data: parsedReport 
      });
    }
  }
  return NextResponse.json({ status: "processing" });
}
