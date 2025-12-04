"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Sparkles } from "lucide-react";

export default function Hero() {
    return (
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-grid-white/5" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-5xl text-center px-6 mx-auto"
        >

          <motion.h1
          className="text-7x1 md:text-9x1 font-black text-white mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
           Lumora  
          </motion.h1>
          <motion.p
            className="text-2x1 md:text-4xl text-white/80 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            The future of work is here.<br />Beautiful. Fast. Yours.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <a href="/waitlist" className="group px-12 py-6 bg-white text-black font-bold text-x1 rounded-2xl hover:scale-105 transition shadow-2x1 inline-flex items-center gap-3">
              Join Waitlist <ArrowRight className="group-hover:translate-x-2 tranaition" />
            </a>
            <a href="#features" className="px-12 py-6 border-2 border-white/50 text-white font-bold text-x1 rounded-2xl hover:bg-white hover:text-black transition">
              Learn More
            </a>
          </motion.div>
        </motion.div>

        {/* Floating squares */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 6 }}
          className="absolute top-32 left-10 w-80 h-56 bg-linear-to-br from-purple-500 to-pink-600 rounded-3xl rotate-12 shadow-2xl"
         />
         <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 8 }}
          className="absolute bottom-32 right-10 w-96 h-64 bg-linear-to-br from-blue-600 to-cyan-600 rounded-3xl -rotate-12 shadow-2xl"  
        />
      </section>
    )
}