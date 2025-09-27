"use client";

import React from "react";
import { WavyBackground } from "@/components/ui/wavy-background";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Package, Zap, Eye } from "lucide-react";
import Link from "next/link";

const HomePage = () => {
  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Blockchain Security",
      description: "Immutable records with cryptographic verification for pharmaceutical authenticity."
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: "Supply Chain Tracking",
      description: "End-to-end visibility from manufacturing to final delivery."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Instant Transfers",
      description: "Secure and transparent pharmaceutical batch transfers between stakeholders."
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: "Real-time Verification",
      description: "Verify drug authenticity instantly using QR codes or batch numbers."
    }
  ];

  return (
    <WavyBackground 
      className="w-full"
      containerClassName="min-h-screen flex flex-col items-center justify-center"
    >
      <div className="relative z-20 flex flex-col items-center justify-center w-full px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center max-w-6xl mx-auto mb-8"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">
            MediSeal
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed">
            Revolutionizing pharmaceutical supply chain management with blockchain technology, 
            IPFS storage, and real-time verification for enhanced security and transparency.
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          >
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium px-8 py-4 text-lg">
                Launch Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/verify">
              <Button variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:border-white/50 px-8 py-4 text-lg backdrop-blur-sm">
                Verify Product
                <Shield className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              className="bg-gray-900/70 backdrop-blur-md border border-gray-600 rounded-xl p-4 hover:bg-gray-800/70 hover:border-gray-500 transition-all duration-300 group"
            >
              <div className="text-blue-400 mb-3 group-hover:text-purple-400 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-400 text-sm">
            Powered by Ethereum • IPFS • Next.js • Web3 Technologies
          </p>
        </motion.div>
      </div>
    </WavyBackground>
  );
};

export default HomePage;
