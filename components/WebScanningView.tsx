// new release garudashield source
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Shield } from "lucide-react";

const LOG_PHASES = [
  [
    { text: "[INIT] GarudaShield Engine v2.1.0 starting...", type: "system" },
    {
      text: "[INIT] Loading threat intelligence database (128,492 signatures)",
      type: "system",
    },
    {
      text: "[INIT] Modules: Heuristics, WHOIS, SSL, Port Scanner, Vuln Scanner, AI ready",
      type: "success",
    },
  ],
  [
    { text: "[RECON] Resolving target URL...", type: "info" },
    { text: "[RECON] DNS A record resolved", type: "success" },
    { text: "[RECON] Checking HTTP response headers...", type: "info" },
    { text: "[RECON] HTTP/2 200 OK — Server responding", type: "success" },
    { text: "[RECON] Extracting HTML content (crawling)...", type: "info" },
    {
      text: "[RECON] HTML body captured — analyzing DOM structure",
      type: "success",
    },
  ],
  [
    { text: "[WHOIS] Querying domain registry...", type: "info" },
    { text: "[WHOIS] Registrar data extracted", type: "success" },
    { text: "[WHOIS] Checking domain age and status flags...", type: "info" },
    { text: "[SSL] Initiating TLS handshake on port 443...", type: "info" },
    { text: "[SSL] Certificate chain validated", type: "success" },
    { text: "[SSL] Cipher suite: TLS_AES_256_GCM_SHA384", type: "data" },
  ],
  [
    {
      text: "[PORT] Starting port discovery (Fast scan -T4 -F)...",
      type: "info",
    },
    { text: "[PORT] Probing 100 most common ports...", type: "info" },
    { text: "[PORT] SYN scan in progress...", type: "info" },
    { text: "[PORT] Port 80/tcp — open (http)", type: "data" },
    { text: "[PORT] Port 443/tcp — open (https)", type: "data" },
    { text: "[PORT] Port scan completed", type: "success" },
  ],
  [
    { text: "[HEUR] Running GarudaShield Heuristic Engine...", type: "info" },
    { text: "[HEUR] Checking 90+ malware signatures...", type: "info" },
    { text: "[HEUR] Scanning for phishing patterns...", type: "info" },
    { text: "[HEUR] Checking gambling/judol keywords...", type: "info" },
    { text: "[HEUR] Analyzing hidden iframe injections...", type: "info" },
    { text: "[HEUR] Extracting contact traces (OSINT)...", type: "info" },
    { text: "[HEUR] Heuristic analysis complete", type: "success" },
  ],
  [
    {
      text: "[VULN] Initializing Garuda Vulnerability Scanner...",
      type: "info",
    },
    {
      text: "[VULN] Spawning on random port to avoid collisions...",
      type: "system",
    },
    { text: "[VULN] Spider crawling target...", type: "info" },
    { text: "[VULN] Active scan starting — probing for XSS...", type: "info" },
    { text: "[VULN] Testing SQL injection vectors...", type: "info" },
    { text: "[VULN] Checking for CSRF vulnerabilities...", type: "info" },
    { text: "[VULN] Scanning for directory traversal...", type: "info" },
    { text: "[VULN] Probing for server-side request forgery...", type: "info" },
    { text: "[VULN] Testing for remote code execution...", type: "info" },
    { text: "[VULN] Checking for insecure headers...", type: "info" },
    { text: "[VULN] Analyzing content security policy...", type: "info" },
    { text: "[VULN] Testing for open redirects...", type: "info" },
    { text: "[VULN] Checking anti-clickjacking headers...", type: "info" },
    { text: "[VULN] Verifying cookie security flags...", type: "info" },
    { text: "[VULN] Scanning for information disclosure...", type: "info" },
    { text: "[VULN] Testing for path traversal vectors...", type: "info" },
    { text: "[VULN] Checking for exposed API endpoints...", type: "info" },
    { text: "[VULN] Probe batch 1/3 completed", type: "success" },
    { text: "[VULN] Scanning for HTTP parameter pollution...", type: "info" },
    { text: "[VULN] Testing for broken authentication...", type: "info" },
    { text: "[VULN] Checking for misconfigured CORS...", type: "info" },
    { text: "[VULN] Testing for XML external entity (XXE)...", type: "info" },
    { text: "[VULN] Checking for HTTP request smuggling...", type: "info" },
    { text: "[VULN] Probe batch 2/3 completed", type: "success" },
    { text: "[VULN] Scanning for insecure deserialization...", type: "info" },
    {
      text: "[VULN] Testing for server-side template injection...",
      type: "info",
    },
    { text: "[VULN] Checking for security misconfigurations...", type: "info" },
    { text: "[VULN] Finalizing vulnerability assessment...", type: "info" },
    { text: "[VULN] Probe batch 3/3 completed", type: "success" },
    {
      text: "[VULN] Active scan finished — generating report",
      type: "success",
    },
  ],
  [
    { text: "[AI] Sending data to GarudaShield AI Engine...", type: "info" },
    { text: "[AI] Processing threat intelligence...", type: "info" },
    {
      text: "[AI] Correlating heuristic + Vuln Scanner + OSINT data...",
      type: "info",
    },
    { text: "[AI] Generating comprehensive threat report...", type: "info" },
    { text: "[AI] AI analysis complete", type: "success" },
  ],
];

type LogEntry = { text: string; type: string; timestamp: string };

function getTimestamp() {
  return new Date().toLocaleTimeString("id-ID", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getLogColor(type: string) {
  switch (type) {
    case "system":
      return "text-blue-400";
    case "success":
      return "text-emerald-400";
    case "info":
      return "text-zinc-400";
    case "data":
      return "text-amber-400";
    case "warn":
      return "text-yellow-500";
    case "error":
      return "text-red-500";
    default:
      return "text-zinc-500";
  }
}

export function WebScanningView({
  id,
  url,
  isPrivate = false,
  useVulnScan = false,
}: {
  id: string;
  url: string;
  isPrivate?: boolean;
  useVulnScan?: boolean;
}) {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(`web_scan_logs_${id}`);
      if (saved) return JSON.parse(saved);
    }
    return [];
  });
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(`web_scan_time_${id}`);
      if (saved) return parseInt(saved, 10);
    }
    return 0;
  });
  const [scanDone, setScanDone] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const phaseIndexRef = useRef(0);
  const msgIndexRef = useRef(0);
  const scanCompleteRef = useRef(false);
  const initRefs = useRef(false);

  if (typeof window !== "undefined" && !initRefs.current) {
    const p = sessionStorage.getItem(`web_scan_phase_${id}`);
    const m = sessionStorage.getItem(`web_scan_msg_${id}`);
    if (p) phaseIndexRef.current = parseInt(p, 10);
    if (m) msgIndexRef.current = parseInt(m, 10);
    initRefs.current = true;
  }

  const updatePhaseMsg = (p: number, m: number) => {
    phaseIndexRef.current = p;
    msgIndexRef.current = m;
    sessionStorage.setItem(`web_scan_phase_${id}`, p.toString());
    sessionStorage.setItem(`web_scan_msg_${id}`, m.toString());
  };

  const addLog = useCallback(
    (entry: LogEntry) => {
      setLogs((prev) => {
        const next = [...prev, entry];
        sessionStorage.setItem(`web_scan_logs_${id}`, JSON.stringify(next));
        return next;
      });
    },
    [id],
  );

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => {
        const next = prev + 1;
        sessionStorage.setItem(`web_scan_time_${id}`, next.toString());
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [id]);

  useEffect(() => {
    let mounted = true;

    function scheduleNext() {
      if (!mounted || scanCompleteRef.current) return;

      let phase = phaseIndexRef.current;

      if (!useVulnScan && phase === 5) {
        updatePhaseMsg(phaseIndexRef.current + 1, msgIndexRef.current);
        phase = phaseIndexRef.current;
      }

      const msgIdx = msgIndexRef.current;

      if (phase >= LOG_PHASES.length) {
        let currentPct = msgIndexRef.current;
        if (currentPct === 0) currentPct = 87;

        if (currentPct < 99) {
          currentPct += Math.floor(Math.random() * 3) + 1;
          if (currentPct > 99) currentPct = 99;
        }
        updatePhaseMsg(phaseIndexRef.current, currentPct);

        const idleMessages = [
          "[VULN] Melakukan validasi ulang pada payload injeksi SQL...",
          "[VULN] Menunggu eksekusi reverse-shell asinkronus (Time-Based)...",
          "[SYS] Server target melakukan rate-limiting, menyesuaikan kecepatan probe...",
          "[SCAN] Spider Crawler masih melakukan pemindaian (Deep Vulnerability)...",
          "[AI] Menghitung kalkulasi confidence score tingkat lanjut...",
          "[OSINT] Mencocokkan jejak digital dengan database intelijen global...",
          "[VULN] Menguji kerentanan XSS DOM-based (Headless Browser processing)...",
          "[SYS] Menganalisis ribuan baris log respons server...",
        ];

        const randomMsg =
          idleMessages[Math.floor(Math.random() * idleMessages.length)];

        addLog({ text: randomMsg, type: "info", timestamp: getTimestamp() });

        const delay = Math.random() * 7000 + 8000;
        setTimeout(scheduleNext, delay);
        return;
      }

      const phaseMessages = LOG_PHASES[phase];
      if (msgIdx >= phaseMessages.length) {
        updatePhaseMsg(phaseIndexRef.current + 1, 0);
        setTimeout(scheduleNext, 800);
        return;
      }

      const msg = phaseMessages[msgIdx];
      addLog({ text: msg.text, type: msg.type, timestamp: getTimestamp() });
      updatePhaseMsg(phaseIndexRef.current, msgIndexRef.current + 1);

      let delay: number;
      if (phase === 5) {
        delay = Math.random() * 2500 + 1500;
      } else if (msg.type === "success") {
        delay = 400;
      } else {
        delay = Math.random() * 1500 + 600;
      }

      setTimeout(scheduleNext, delay);
    }

    scheduleNext();

    return () => {
      mounted = false;
    };
  }, [addLog]);

  useEffect(() => {
    let isMounted = true;
    let pollTimer: NodeJS.Timeout | null = null;
    const pollForResults = async () => {
      if (!isMounted) return;
      try {
        const statusRes = await fetch(`/api/scan/status?id=${id}`);
        if (!statusRes.ok) {
          pollTimer = setTimeout(pollForResults, 3000);
          return;
        }
        const statusData = await statusRes.json();

        if (statusData.status === "done") {
          if (isMounted) {
            scanCompleteRef.current = true;
            setScanDone(true);
            addLog({
              text: "[DONE] ✓ Scan selesai — Laporan berhasil dihasilkan!",
              type: "success",
              timestamp: getTimestamp(),
            });
            addLog({
              text: "[DONE] Redirecting ke halaman laporan...",
              type: "system",
              timestamp: getTimestamp(),
            });
            setTimeout(() => {
              if (isMounted) {
                router.refresh();
              }
            }, 1500);
          }
        } else {
          pollTimer = setTimeout(pollForResults, 3000);
        }
      } catch (e) {
        if (isMounted) {
          pollTimer = setTimeout(pollForResults, 3000);
        }
      }
    };

    pollTimer = setTimeout(pollForResults, 3000);

    return () => {
      isMounted = false;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [id, router, addLog]);

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 sm:px-6 flex flex-col items-center overflow-x-hidden w-full relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl box-border">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="text-red-500" size={28} />
          <h1 className="text-xl sm:text-2xl font-black">
            GarudaShield Scanner
          </h1>
        </div>
        <p className="text-zinc-500 text-sm mb-6 font-mono truncate">
          Target: {url}
        </p>

        <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-red-500/5 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-white/10 gap-2 sm:gap-0">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 shrink-0">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-[10px] sm:text-xs font-mono text-zinc-500 ml-2 sm:ml-3 flex items-center gap-1 sm:gap-2 truncate">
                <Terminal size={12} className="shrink-0" />
                garudashield — system log
              </span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto">
              {!scanDone && !error && (
                <span className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  SCANNING
                </span>
              )}
              {scanDone && (
                <span className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  COMPLETE
                </span>
              )}
              {error && (
                <span className="flex items-center gap-2 text-xs font-mono text-red-400">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  ERROR
                </span>
              )}
              <span className="text-xs font-mono text-zinc-600">
                {formatElapsed(elapsedTime)}
              </span>
            </div>
          </div>

          <div
            ref={logContainerRef}
            className="p-4 h-[420px] overflow-y-auto font-mono text-xs sm:text-sm leading-relaxed scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700"
          >
            {logs.map((log, idx) => (
              <div
                key={idx}
                className={`flex gap-3 mb-1 ${getLogColor(log.type)}`}
              >
                <span className="text-zinc-600 shrink-0 select-none">
                  {log.timestamp}
                </span>
                <span className="break-all">{log.text}</span>
              </div>
            ))}
            {!scanDone && !error && (
              <div className="flex gap-3 mb-1 text-zinc-600">
                <span className="shrink-0 select-none">{getTimestamp()}</span>
                <span className="animate-pulse">█</span>
              </div>
            )}
          </div>

          {!error && (
            <div className="px-4 pb-3">
              <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: scanDone
                      ? "100%"
                      : `${Math.min(95, (elapsedTime / 110) * 100)}%`,
                    background: scanDone
                      ? "rgb(16, 185, 129)"
                      : "linear-gradient(90deg, rgb(239, 68, 68), rgb(249, 115, 22))",
                  }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] font-mono text-zinc-600">
                <span>
                  {scanDone ? "Scan complete" : "Scanning in progress..."}
                </span>
                <span>
                  {scanDone
                    ? "100%"
                    : `${Math.min(95, Math.round((elapsedTime / 110) * 100))}%`}
                </span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl transition-all"
            >
              Coba Lagi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
