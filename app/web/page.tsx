// new release garudashield source
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldAlert, Globe } from "lucide-react";
export default function WebAnalyzerPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [useVulnScan, setUseVulnScan] = useState(1);
  const router = useRouter();
  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch("/api/analyze-web", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          isPrivate,
          useVulnScan: true,
          depth: useVulnScan,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses URL");

      router.push(`/web/${data.id}`);
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 flex flex-col items-center overflow-x-hidden relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="relative z-10 w-full max-w-3xl mt-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-red-500/10 rounded-full mb-6 text-red-500">
            <Globe size={48} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Web & URL <span className="text-red-500">Scanner</span>
          </h1>
          <p className="text-zinc-400">
            Masukkan link mencurigakan untuk mendeteksi ancaman Phishing, Scam,
            atau Malware.
          </p>
        </div>
        <form
          onSubmit={handleScan}
          className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl mb-10"
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://contoh-link-mencurigakan.com"
                className="w-full bg-black/50 border border-zinc-700 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-4 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap"
            >
              {loading && (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading ? "Scanning..." : "SCAN URL"}
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center mt-2 gap-6 w-full">
            <div className="flex-1 w-full max-w-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-300 font-bold">
                  Scan Depth: {useVulnScan}
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  {useVulnScan === 1 && "Cepat (~1 Menit)"}
                  {useVulnScan === 2 && "Normal (~3 Menit)"}
                  {useVulnScan === 3 && "Dalam (~6 Menit)"}
                  {useVulnScan === 4 && "Sangat Dalam (~15 Menit)"}
                  {useVulnScan === 5 && "Ekstrim (>30 Menit)"}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={useVulnScan}
                onChange={(e) => setUseVulnScan(parseInt(e.target.value))}
                disabled={loading}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              {useVulnScan >= 4 && (
                <p className="text-[10px] text-red-400 mt-1">
                  ⚠️ Peringatan: Depth {useVulnScan} hanya dapat dilakukan 1 kali seminggu per pengguna.
                </p>
              )}
            </div>

            <label className="flex items-center cursor-pointer gap-2 mt-4 sm:mt-0">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-red-500 focus:ring-red-500 shrink-0"
              />
              <span className="text-sm text-zinc-400">Private scan</span>
            </label>
          </div>
        </form>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
            <ShieldAlert className="text-red-400 mb-4" />
            <h3 className="font-bold mb-2">Phishing Detect</h3>
            <p className="text-sm text-zinc-400">
              Menganalisis kemiripan domain dengan merek asli.
            </p>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
            <Search className="text-red-400 mb-4" />
            <h3 className="font-bold mb-2">Code Crawl</h3>
            <p className="text-sm text-zinc-400">
              Memeriksa iframe tersembunyi dan form palsu.
            </p>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
            <Globe className="text-red-400 mb-4" />
            <h3 className="font-bold mb-2">WHOIS Intel</h3>
            <p className="text-sm text-zinc-400">
              Mengekstrak data registrasi domain secara mendalam.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
