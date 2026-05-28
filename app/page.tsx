// new release garudashield source
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-20 flex flex-col items-center text-center h-full justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8 backdrop-blur-md"
        >
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-zinc-300 text-sm font-medium tracking-wide">
            Sistem Deteksi Ancaman Siber Berbasis AI
          </span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1]"
        >
          Keamanan Digital <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-orange-400">
            Era Indonesia Emas
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-zinc-400 max-w-3xl mb-12 leading-relaxed"
        >
          GarudaShield AI adalah instrumen intelijen yang mendeteksi phishing,
          malware APK palsu, dan manipulasi digital secara instan.
        </motion.p>
        <Link href="/web">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group relative px-10 py-5 bg-white text-black hover:bg-zinc-200 font-bold text-xl rounded-full overflow-hidden transition-all flex items-center gap-4"
          >
            Mulai Analisis{" "}
            <ChevronRight className="group-hover:translate-x-2 transition-transform" />
          </motion.button>
        </Link>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[40vh] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,transparent,black)] pointer-events-none" />
    </div>
  );
}
