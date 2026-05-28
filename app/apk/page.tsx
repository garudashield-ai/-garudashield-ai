// new release garudashield source
"use client";
import React, { useState, useRef } from "react";
import { Upload, FileCode2, ShieldAlert, Cpu } from "lucide-react";
import { ApkScanningView } from "@/components/ApkScanningView";
import { useRouter } from "next/navigation";
export default function ApkAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [tmpPath, setTmpPath] = useState<string | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setTmpPath(null);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const res = await fetch("/api/upload-apk", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal upload file ke temp");

        setTmpPath(data.tmpPath);
      } catch (err: any) {
        alert(err.message);
        setFile(null);
      } finally {
        setIsUploading(false);
      }
    }
  };
  const handleScan = async () => {
    if (!file || !tmpPath) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("tmpPath", tmpPath);
      formData.append("fileName", file.name);
      formData.append("isPrivate", isPrivate ? "true" : "false");
      const res = await fetch("/api/analyze-apk", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memulai analisis");

      router.push(`/apk/${data.id}`);
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 flex flex-col items-center overflow-x-hidden relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="relative z-10 w-full max-w-3xl mt-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-full mb-6 text-emerald-500">
            <Cpu size={48} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            APK <span className="text-emerald-500">Analyzer</span>
          </h1>
          <p className="text-zinc-400">
            Unggah file .apk mencurigakan (maks 100MB). Sistem akan mengekstrak
            kode dan menganalisis potensinya sebagai malware.
          </p>
        </div>
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl mb-10 text-center relative overflow-hidden">
          <input
            type="file"
            accept=".apk"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-600 rounded-2xl p-12 cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/5 transition-all group"
            >
              <div className="flex justify-center mb-4">
                <Upload
                  size={64}
                  className="text-zinc-500 group-hover:text-emerald-400 group-hover:-translate-y-2 transition-all"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Klik untuk Pilih File APK
              </h3>
              <p className="text-zinc-500 text-sm">
                Atau tarik dan lepas file di sini
              </p>
            </div>
          ) : (
            <div className="border border-emerald-500/30 bg-emerald-500/10 rounded-2xl p-4 sm:p-8 relative z-10">
              <div className="flex justify-center mb-4">
                <FileCode2 size={64} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-1 text-emerald-400">
                {file.name}
              </h3>
              <p className="text-zinc-400 text-sm mb-6">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>

              <div className="flex items-start sm:items-center justify-center mb-6 gap-2 text-left">
                <input
                  type="checkbox"
                  id="privateScan"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 mt-0.5 sm:mt-0 rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500 shrink-0"
                />
                <label htmlFor="privateScan" className="text-sm text-zinc-400">
                  Private scan (jangan simpan di riwayat publik)
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setFile(null)}
                  className="px-6 py-3 rounded-xl border border-zinc-600 hover:bg-zinc-800 transition-colors w-full sm:w-auto"
                >
                  Batal
                </button>
                {isUploading ? (
                  <button
                    disabled
                    className="bg-zinc-800 text-zinc-400 font-bold px-4 sm:px-8 py-3 rounded-xl flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap cursor-not-allowed border border-white/5 shadow-inner"
                  >
                    <span className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></span>
                    Mengunggah ke Temp...
                  </button>
                ) : (
                  <button
                    onClick={handleScan}
                    disabled={!tmpPath || loading}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 sm:px-8 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap disabled:opacity-50"
                  >
                    {loading ? "Memproses..." : "Mulai Analisis"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
            <FileCode2 className="text-emerald-400 mb-4" />
            <h3 className="font-bold mb-2">Manifest Dump</h3>
            <p className="text-sm text-zinc-400">
              Mengekstrak AndroidManifest.xml secara native.
            </p>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
            <ShieldAlert className="text-emerald-400 mb-4" />
            <h3 className="font-bold mb-2">Permission Check</h3>
            <p className="text-sm text-zinc-400">
              Menganalisis akses berbahaya (SMS, Kontak).
            </p>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
            <Cpu className="text-emerald-400 mb-4" />
            <h3 className="font-bold mb-2">AI Heuristics</h3>
            <p className="text-sm text-zinc-400">
              Mendeteksi pola penipuan undangan/kurir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
