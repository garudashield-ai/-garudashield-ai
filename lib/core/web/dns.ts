// new release garudashield source
import { exec } from "child_process";
import util from "util";
import dns from "dns";

const execAsync = util.promisify(exec);

export async function getWhoisData(domain: string): Promise<string> {
  let data = "";
  try {
    let tryWhois = async (dom: string) => {
      const { stdout } = await execAsync(`whois ${dom}`, { timeout: 5000 });
      if (stdout.includes("No match for") || stdout.includes("NOT FOUND"))
        throw new Error("Not found");
      return stdout;
    };
    try {
      data = await tryWhois(domain);
    } catch (err) {
      const parts = domain.split(".");
      if (parts.length > 2) {
        let apex = parts.slice(-2).join(".");
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
          apex = parts.slice(-3).join(".");
        }
        try {
          data = await tryWhois(apex);
        } catch (e) {
          data = "Data WHOIS tidak tersedia atau waktu pencarian habis.";
        }
      } else {
        data = "Data WHOIS tidak tersedia atau waktu pencarian habis.";
      }
    }
  } catch (e) {
    data = "Data WHOIS tidak tersedia atau waktu pencarian habis.";
  }
  return data;
}

export async function getDnsSubdomains(
  domain: string,
  scanMode: string,
): Promise<string> {
  try {
    const searchDomain = domain.replace("www.", "");
    let isWildcard = false;
    let wildcardIp = "";
    
    try {
      const randomSub = `gs-wildcard-test-${Math.floor(Math.random() * 100000)}.${searchDomain}`;
      const records = await dns.promises.resolve4(randomSub);
      if (records && records.length > 0) {
        isWildcard = true;
        wildcardIp = records[0];
      }
    } catch (e) {}

    const foundSubdomains: string[] = [];

    if (isWildcard) {
      return `### 🌐 Pemetaan Infrastruktur (Garuda DNS Intel)\nDomain ini menggunakan **Wildcard DNS** (\`*.${searchDomain}\`), di mana semua subdomain akan otomatis terhubung ke IP \`${wildcardIp}\`. Pencarian subdomain spesifik tidak relevan.\n\n`;
    }

    try {
      const { stdout } = await execAsync(`curl -s -m 15 "https://api.hackertarget.com/hostsearch/?q=${searchDomain}"`, { timeout: 15000 });
      if (stdout && !stdout.includes("API count exceeded") && !stdout.includes("error")) {
        const lines = stdout.split('\n');
        for (let line of lines) {
          if (line.trim() === '') continue;
          const [sub, ip] = line.split(',');
          if (sub && ip && sub !== searchDomain) {
            foundSubdomains.push("- **" + sub + "** ➔ \x60" + ip + "\x60");
          }
        }
      }
    } catch (err) {}

    
    if (foundSubdomains.length === 0) {
      const commonSubdomains = scanMode === "deep"
        ? ["admin", "api", "dev", "staging", "mail", "cpanel", "test", "db", "dashboard", "vpn", "portal", "secure", "webmail", "ftp", "smtp", "ns1", "ns2", "blog", "shop", "store"]
        : ["admin", "api", "dev", "staging", "mail", "cpanel", "test", "db", "dashboard"];
      
      await Promise.all(
        commonSubdomains.map(async (sub) => {
          try {
            const target = `${sub}.${searchDomain}`;
            const records = await dns.promises.resolve4(target);
            if (records && records.length > 0)
              foundSubdomains.push("- **" + target + "** ➔ \x60" + records.join(", ") + "\x60");
          } catch (e) {}
        }),
      );
    }

    if (foundSubdomains.length > 0) {
      return `### 🌐 Pemetaan Infrastruktur (Garuda DNS Intel)\nSistem berhasil menemukan *subdomain* aktif yang terhubung dengan target melalui API OSINT & Brute-force:\n${foundSubdomains.slice(0, 30).join("\n")}\n\n`;
    }
  } catch (e) {}
  return "";
}
