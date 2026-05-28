// new release garudashield source
import { checkApiRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
export async function POST(request: Request) {
  const __ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (!checkApiRateLimit(__ip)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan (Rate Limit). Silakan coba lagi sebentar lagi." }, { status: 429 });
  }

  try {
    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 },
      );
    }
    const compiledMessage =
      messages
        .map(
          (msg: any) =>
            `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`,
        )
        .join("\n\n") + "\n\nAI:";
    const apiKey = process.env.ND_LABS_API_KEY;
    if (!apiKey) {
      console.error("ND_LABS_API_KEY is not defined");
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
    const response = await fetch(
      "https://app.nd-labs.dev/api/ai/copilot/chat",
      {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: compiledMessage,
          model: "gpt-5",
        }),
      },
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from AI API:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch AI response" },
        { status: response.status },
      );
    }
    const data = await response.json();
    return NextResponse.json({
      ...data,
      response: data.text || data.result || data.response,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
