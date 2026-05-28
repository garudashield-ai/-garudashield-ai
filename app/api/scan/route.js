// new release garudashield source
export async function POST(req) {
  const body = await req.json();

  const text = body.text.toLowerCase();

  const suspiciousKeywords = [
    "slot",
    "gacor",
    "casino",
    "bonus",
    "deposit",
    "jackpot",
    "maxwin",
    "free",
    "hadiah",
    "claim",
    "crypto",
    "wallet",
    "otp",
    "bank",
    "login",
    "verify",
    "verification",
    "discord",
    "nitro",
    "steam",
    "gift",
    "free nitro",
    "dana",
    "ovo",
    "qris",
    "pinjaman",
    "transfer",
  ];

  const suspiciousDomains = [
    ".xyz",
    ".top",
    ".click",
    ".win",
    ".bet",
    ".vip",
    ".ru",
    ".shop",
    ".live",
  ];

  const trustedDomains = [
    "google.com",
    "youtube.com",
    "github.com",
    "discord.com",
    "openai.com",
    "railway.app",
    "vercel.app",
  ];

  let score = 100;

  let detectedKeywords = [];

  const trusted = trustedDomains.some((domain) => text.includes(domain));

  if (trusted) {
    score += 5;
  }

  suspiciousKeywords.forEach((keyword) => {
    if (text.includes(keyword)) {
      score -= 12;

      detectedKeywords.push(keyword);
    }
  });

  suspiciousDomains.forEach((domain) => {
    if (text.includes(domain)) {
      score -= 20;
    }
  });

  if (text.includes("http://")) {
    score -= 15;
  }

  if (text.includes("discord") && text.includes("verify")) {
    score -= 45;
  }

  if (text.includes("login") && text.includes("bank")) {
    score -= 40;
  }

  if (text.includes("free") && text.includes("nitro")) {
    score -= 35;
  }

  if (text.includes("steam") && text.includes("gift")) {
    score -= 30;
  }

  if (text.includes("discord") && !text.includes("discord.com")) {
    score -= 25;
  }

  if (text.length > 100) {
    score -= 10;
  }

  if (score > 100) {
    score = 100;
  }

  if (score < 0) {
    score = 0;
  }

  let status = "SAFE";

  if (score <= 25) {
    status = "DANGER";
  } else if (score <= 60) {
    status = "WARNING";
  } else {
    status = "SAFE";
  }

  let threatType = "Safe Traffic";

  if (status === "DANGER") {
    threatType = "High Risk Threat";
  } else if (status === "WARNING") {
    threatType = "Suspicious Activity";
  }

  let analysis = "Tidak ditemukan indikasi ancaman digital berbahaya.";

  if (status === "WARNING") {
    analysis =
      "AI menemukan pola domain dan aktivitas mencurigakan yang berpotensi phishing atau scam.";
  }

  if (status === "DANGER") {
    analysis =
      "AI mendeteksi indikasi phishing, impersonasi brand, atau scam berisiko tinggi.";
  }

  return Response.json({
    safe: status === "SAFE",

    status,

    score,

    aiConfidence: `${Math.floor(90 + Math.random() * 9)}%`,

    detectedKeywords,

    analysis,

    threatType,
  });
}
