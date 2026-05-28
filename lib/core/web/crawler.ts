// new release garudashield source
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

export async function crawlWebsite(
  url: string,
): Promise<{ text: string; finalUrl: string; cookiesString: string }> {
  try {
    const runPuppeteer = async (useTor: boolean) => {
      const puppeteer = require("puppeteer");
      const args = ["--no-sandbox", "--disable-setuid-sandbox"];

      const browser = await puppeteer.launch({ headless: "new", args });
      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      );
      await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });
      const html = await page.content();
      const finalUrl = page.url();
      const cookies = await page.cookies();
      const cookiesString = cookies
        .map((c: any) => `${c.name}=${c.value}`)
        .join("; ")
        .replace(/[;$|`<>\\"'\n\r\t$]/g, "");
      await browser.close();
      return { text: html, finalUrl, cookiesString };
    };
    let result = await runPuppeteer(true);
    if (
      result.text.includes("Vercel Security Checkpoint") ||
      result.text.includes("cf-browser-verification") ||
      result.text.includes("Just a moment...")
    ) {
      result = await runPuppeteer(false);
    }
    return result;
  } catch (e) {
    try {
      const { stdout: urlEff } = await execAsync(
        `curl -sL -w "%{url_effective}" -o /dev/null "${url}"`,
        { timeout: 7000 },
      );
      const { stdout: html } = await execAsync(
        `curl -sL "${url}"`,
        { timeout: 7000, maxBuffer: 1024 * 1024 * 10 },
      );
      return { text: html, finalUrl: urlEff.trim(), cookiesString: "" };
    } catch (err) {
      return { text: "", finalUrl: url, cookiesString: "" };
    }
  }
}

export async function getWhatwebData(
  domain: string,
  scanMode: string,
  cookiesString: string,
): Promise<string> {
  try {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    const whatwebCookie = cookiesString ? ` --cookie="${cookiesString}"` : "";
    const cmd =
      scanMode === "deep"
        ? `whatweb -U "${ua}"${whatwebCookie} -a 3 ${domain}`
        : `whatweb -U "${ua}"${whatwebCookie} ${domain}`;
    const { stdout } = await execAsync(cmd, {
      timeout: scanMode === "deep" ? 25000 : 10000,
    });
    return stdout.trim();
  } catch (e) {
    return "";
  }
}

export async function getArchiveData(domain: string): Promise<string> {
  try {
    const searchDomain = domain.replace("www.", "");
    const { stdout } = await execAsync(
      `curl -sL "https://archive.org/wayback/available?url=${searchDomain}"`,
      { timeout: 7000 },
    );
    const data = JSON.parse(stdout);
    if (
      data &&
      data.archived_snapshots &&
      data.archived_snapshots.closest &&
      data.archived_snapshots.closest.available
    ) {
      const snap = data.archived_snapshots.closest;
      const year = snap.timestamp.substring(0, 4);
      return `\n### 🏛️ Arsip Digital (Garuda Archive)\n✅ **Jejak Ditemukan**: Domain ini memiliki sejarah di Arsip Internet Global. Rekaman terdekat diambil pada tahun **${year}**.\n- 🔗 [Lihat Arsip Target (${year})](${snap.url})\n\n*(Catatan: Web penipu biasanya adalah domain baru yang tidak memiliki arsip sejarah)*\n`;
    } else {
      return `\n### 🏛️ Arsip Digital (Garuda Archive)\n⚠️ **Tidak Ada Jejak Arsip**: Domain ini belum pernah diindeks oleh Arsip Internet Global. Ini mengindikasikan bahwa ini adalah domain yang baru dibuat, yang merupakan salah satu ciri umum dari situs penipuan/phishing sementara.\n`;
    }
  } catch (e) {}
  return "";
}

