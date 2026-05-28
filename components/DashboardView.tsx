// new release garudashield source
"use client";

import React from "react";
import { ScanReport } from "@/lib/db";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  Activity,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  FileCode2,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function DashboardView({ reports }: { reports: ScanReport[] }) {
  const safeCount = reports.filter((r) => r.status === "safe").length;
  const warningCount = reports.filter((r) => r.status === "warning").length;
  const dangerCount = reports.filter((r) => r.status === "danger").length;

  const webCount = reports.filter((r) => r.type === "web").length;
  const apkCount = reports.filter((r) => r.type === "apk").length;

  const statusData = [
    { name: "Aman", value: safeCount, color: "#10b981" },
    { name: "Waspada", value: warningCount, color: "#f59e0b" },
    { name: "Berbahaya", value: dangerCount, color: "#ef4444" },
  ];

  const typeData = [
    { name: "Web Scan", value: webCount, color: "#3b82f6" },
    { name: "APK Scan", value: apkCount, color: "#8b5cf6" },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Activity className="text-red-500" size={32} />
          Intelligence <span className="text-red-500">Dashboard</span>
        </h1>
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          SYSTEM ONLINE
        </div>
      </motion.div>

      {}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-8 hover:border-red-500/30 transition-all flex items-center gap-6"
        >
          <div className="p-4 bg-red-500/10 rounded-2xl">
            <ShieldAlert className="text-red-500" size={32} />
          </div>
          <div>
            <div className="text-4xl font-black text-white mb-1">
              {dangerCount}
            </div>
            <p className="text-zinc-400 font-medium text-sm tracking-wide">
              Ancaman Kritis
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-8 hover:border-emerald-500/30 transition-all flex items-center gap-6"
        >
          <div className="p-4 bg-emerald-500/10 rounded-2xl">
            <ShieldCheck className="text-emerald-500" size={32} />
          </div>
          <div>
            <div className="text-4xl font-black text-white mb-1">
              {reports.length}
            </div>
            <p className="text-zinc-400 font-medium text-sm tracking-wide">
              Total Analisis
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-8 hover:border-blue-500/30 transition-all flex items-center gap-6"
        >
          <div className="p-4 bg-blue-500/10 rounded-2xl">
            <Activity className="text-blue-500" size={32} />
          </div>
          <div>
            <div className="text-4xl font-black text-white mb-1">
              {((safeCount / Math.max(1, reports.length)) * 100).toFixed(1)}%
            </div>
            <p className="text-zinc-400 font-medium text-sm tracking-wide">
              Tingkat Keamanan
            </p>
          </div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-black/40 border border-white/5 rounded-3xl p-8"
        >
          <h3 className="text-xl font-bold mb-6 text-zinc-300">
            Statistik Status Ancaman
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis dataKey="name" stroke="#52525b" />
                <YAxis stroke="#52525b" allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "#27272a" }}
                  contentStyle={{
                    backgroundColor: "#09090b",
                    borderColor: "#27272a",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-black/40 border border-white/5 rounded-3xl p-8"
        >
          <h3 className="text-xl font-bold mb-6 text-zinc-300">
            Distribusi Tipe Analisis
          </h3>
          <div className="h-64 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    borderColor: "#27272a",
                    borderRadius: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-8"
      >
        <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
          <Activity className="text-red-500" /> Riwayat Analisis Terbaru
        </h3>
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-10 text-zinc-500">
              Belum ada data analisis. Coba gunakan fitur Scan Web atau Scan
              APK.
            </div>
          ) : (
            reports.map((r, i) => (
              <Link href={`/${r.type}/${r.id}`} key={r.id}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-white/5 hover:bg-white/5 px-4 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                    ${
                      r.status === "danger"
                        ? "bg-red-500/20 text-red-500"
                        : r.status === "warning"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-emerald-500/20 text-emerald-500"
                    }`}
                    >
                      {r.status === "danger" ? (
                        <ShieldAlert />
                      ) : r.status === "warning" ? (
                        <AlertTriangle />
                      ) : (
                        <CheckCircle />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold flex items-start gap-2 group-hover:text-blue-400 transition-colors break-all">
                        <div className="mt-1 shrink-0">
                          {r.type === "web" ? (
                            <Globe size={16} />
                          ) : (
                            <FileCode2 size={16} />
                          )}
                        </div>
                        <span className="leading-tight">
                          {r.target.length > 50
                            ? r.target.substring(0, 50) + "..."
                            : r.target}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
                        {r.status === "danger"
                          ? "ANCAMAN TINGGI"
                          : r.status === "warning"
                            ? "MENCURIGAKAN"
                            : "AMAN"}
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right ml-16 sm:ml-0">
                    <div className="text-sm font-bold text-zinc-300 uppercase">
                      {r.type} SCAN
                    </div>
                    <div className="text-xs text-zinc-500">
                      {new Date(r.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
