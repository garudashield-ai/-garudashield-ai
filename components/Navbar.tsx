// new release garudashield source
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Globe,
  Cpu,
  Menu,
  X,
  ChevronRight,
  ArrowRightLeft,
  Search,
  Link2,
} from "lucide-react";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(220,38,38,0.3)] group-hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] group-hover:scale-105 transition-all">
              <img
                src="/favicon.ico"
                alt="GarudaShield Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-black text-xl tracking-tighter text-white">
              GARUDA<span className="text-red-500">SHIELD</span>
            </span>
          </Link>
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-md transition-all text-white"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl overflow-y-auto flex flex-col pt-24 pb-12 px-6"
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="fixed top-6 right-6 z-[110] p-3 bg-white/10 hover:bg-red-500/20 text-white hover:text-red-500 border border-white/10 rounded-full transition-all"
            >
              <X />
            </button>

            <div className="max-w-2xl mx-auto w-full space-y-4 sm:space-y-6 flex-1 flex flex-col justify-center">
              <p className="text-red-500 font-bold tracking-widest text-xs sm:text-sm mb-2 sm:mb-4 uppercase text-center md:text-left">
                Navigation Menu
              </p>

              <Link href="/web" onClick={() => setMenuOpen(false)}>
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="group flex items-center justify-between p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/5 hover:bg-red-600/10 border border-white/5 hover:border-red-500/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 sm:gap-6">
                    <div className="p-3 sm:p-4 bg-red-500/20 rounded-xl sm:rounded-2xl text-red-500 group-hover:scale-110 transition-transform">
                      <Globe className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 group-hover:text-red-400 transition-colors">
                        Web Scanner
                      </h2>
                      <p className="text-zinc-500 text-xs sm:text-sm md:text-base leading-tight">
                        Deteksi situs Phishing & Scam
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-zinc-600 group-hover:text-red-500 group-hover:translate-x-2 transition-all shrink-0 ml-2" />
                </motion.div>
              </Link>

              <Link href="/apk" onClick={() => setMenuOpen(false)}>
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="group flex items-center justify-between p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/5 hover:bg-emerald-600/10 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 sm:gap-6">
                    <div className="p-3 sm:p-4 bg-emerald-500/20 rounded-xl sm:rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
                      <Cpu className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 group-hover:text-emerald-400 transition-colors">
                        APK Analyzer
                      </h2>
                      <p className="text-zinc-500 text-xs sm:text-sm md:text-base leading-tight">
                        Bongkar Polyglot & Malware
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-zinc-600 group-hover:text-emerald-500 group-hover:translate-x-2 transition-all shrink-0 ml-2" />
                </motion.div>
              </Link>

              <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="group flex items-center justify-between p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/5 hover:bg-blue-600/10 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 sm:gap-6">
                    <div className="p-3 sm:p-4 bg-blue-500/20 rounded-xl sm:rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
                      <ShieldAlert className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 group-hover:text-blue-400 transition-colors">
                        Threat Dashboard
                      </h2>
                      <p className="text-zinc-500 text-xs sm:text-sm md:text-base leading-tight">
                        Statistik intelijen real-time
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-zinc-600 group-hover:text-blue-500 group-hover:translate-x-2 transition-all shrink-0 ml-2" />
                </motion.div>
              </Link>


            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
