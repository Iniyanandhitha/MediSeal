"use client";
import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
}

export const HoverCard = ({ children, className }: HoverCardProps) => {
  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        rotateY: 5,
        rotateX: 5,
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      className="transform-gpu"
    >
      <Card
        className={`
          relative overflow-hidden 
          bg-gradient-to-br from-slate-900/90 to-slate-800/90 
          border border-slate-700/50 
          backdrop-blur-xl 
          shadow-2xl 
          group
          ${className}
        `}
      >
        {/* Animated border gradient */}
        <div className="absolute inset-0 rounded-lg p-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="h-full w-full rounded-lg bg-slate-900" />
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
        
        {/* Content */}
        <div className="relative z-10 h-full">
          {children}
        </div>
        
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
        />
      </Card>
    </motion.div>
  );
};