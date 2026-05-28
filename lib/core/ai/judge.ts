// new release garudashield source
export async function evaluateWithAI(
  prompt: string,
  fallbackStatus: "safe" | "warning" | "danger",
): Promise<{ finalStatus: "safe" | "warning" | "danger"; aiOpinion: string }> {
  let aiOpinion = "";
  let finalStatus = fallbackStatus;

  try {
    const apiKey = process.env.ND_LABS_API_KEY;
    if (apiKey) {
      const response = await fetch(
        "https://app.nd-labs.dev/api/ai/copilot/chat",
        {
          method: "POST",
          headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            message: prompt,
            model: "gpt-5",
          }),
          signal: AbortSignal.timeout(60000),
        },
      );
      if (response.ok) {
        const data = await response.json();
        let aiText = data.text || data.result || data.response || "";

        if (aiText.includes("[FINAL_STATUS: BAHAYA]")) {
          finalStatus = "danger";
        } else if (aiText.includes("[FINAL_STATUS: MENCURIGAKAN]")) {
          finalStatus = "warning";
        } else if (aiText.includes("[FINAL_STATUS: AMAN]")) {
          finalStatus = "safe";
        }

        aiText = aiText.replace(/\[FINAL_STATUS:.*\]/gi, "").trim();
        aiOpinion = `## 🤖 Kesimpulan Akhir AI Garuda\n${aiText}\n\n---\n\n`;
      }
    }
  } catch (err) {
    console.error("AI Evaluation failed:", err);
  }

  return { finalStatus, aiOpinion };
}
