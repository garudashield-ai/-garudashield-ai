// new release garudashield source
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

export async function getNmapData(
  domain: string,
  scanMode: string,
): Promise<string> {
  try {
    const cmd =
      scanMode === "deep"
        ? `nmap -T4 -p- -A --host-timeout 120s --max-retries 2 ${domain}`
        : `nmap -T4 -F --host-timeout 15s --max-retries 1 ${domain}`;
    const { stdout } = await execAsync(cmd, {
      timeout: scanMode === "deep" ? 130000 : 15000,
    });
    return stdout;
  } catch (e) {
    return "";
  }
}

export async function getSslData(urlObj: URL, domain: string): Promise<string> {
  if (urlObj.protocol === "https:") {
    try {
      const { stdout } = await execAsync(
        `echo | openssl s_client -servername ${domain} -connect ${domain}:443 2>/dev/null | openssl x509 -noout -issuer -subject -dates`,
        { timeout: 5000 },
      );
      return stdout.trim();
    } catch (e) {
      return "";
    }
  }
  return "";
}

export async function getHeaderData(
  url: string,
  cookiesString: string,
): Promise<string> {
  try {
    const curlCookie = cookiesString ? ` -b "${cookiesString}"` : "";
    const { stdout } = await execAsync(
      `curl -I -L -s -m 5 --socks5-hostname 127.0.0.1:9050${curlCookie} "${url}"`,
    );
    return stdout.trim();
  } catch (e) {
    return "";
  }
}

export async function checkActiveUrl(
  url: string,
  domain: string,
): Promise<boolean> {
  let isActive = false;
  try {
    const dns = require("dns").promises;
    const records = await dns.resolve(domain);
    if (records && records.length > 0) isActive = true;
  } catch (e) {}

  if (!isActive) {
    try {
      const { stdout: curlTor } = await execAsync(
        `curl -sL -I -m 10 --socks5-hostname 127.0.0.1:9050 "${url}"`,
        { timeout: 12000 },
      );
      if (curlTor.toLowerCase().includes("http/")) isActive = true;
    } catch (e) {}
  }

  if (!isActive) {
    try {
      const { stdout: curlClear } = await execAsync(
        `curl -sL -I -m 10 "${url}"`,
        { timeout: 12000 },
      );
      if (curlClear.toLowerCase().includes("http/")) isActive = true;
    } catch (e) {}
  }

  return isActive;
}
