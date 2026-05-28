// new release garudashield source
export function analyzeWebHeuristics(
  url: string,
  finalUrl: string,
  htmlLower: string,
  crawlData: string,
  scanMode: string,
) {
  let score = 0;
  let heuristicBullets = "";

  const urlLower = url.toLowerCase();
  try {
    const originalUrlObj = new URL(url);
    const finalUrlObj = new URL(finalUrl);

    const getApex = (hostname: string) => {
      const parts = hostname.split(".");
      if (
        parts.length > 2 &&
        [
          "co",
          "com",
          "net",
          "org",
          "ac",
          "go",
          "sch",
          "my",
          "web",
          "desa",
        ].includes(parts[parts.length - 2])
      ) {
        return parts.slice(-3).join(".");
      }
      return parts.slice(-2).join(".");
    };

    if (originalUrlObj.hostname !== finalUrlObj.hostname) {
      if (getApex(originalUrlObj.hostname) === getApex(finalUrlObj.hostname)) {
        heuristicBullets += `- 🔀 **Redirect Internal**: URL dialihkan secara sah ke subdomain \`${finalUrlObj.hostname}\`.\n`;
      } else {
        score += 3;
        heuristicBullets += `- 🔀 **Redirect Lintas Domain (Anti-Tipu)**: 🚨 Hati-hati! URL \`${originalUrlObj.hostname}\` diam-diam dialihkan ke \`${finalUrlObj.hostname}\`. Scammer sering memakai tautan pendek/palsu untuk menyembunyikan domain asli mereka!\n`;
      }
    } else if (finalUrl !== url && finalUrl !== url + "/") {
      heuristicBullets += `- 🔀 **Redirect Internal (Anti-Tipu)**: URL awal dialihkan secara otomatis ke \`${finalUrl}\`.\n`;
    }
  } catch (e) {}

  if (
    urlLower.includes(".xyz") ||
    urlLower.includes(".top") ||
    urlLower.includes(".club") ||
    urlLower.includes("free") ||
    urlLower.includes("gratis")
  ) {
    score += 2;
    heuristicBullets += `- ⚠️ **URL Mencurigakan**: Menggunakan ekstensi domain murah atau kata pancingan (free/gratis).\n`;
  }
  if (
    urlLower.includes("-login") ||
    urlLower.includes("-verify") ||
    urlLower.includes("-secure") ||
    urlLower.includes("update-") ||
    urlLower.includes("recovery-")
  ) {
    score += 3;
    heuristicBullets += `- ⚠️ **Indikator Phishing (URL)**: Terdapat pola URL sensitif yang umum digunakan untuk mengelabui pengguna.\n`;
  }

  if (
    htmlLower.includes("<form") &&
    (htmlLower.includes("password") ||
      htmlLower.includes("sandi") ||
      htmlLower.includes("pin"))
  ) {
    heuristicBullets += `- ℹ️ **Info Akses**: Ditemukan form input kredensial (pastikan ini adalah situs resmi sebelum login).\n`;
  }
  if (
    htmlLower.includes("dana kaget") ||
    htmlLower.includes("hadiah") ||
    htmlLower.includes("klaim bonus") ||
    htmlLower.includes("pulsa gratis") ||
    htmlLower.includes("menang tunai")
  ) {
    score += 4;
    heuristicBullets += `- 🚫 **Indikator Scam (HTML)**: Ditemukan teks berbau penipuan (klaim bonus, dana kaget).\n`;
  }

  const judolKeywords = [
    "slot gacor",
    "maxwin",
    "rtp slot",
    "deposit pulsa",
    "judi online",
    "situs slot",
    "judi bola",
    "taruhan",
    "parlay",
    "togel",
    "casino online",
    "poker online",
    "sbobet",
    "situs judi",
    "pragmatic play",
    "judol",
    "ceme",
    "dominoqq",
  ];
  const judolRegex = new RegExp(`\\b(${judolKeywords.join("|")})\\b`, "i");
  if (judolRegex.test(htmlLower)) {
    score += 5;
    heuristicBullets += `- 🎰 **Indikator Judi Online (Judol)**: Ditemukan pola teks perjudian ilegal/slot online.\n`;
  }

  const malwareKeywords = [
    "coinhive.min.js",
    "cnhv.co",
    "coin-hive.com",
    "cryptoloot",
    "webminepool",
    "monerominer",
    "authedmine",
    "minr.js",
    "load.jsecoin.com",
    "projectpoi",
    "hashforcash",
    "browsermine",
    "jsecoin",
    "crypto-loot",
    "webassembly miner",
    "wasm miner",
    "eval(unescape(",
    "document.write(unescape(",
    "eval(function(p,a,c,k,e,d)",
    "eval(base64_decode(",
    "eval(gzinflate(",
    "String.fromCharCode(1",
    "document.write('\\x3c",
    "window['eval']",
    "setTimeout(unescape",
    "var _0x",
    "vbs dropper",
    "wscript.network",
    "adodb.stream",
    "scripting.filesystemobject",
    "shell.application",
    "wmic ",
    "powershell.exe",
    "cmd.exe /c",
    "b374k",
    "c99shell",
    "r57shell",
    "wso2",
    "indoxploit",
    "passthru(",
    "shell_exec(",
    "system(",
    "phpinfo()",
    "base64_decode($_post",
    "eval($_post",
    "assert($_post",
    "preg_replace('/.*/e'",
    "verify your account",
    "update your billing",
    "account suspended",
    "login to continue",
    "unusual sign-in activity",
    "confirm your identity",
    "validate your wallet",
    "seed phrase",
    "12 words",
    "private key",
    "plugindetect",
    "javadeploymenttoolkit",
    "shockwaveflash.shockwaveflash",
    "gondad",
    "blackhole exploit",
    "nuclear ek",
    "angler ek",
    "rig ek",
    "magnitude ek",
    "sweetorange",
    "neutrino ek",
    "fiesta ek",
    "document.write('<iframe",
    'width=0 height=0 style="hidden"',
    "visibility:hidden;display:none",
    "position:absolute;left:-9999px",
    "top:-9999px",
    "magento_core_api",
    "onestepcheckout",
    "firecheckout",
    "payment_info",
    "cc_number",
    "gate.php",
    "send_to_telegram",
    "telegram.org/bot",
    "tinyurl.com/",
    "t.co/",
    "goo.gl/",
    "ow.ly/",
    "ngrok.io",
    "localtunnel.me",
    "serveo.net",
    "pagekite.me",
    "pastebin.com/raw/",
    "hastebin.com/raw/",
    "ghostbin.com/paste/",
    "powershell -nop -w hidden",
    "certutil.exe -urlcache -split -f",
    "bitsadmin /transfer",
    "invoke-webrequest",
    "net.webclient",
    "downloadstring",
    "downloadfile",
    "iex (",
    "schtasks /create",
    "reg add",
    "wmic process call create",
  ];

  const hiddenIframeMatch =
    htmlLower.match(/<iframe[^>]+width=["']?0["']?[^>]*>/) ||
    htmlLower.match(/<iframe[^>]+height=["']?0["']?[^>]*>/) ||
    htmlLower.match(/<iframe[^>]+style=["'][^"']*display:\s*none/);

  let matchCount = 0;
  let matchedKeywords: string[] = [];
  malwareKeywords.forEach((kw) => {
    if (htmlLower.includes(kw)) {
      matchCount++;
      matchedKeywords.push(kw);
    }
  });
  if (matchCount >= 2 || hiddenIframeMatch) {
    score += 90;
    heuristicBullets += `- ☣️ **DETEKSI VIRUS/MALWARE LOKAL (90+ Signatures)**: Ditemukan injeksi skrip atau pola berbahaya secara lokal! Terdeteksi aktivitas: \`${matchedKeywords
      .slice(0, 3)
      .join(
        ", ",
      )}\` (atau iframe tersembunyi). Ini menunjukkan indikasi kuat eksploitasi web.\n`;
  }

  let leakBullets = "";
  let discoveredRoutes = "";
  try {
    const urlObj = new URL(url);
    const baseUrl = urlObj.origin;
    const sensitivePaths =
      scanMode === "deep"
        ? [
            "/.env",
            "/.git/config",
            "/backup.zip",
            "/config.php.bak",
            "/.env.backup",
            "/.env.example",
            "/.svn/entries",
            "/db.sql",
            "/database.sql",
            "/docker-compose.yml",
            "/nginx.conf",
          ]
        : ["/.env", "/.git/config", "/backup.zip", "/config.php.bak"];

    const routeRegex = /(?:href|src|action)=["'](\/[a-zA-Z0-9_.-][^"']*)["']/g;
    let extractedRoutes = [];
    let routeMatch;
    while ((routeMatch = routeRegex.exec(crawlData)) !== null) {
      extractedRoutes.push(routeMatch[1]);
    }
    extractedRoutes = [...new Set(extractedRoutes)].filter(
      (r) =>
        !r.endsWith(".css") &&
        !r.endsWith(".js") &&
        !r.endsWith(".png") &&
        !r.endsWith(".jpg") &&
        !r.endsWith(".jpeg") &&
        !r.endsWith(".gif") &&
        !r.endsWith(".svg") &&
        !r.endsWith(".ico") &&
        !r.endsWith(".woff") &&
        !r.endsWith(".woff2") &&
        r.length > 1,
    );

    if (extractedRoutes.length > 0) {
      discoveredRoutes += `\n### 🗺️ Rute Ditemukan dari HTML (Garuda Parser)\nSistem berhasil mengekstrak endpoint internal langsung dari kode sumber (HTML) halaman target:\n${extractedRoutes
        .slice(0, 15)
        .map((r) => `- \`${r}\``)
        .join("\n")}${
        extractedRoutes.length > 15
          ? `\n- ...dan ${extractedRoutes.length - 15} lainnya.`
          : ""
      }\n`;
    }
  } catch (e) {}

  let trackerBullets: string[] = [];
  const waMatches =
    htmlLower.match(/wa\.me\/[0-9]+/g) ||
    htmlLower.match(/api\.whatsapp\.com\/send\?phone=[0-9]+/g) ||
    crawlData.match(/\+62\s?8[0-9]{2,3}[-\s]?[0-9]{3,4}[-\s]?[0-9]{3,4}/g);
  if (waMatches) {
    const uniqueWa = [...new Set(waMatches)].map((w: any) => {
      let wStr = String(w);
      let cleanNumber = wStr
        .replace(/wa\.me\//i, "")
        .replace(/api\.whatsapp\.com\/send\?phone=/i, "")
        .replace(/[^0-9]/g, "");
      if (cleanNumber.startsWith("08"))
        cleanNumber = "628" + cleanNumber.substring(2);
      return `\`${wStr}\` ➔ [Cek Rekam Jejak (Garuda OSINT)](https://www.kredibel.co.id/search/?q=${cleanNumber})`;
    });
    trackerBullets.push(`- 🟢 **WhatsApp / No.HP**: ${uniqueWa.join(", ")}`);
  }
  const tgMatches = htmlLower.match(/t\.me\/[a-zA-Z0-9_]+/g);
  if (tgMatches)
    trackerBullets.push(
      `- ✈️ **Telegram**: \`${[...new Set(tgMatches)].join(", ")}\``,
    );

  const emailMatches = crawlData.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  );
  if (emailMatches) {
    const validEmails = [...new Set(emailMatches)].filter(
      (e: any) =>
        !String(e).includes("w3.org") &&
        !String(e).includes("sentry.io") &&
        !String(e).includes("example.com"),
    );
    if (validEmails.length > 0) {
      const emailLinks = validEmails.map(
        (e: any) =>
          `\`${String(e)}\` ➔ [Cek Reputasi Email (Garuda Profiler)](https://haveibeenpwned.com/account/${String(e)})`,
      );
      trackerBullets.push(
        `- 📧 **Email Terdeteksi**: ${emailLinks.join(", ")}`,
      );
    }
  }

  const gaMatches = crawlData.match(
    /(UA-\d+-\d+|G-[A-Z0-9]{7,10}|GTM-[A-Z0-9]{5,7})/g,
  );
  if (gaMatches)
    trackerBullets.push(
      `- 📊 **Tracking ID**: \`${[...new Set(gaMatches)].join(
        ", ",
      )}\` *(Dapat digunakan untuk Reverse-OSINT mencari keterkaitan dengan situs lain yang dimiliki pengelola)*`,
    );

  return {
    score,
    heuristicBullets,
    leakBullets,
    discoveredRoutes,
    trackerBullets,
  };
}
