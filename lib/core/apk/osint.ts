// new release garudashield source
export function extractApkOsint(stringsOut: string): string {
  let trackerBullets: string[] = [];
  let osintReport = "";

  if (stringsOut) {
    const httpMatches = stringsOut.match(/https?:\/\/[a-zA-Z0-9.-_:/]+/g);
    if (httpMatches) {
      const uniqueUrls = [...new Set(httpMatches)].filter(
        (u) =>
          !u.includes("schemas.android.com") &&
          !u.includes("w3.org") &&
          !u.includes("google.com") &&
          !u.includes("facebook.com") &&
          !u.includes("reactnative.dev") &&
          !u.includes("expo.dev") &&
          !u.includes("github.com"),
      );

      if (uniqueUrls.length > 0) {
        trackerBullets.push(`- 🌐 **Endpoint API / Web Potensial**:`);
        let apiSimulation = "";
        
        uniqueUrls.slice(0, 10).forEach((url: string, idx: number) => {
          trackerBullets.push(`  - \`${url}\``);
          try {
            const parsedUrl = new URL(url);
            let method = "GET";
            let payload = "";
            let responseStr = '{\n  "status": "success",\n  "data": {}\n}';

            if (url.includes("login") || url.includes("auth") || url.includes("signin")) {
              method = "POST";
              payload = '{\n  "username": "user_input",\n  "password": "***"\n}';
              responseStr = '{\n  "token": "eyJhbGciOiJIUzI1NiIsInR5c...",\n  "user_id": "123"\n}';
            } else if (url.includes("upload") || url.includes("submit") || url.includes("post")) {
              method = "POST";
              payload = '{\n  "file": "<binary_data>",\n  "metadata": "{}"\n}';
            } else if (url.includes("api/v") || url.includes("graphql")) {
               method = "POST/GET";
               payload = '{\n  "query": "query { ... }"\n}';
            }

            apiSimulation += `**Endpoint ${idx + 1}:** \`${url}\`\n`;
            if (payload) {
              apiSimulation += `\`\`\`http\n${method} ${parsedUrl.pathname || "/"} HTTP/1.1\nHost: ${parsedUrl.hostname}\nContent-Type: application/json\nUser-Agent: Garuda/1.0\n\n${payload}\n\`\`\`\n`;
            } else {
              apiSimulation += `\`\`\`http\n${method} ${parsedUrl.pathname || "/"} HTTP/1.1\nHost: ${parsedUrl.hostname}\nUser-Agent: Garuda/1.0\n\`\`\`\n`;
            }
            apiSimulation += `*Potensi Respons Server:*\n\`\`\`json\n${responseStr}\n\`\`\`\n\n`;
          } catch (e) {}
        });
        
        if (apiSimulation) {
           trackerBullets.push(`\n*Rekonstruksi Endpoint (Simulasi Statis):*\n` + apiSimulation);
        }
      }
    }

    const jsonKeys = stringsOut.match(/"[a-zA-Z0-9_]+"\s*:/g);
    if (jsonKeys) {
        const uniqueKeys = [...new Set(jsonKeys.map(k => k.replace(/["\s:]/g, '')))].slice(0, 15);
        if (uniqueKeys.length > 0) {
           trackerBullets.push(`- 🧩 **Struktur Data Terdeteksi (Model/Payload)**: \`${uniqueKeys.join(", ")}\``);
        }
    }

    const waMatches =
      stringsOut.match(/wa\.me\/[0-9]+/g) ||
      stringsOut.match(/api\.whatsapp\.com\/send\?phone=[0-9]+/g) ||
      stringsOut.match(/\+62\s?8[0-9]{2,3}[-\s]?[0-9]{3,4}[-\s]?[0-9]{3,4}/g);
    if (waMatches) {
      const uniqueWa = [...new Set(waMatches)].slice(0, 3).map((w: any) => {
        let wStr = String(w);
        let cleanNumber = wStr
          .replace(/wa\.me\//i, "")
          .replace(/api\.whatsapp\.com\/send\?phone=/i, "")
          .replace(/[^0-9]/g, "");
        if (cleanNumber.startsWith("08"))
          cleanNumber = "628" + cleanNumber.substring(2);
        return `\`${wStr}\` ➔ [Cek Laporan Penipuan (Garuda OSINT)](https://www.kredibel.co.id/search/?q=${cleanNumber})`;
      });
      trackerBullets.push(`- 🟢 **WhatsApp / No.HP**: ${uniqueWa.join(", ")}`);
    }

    const tgMatches = stringsOut.match(
      /api\.telegram\.org\/bot[0-9]+:[a-zA-Z0-9_-]+/g,
    );
    if (tgMatches) {
      trackerBullets.push(
        `- ✈️ **Telegram Bot Token**: \`${[...new Set(tgMatches)].slice(0, 2).join(", ")}\``,
      );
    }

    const emailMatches = stringsOut.match(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    );
    if (emailMatches) {
      const validEmails = [...new Set(emailMatches)].filter(
        (e: any) =>
          !String(e).includes("android.com") &&
          !String(e).includes("google.com") &&
          !String(e).includes("apache.org") &&
          !String(e).includes("w3.org") &&
          !String(e).includes("example.com"),
      );
      if (validEmails.length > 0) {
        const emailLinks = validEmails
          .slice(0, 3)
          .map(
            (e: any) =>
              `\`${String(e)}\` ➔ [Cek Reputasi Email (Garuda Profiler)](https://haveibeenpwned.com/account/${String(e)})`,
          );
        trackerBullets.push(
          `- 📧 **Email Terdeteksi**: ${emailLinks.join(", ")}`,
        );
      }
    }

    if (trackerBullets.length > 0) {
      osintReport = `\n### 🔍 Analisis Endpoint & OSINT (Garuda Tracker)\nSistem mengekstrak jejak digital dan endpoint dari dalam aplikasi (classes.dex / bundle / .so):\n${trackerBullets.join("\n")}\n`;
    } else {
      osintReport = `\n### 🔍 Analisis Endpoint & OSINT (Garuda Tracker)\n- ✅ Tidak ditemukan hardcoded URL, nomor WhatsApp, atau Token Telegram di dalam source code aplikasi.\n`;
    }
  }

  return osintReport;
}
