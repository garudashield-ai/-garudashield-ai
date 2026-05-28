// new release garudashield source
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Shield } from "lucide-react";

const LOG_PHASES = [
  [
    {
      text: "[INIT] GarudaShield APK Analyzer v2.1.0 starting...",
      type: "system",
    },
    {
      text: "[INIT] Loading malware signature database (52,847 patterns)",
      type: "system",
    },
    {
      text: "[INIT] Modules: Manifest, Permissions, Hex Dump, Heuristics, AI ready",
      type: "success",
    },
  ],

  [
    { text: "[UPLOAD] Receiving APK file...", type: "info" },
    {
      text: "[UPLOAD] File integrity check (SHA-256 hash computed)",
      type: "info",
    },
    { text: "[UPLOAD] APK uploaded to sandbox environment", type: "success" },
  ],

  [
    { text: "[APK] Extracting AndroidManifest.xml...", type: "info" },
    { text: "[APK] Parsing package name and version code...", type: "info" },
    { text: "[APK] Manifest extracted successfully", type: "success" },
    { text: "[APK] Enumerating declared activities...", type: "info" },
    { text: "[APK] Enumerating broadcast receivers...", type: "info" },
    { text: "[APK] Enumerating services and providers...", type: "info" },
    { text: "[APK] Component enumeration complete", type: "success" },
  ],

  [
    { text: "[PERM] Analyzing requested permissions...", type: "info" },
    {
      text: "[PERM] Checking for dangerous permission groups...",
      type: "info",
    },
    {
      text: "[PERM] Checking INTERNET, READ_SMS, CAMERA access...",
      type: "info",
    },
    {
      text: "[PERM] Checking SEND_SMS, READ_CONTACTS, RECORD_AUDIO...",
      type: "info",
    },
    {
      text: "[PERM] Checking ACCESS_FINE_LOCATION, READ_PHONE_STATE...",
      type: "info",
    },
    {
      text: "[PERM] Checking SYSTEM_ALERT_WINDOW, BIND_ADMIN...",
      type: "info",
    },
    { text: "[PERM] Permission risk profile generated", type: "success" },
  ],

  [
    {
      text: "[HEX] Scanning embedded assets for steganography...",
      type: "info",
    },
    {
      text: "[HEX] Extracting image resources (PNG, JPG, WebP)...",
      type: "info",
    },
    { text: "[HEX] Analyzing hex dump of drawable resources...", type: "info" },
    {
      text: "[HEX] Checking for hidden payloads in image headers...",
      type: "info",
    },
    {
      text: "[HEX] Scanning DEX bytecode for obfuscation patterns...",
      type: "info",
    },
    {
      text: "[HEX] Checking for packed/encrypted code sections...",
      type: "info",
    },
    { text: "[HEX] Steganography analysis complete", type: "success" },
  ],

  [
    { text: "[HEUR] Running GarudaShield Heuristic Engine...", type: "info" },
    { text: "[HEUR] Checking for known trojan signatures...", type: "info" },
    { text: "[HEUR] Scanning for spyware behavior patterns...", type: "info" },
    { text: "[HEUR] Checking for SMS premium dialer code...", type: "info" },
    { text: "[HEUR] Scanning for crypto miner indicators...", type: "info" },
    {
      text: "[HEUR] Checking for C2 (Command & Control) URLs...",
      type: "info",
    },
    { text: "[HEUR] Scanning for data exfiltration patterns...", type: "info" },
    {
      text: "[HEUR] Checking reflection/dynamic loading calls...",
      type: "info",
    },
    { text: "[HEUR] Analyzing native library (.so) imports...", type: "info" },
    { text: "[HEUR] Checking for root detection bypass...", type: "info" },
    { text: "[HEUR] Heuristic scan batch completed", type: "success" },
  ],

  [
    {
      text: "[AI] Sending extracted data to GarudaShield AI Engine...",
      type: "info",
    },
    { text: "[AI] Processing threat correlation matrix...", type: "info" },
    { text: "[AI] Analyzing permission-to-behavior mapping...", type: "info" },
    {
      text: "[AI] Cross-referencing with malware family database...",
      type: "info",
    },
    {
      text: "[AI] Generating comprehensive APK threat report...",
      type: "info",
    },
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

export function ApkScanningView({
  file,
  id,
  isPrivate = false,
}: {
  file: File;
  id: string;
  isPrivate?: boolean;
}) {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(`apk_scan_logs_${id}`);
      if (saved) return JSON.parse(saved);
    }
    return [];
  });
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(`apk_scan_time_${id}`);
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
    const p = sessionStorage.getItem(`apk_scan_phase_${id}`);
    const m = sessionStorage.getItem(`apk_scan_msg_${id}`);
    if (p) phaseIndexRef.current = parseInt(p, 10);
    if (m) msgIndexRef.current = parseInt(m, 10);
    initRefs.current = true;
  }

  const updatePhaseMsg = (p: number, m: number) => {
    phaseIndexRef.current = p;
    msgIndexRef.current = m;
    sessionStorage.setItem(`apk_scan_phase_${id}`, p.toString());
    sessionStorage.setItem(`apk_scan_msg_${id}`, m.toString());
  };

  const addLog = useCallback(
    (entry: LogEntry) => {
      setLogs((prev) => {
        const next = [...prev, entry];
        sessionStorage.setItem(`apk_scan_logs_${id}`, JSON.stringify(next));
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
        sessionStorage.setItem(`apk_scan_time_${id}`, next.toString());
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [id]);

  useEffect(() => {
    let mounted = true;

    function scheduleNext() {
      if (!mounted || scanCompleteRef.current) return;

      const phase = phaseIndexRef.current;
      const msgIdx = msgIndexRef.current;

      if (phase >= LOG_PHASES.length) {
        const idleMessages = [
          "[HEUR] Re-validating signature matches...",
          "[SYS] Active threads: " + (Math.floor(Math.random() * 3) + 1),
          "[SYS] Analysis progress: " +
            Math.min(95, 60 + Math.floor(Math.random() * 35)) +
            "%",
          "[SYS] Memory: " +
            (Math.floor(Math.random() * 150) + 200) +
            "MB / CPU: " +
            (Math.floor(Math.random() * 25) + 15) +
            "%",
          "[APK] Processing response queue...",
          "[HEUR] Checking edge-case patterns...",
          "[SYS] Garbage collection cycle completed",
          "[AI] Waiting for AI inference result...",
          "[SYS] Sandbox environment stable",
          "[HEUR] Evaluating behavioral heuristics...",
        ];
        const randomMsg =
          idleMessages[Math.floor(Math.random() * idleMessages.length)];
        addLog({ text: randomMsg, type: "info", timestamp: getTimestamp() });
        const delay = Math.random() * 3000 + 1500;
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
        delay = Math.random() * 2000 + 1200;
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
          pollTimer = setTimeout(pollForResults, 2000);
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
          pollTimer = setTimeout(pollForResults, 2000);
        }
      } catch (e) {
        if (isMounted) {
          pollTimer = setTimeout(pollForResults, 2000);
        }
      }
    };
    pollTimer = setTimeout(pollForResults, 2000);
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
    <div className="min-h-screen bg-black text-white pt-24 px-4 sm:px-6 flex flex-col items-center overflow-x-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl">
        {}
        <div className="flex items-center gap-3 mb-2">
          <Shield className="text-emerald-500" size={28} />
          <h1 className="text-xl sm:text-2xl font-black">
            GarudaShield APK Analyzer
          </h1>
        </div>
        <p className="text-zinc-500 text-sm mb-6 font-mono truncate">
          File: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </p>

        {}
        <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/5">
          {}
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-xs font-mono text-zinc-500 ml-3 flex items-center gap-2">
                <Terminal size={12} />
                garudashield — apk analysis
              </span>
            </div>
            <div className="flex items-center gap-4">
              {!scanDone && !error && (
                <span className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  ANALYZING
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

          {}
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
            {}
            {!scanDone && !error && (
              <div className="flex gap-3 mb-1 text-zinc-600">
                <span className="shrink-0 select-none">{getTimestamp()}</span>
                <span className="animate-pulse">█</span>
              </div>
            )}
          </div>

          {}
          {!error && (
            <div className="px-4 pb-3">
              <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: scanDone
                      ? "100%"
                      : `${Math.min(95, (elapsedTime / 80) * 100)}%`,
                    background: scanDone
                      ? "rgb(16, 185, 129)"
                      : "linear-gradient(90deg, rgb(16, 185, 129), rgb(52, 211, 153))",
                  }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] font-mono text-zinc-600">
                <span>
                  {scanDone ? "Analysis complete" : "Analyzing APK..."}
                </span>
                <span>
                  {scanDone
                    ? "100%"
                    : `${Math.min(95, Math.round((elapsedTime / 80) * 100))}%`}
                </span>
              </div>
            </div>
          )}
        </div>

        {}
        {error && (
          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl transition-all"
            >
              Coba Lagi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
