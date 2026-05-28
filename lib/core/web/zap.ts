// new release garudashield source
import { exec } from "child_process";
import util from "util";
import fs from "fs";

const execAsync = util.promisify(exec);

export async function runZapScan(
  url: string,
  reportId: string,
  useVulnScan: boolean,
  depth: number,
  cookiesString: string,
  domain: string,
): Promise<string> {
  let zapData = "";
  if (useVulnScan) {
    try {
      const tempZapFile = `/tmp/zap-${reportId}.md`;
      const zapPort = Math.floor(Math.random() * 50000) + 10000;

      const attackStrength = depth >= 3 ? "HIGH" : "LOW";
      const alertThreshold = depth >= 3 ? "LOW" : "HIGH";
      
      const spiderDurations = [1, 3, 5, 12, 30];
      const maxSpiderDuration = spiderDurations[depth - 1] || 1;
      
      const baseConfig = ` -config scanner.attackStrength=${attackStrength} -config scanner.alertThreshold=${alertThreshold} -config spider.maxDepth=${depth} -config spider.maxDuration=${maxSpiderDuration} -config spider.thread=10 -config scanner.maxRuleDurationInMins=1`;
      const deepConfig = "";

      const zapCookieConfig = cookiesString
        ? ` -config replacer.full_list(0).description="WAF_Cookies" -config replacer.full_list(0).enabled=true -config replacer.full_list(0).matchtype=REQ_HEADER -config replacer.full_list(0).matchstring="Cookie" -config replacer.full_list(0).replacement="${cookiesString}"`
        : "";
      
      const timeouts = [90000, 200000, 400000, 1000000, 2000000]; 
      const dynamicTimeout = timeouts[depth - 1] || 90000;

      await execAsync(
        `zaproxy -cmd -port ${zapPort} -dir /tmp/zap-${reportId} -quickurl ${url} -quickout ${tempZapFile}${baseConfig}${deepConfig}${zapCookieConfig}`,
        { timeout: dynamicTimeout },
      );

      if (fs.existsSync(tempZapFile)) {
        const zapFileContent = fs.readFileSync(tempZapFile, "utf8");
        let cleanZap = zapFileContent
          .split("## Alert Detail")[0]
          .replace("# ZAP Report", "")
          .replace("ZAP by Checkmarx.", "")
          .trim();
        cleanZap = cleanZap
          .split("\n")
          .filter(
            (line: string) =>
              !line.toLowerCase().includes("zap.log") &&
              !line.includes("Percentage of") &&
              !line.includes("Count of total"),
          )
          .join("\n");
        cleanZap = cleanZap
          .replace(/\bZAP\b/gi, "Garuda Scanner")
          .replace(/Checkmarx/gi, "GarudaSecurity")
          .replace(/https?:\/\/(www\.)?zaproxy\.org[^\s)]+/gi, "#");

        cleanZap = cleanZap.replace(
          /##\s*Insights([\s\S]*?)##\s*Alerts/gi,
          (match: string, content: string) => {
            const strippedContent = content.replace(
              /Level|Reason|Site|Description|Statistic|\||-|\s/gi,
              "",
            );
            if (strippedContent.length > 0) {
              return match;
            }
            return "## Alerts";
          },
        );

        cleanZap = cleanZap
          .replace(/\bZAP\b/g, "Garuda Scanner")
          .replace(/Checkmarx/gi, "GarudaSecurity");

        zapData = cleanZap;
        fs.unlinkSync(tempZapFile);
        try {
          fs.rmSync(`/tmp/zap-${reportId}`, { recursive: true, force: true });
        } catch (e) {}
      }
      if (!zapData || zapData.length < 50) throw new Error("Fallback");
    } catch (e) {
      let fallbackText = "Gagal menjalankan Nmap fallback.";
      try {
        const { stdout } = await execAsync(
          `nmap -Pn --script http-enum,http-headers -p 80,443 --host-timeout 20s ${domain}`,
          { timeout: 25000 },
        );
        fallbackText = stdout;
      } catch (err: any) {
        fallbackText = err.stdout || err.message;
      }
      zapData = `ℹ️ **Garuda Vuln Scanner**: Pemindaian kerentanan lanjutan gagal dijalankan. Menggunakan **Garuda Fallback Scanner** sebagai pengganti:\n\n\`\`\`text\n${fallbackText}\n\`\`\``;
    }
  }
  return zapData;
}
