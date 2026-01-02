"use client"

import { motion } from "framer-motion"
import { GiHolosphere } from "react-icons/gi"
import Image from "next/image"
import { MorphingLoginButton } from "./MorphingLoginButton"


export function HeroSection({ loginFormOpen, setLoginFormOpen }) {
    return (
        <section id="about" className="h-screen w-full relative overflow-hidden">
            {/* Left side gradient - rotated 90 degrees right (pointing right) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 0% 50%, rgba(74, 222, 128, 0.4) 0%, transparent 60%),
                        radial-gradient(circle at 0% 50%, rgba(34, 197, 94, 0.4) 0%, transparent 70%),
                        radial-gradient(circle at 0% 50%, rgba(240, 253, 244, 0.5) 0%, transparent 80%)
                    `,
                }}
            />
            {/* Right side gradient - rotated 90 degrees left (pointing left) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 100% 50%, rgba(74, 222, 128, 0.4) 0%, transparent 60%),
                        radial-gradient(circle at 100% 50%, rgba(34, 197, 94, 0.4) 0%, transparent 70%),
                        radial-gradient(circle at 100% 50%, rgba(240, 253, 244, 0.5) 0%, transparent 80%)
                    `,
                }}
            />

            <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 md:px-8">
                <div className="text-center w-full max-w-6xl mx-auto space-y-8 md:space-y-12">
                    {/* Icon + agroverse */}
                    <div className="overflow-hidden">
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="flex items-center justify-center gap-3 md:gap-4"
                        >
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    delay: 0.6,
                                    duration: 0.6,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            >
                                <GiHolosphere 
                                    className="text-green-400 drop-shadow-[0_8px_8px_rgba(34,197,94,0.4)] -rotate-45" 
                                    style={{ width: "clamp(3rem, 8vw, 6rem)", height: "clamp(3rem, 8vw, 6rem)" }} 
                                />
                            </motion.span>
                            
                            <motion.h1
                                className="text-stone-800"
                                style={{ 
                                    fontFamily: "'Prosto One', sans-serif",
                                    fontWeight: "bold",
                                    fontSize: "clamp(2.5rem, 8vw, 5rem)",
                                    lineHeight: 1
                                }}
                            >
                                {["agroverse"].map((word, wordIndex) => (
                                    <span key={wordIndex}>
                                        {word.split("").map((char, charIndex) => (
                                            <motion.span
                                                key={charIndex}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: 0.7 + charIndex * 0.03,
                                                    duration: 0.4,
                                                    ease: [0.22, 1, 0.36, 1],
                                                }}
                                                className="inline-block"
                                            >
                                                {char}
                                            </motion.span>
                                        ))}
                                    </span>
                                ))}
                            </motion.h1>
                        </motion.div>
                    </div>

                    {/* Smart Farming Companion for MODERN Farmers */}
                    <div className="overflow-hidden">
                        <motion.h2
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="text-stone-700 lg:whitespace-nowrap"
                            style={{ 
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "clamp(1.25rem, 4vw, 2.5rem)",
                                lineHeight: 1.3
                            }}
                        >
                            {["Smart", " ", "Farming", " ", "Companion", " ", "for", " ", "MODERN", " ", "Farmers"].map((word, wordIndex) => (
                                <motion.span
                                    key={wordIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: 1.3 + wordIndex * 0.08,
                                        duration: 0.4,
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                    className="inline-block"
                                    style={{
                                        fontWeight: word === "MODERN" ? "800" : "normal",
                                    }}
                                >
                                    {word === " " ? "\u00A0" : word}
                                </motion.span>
                            ))}
                        </motion.h2>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3.0, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute bottom-[8%] md:bottom-[10%] left-1/2 -translate-x-1/2"
                >
                    <MorphingLoginButton 
                        externalOpen={loginFormOpen}
                        onExternalOpenChange={setLoginFormOpen}
                    />
                </motion.div>
            </div>
        </section>
    )
}
