"use client";

import { useState } from "react";
import Confetti from "react-confetti";

export default function WaitlistPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

    const handleSubmit = async (e:React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        await fetch("/api/waitlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        setStatus("success");
    };

    return (
        <>
            {status === "success" && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />}
            <section className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-900 via-black to-blue-900">
                <div className="text-center px-6 max-w-2x1">
                    <h1 className="text-6x1 md:text-8x1 font-black text-white mb-8">Lumora</h1>
                    <p className="text-2x1 md:text-4xl text-white/90 mb-12">Launching Q1 2026</p>

                    {status !== "success" ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <input 
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full max-w-md mx-auto px-8 py-5 text-x1 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-white"
                                placeholder="you@company.com" 
                            />
                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="w-full max-w-md mx-auto block px-12 py-6 bg-white text-black font-bold text-x1 rounded-2x1 hover:scale-105 transition shadow-2x1"
                            >
                                {status === "loading" ? "Joining..." : "Get Early Access"}
                            </button>
                        </form>
                    ) : (
                        <div className="text-4x1 font-bold text-white">
                            You&apos;re in! Check your email soon
                        </div>
                    )}

                    <p className="mt-12 text-white/60">Be the first to try Lumora before anyone else</p>
                </div>
            </section>
        </>
    )
}