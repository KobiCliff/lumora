"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Sparkles } from "lucide-react";

export default function Features() {
  return (
      <section className="py-32 bg-black">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          {[
            { icon: Zap, title: "Blazing Fast", desc: "Built with Next.js + React Server Components" },
            { icon: Shield, title: "Secure by Default", desc: "End-to-end encryption, SOC 2 compliant" },
            { icon: Sparkles, title: "Beautiful Out The Box", desc: "Design that makes your users say wow" },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y:0 }}
              transition={{ delay: i * 0.2 }}
              className="text-center"
            >
              <f.icon className="w-16 h-16 mx-auto mb-6 text-purple-400" />
              <h3 className="text-3xl font-bold text-white mb-4">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
  );
}