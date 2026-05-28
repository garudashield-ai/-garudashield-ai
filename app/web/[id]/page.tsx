// new release garudashield source
import React from "react";
import ReactMarkdown from "react-markdown";
import { getReport } from "@/lib/db";
import {
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import remarkGfm from "remark-gfm";
import { WebScanningView } from "@/components/WebScanningView";
export default async function WebReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ target?: string; private?: string; vuln?: string }>;
}) {
  const { id } = await params;
  const { target, private: isPrivateStr, vuln: isVulnStr } = await searchParams;
  const report = await getReport(id);
  if (!report) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 px-6 flex flex-col items-center">
        <h1 className="text-2xl font-bold">Laporan tidak ditemukan</h1>
        <Link href="/web" className="text-blue-500 mt-4 underline">
          Kembali
        </Link>
      </div>
    );
  }
  if (report.status === "processing") {
    return (
      <WebScanningView
        id={id}
        url={report.target}
        isPrivate={report.isPrivate}
        useVulnScan={false}
      />
    );
  }
  const getStatusIcon = () => {
    if (report.status === "danger")
      return <ShieldAlert size={48} className="text-red-500" />;
    if (report.status === "warning")
      return <AlertTriangle size={48} className="text-yellow-500" />;
    return <CheckCircle size={48} className="text-emerald-500" />;
  };
  const getStatusColor = () => {
    if (report.status === "danger")
      return "border-red-500/50 bg-red-500/5 shadow-red-500/10 text-red-500";
    if (report.status === "warning")
      return "border-yellow-500/50 bg-yellow-500/5 shadow-yellow-500/10 text-yellow-500";
    return "border-emerald-500/50 bg-emerald-500/5 shadow-emerald-500/10 text-emerald-500";
  };
  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 flex justify-center pb-20 overflow-x-hidden w-full max-w-[100vw]">
      <div className="w-full max-w-4xl">
        <Link
          href="/web"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Kembali ke Scanner
        </Link>
        <div
          className={`p-8 rounded-3xl border shadow-2xl backdrop-blur-xl ${getStatusColor()} flex items-center gap-6 mb-8`}
        >
          {getStatusIcon()}
          <div>
            <h1 className="text-3xl font-black mb-1 break-all">
              {report.target}
            </h1>
            <p className="opacity-80">
              ID Laporan: {report.id} •{" "}
              {new Date(report.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 md:p-12 shadow-xl">
          <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">
            Hasil Analisis AI
          </h2>
          <div className="text-zinc-300 space-y-4 overflow-x-hidden">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1
                    className="text-xl font-bold text-white mt-6 mb-4"
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    className="text-lg font-bold text-white mt-6 mb-3"
                    {...props}
                  />
                ),
                p: ({ node, ...props }) => (
                  <p className="leading-relaxed mb-4" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-bold text-white" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-5 space-y-2 mb-4" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="leading-relaxed" {...props} />
                ),
                pre: ({ node, ...props }) => (
                  <pre
                    className="bg-black/50 p-4 rounded-xl border border-white/10 overflow-x-auto text-sm sm:text-base text-zinc-300 mb-6 max-w-full"
                    {...props}
                  />
                ),
                code: ({ node, ...props }) => (
                  <code
                    className="break-all sm:break-words whitespace-pre-wrap font-mono text-emerald-400"
                    {...props}
                  />
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto w-full mb-6">
                    <table
                      className="w-full text-left border-collapse"
                      {...props}
                    />
                  </div>
                ),
                th: ({ node, ...props }) => (
                  <th
                    className="border border-white/10 p-3 bg-white/5 font-bold text-white"
                    {...props}
                  />
                ),
                td: ({ node, ...props }) => (
                  <td
                    className="border border-white/10 p-3 text-sm"
                    {...props}
                  />
                ),
              }}
            >
              {report.report}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
