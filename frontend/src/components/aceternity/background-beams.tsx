"use client";
import React from "react";
import { motion } from "framer-motion";

export const BackgroundBeams = () => {
  const beams = Array.from({ length: 8 }, (_, i) => i);
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      
      {beams.map((beam) => (
        <motion.div
          key={beam}
          className="absolute h-full w-px bg-gradient-to-b from-transparent via-scooter-400 to-transparent opacity-20"
          style={{
            left: `${(beam + 1) * 12.5}%`,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scaleY: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + beam * 0.5,
            repeat: Infinity,
            delay: beam * 0.3,
          }}
        />
      ))}
      
      {/* Animated grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:100px_100px]" />
      
      {/* Glow effects */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.6, 0.3, 0.6],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          delay: 1,
        }}
      />
    </div>
  );
};