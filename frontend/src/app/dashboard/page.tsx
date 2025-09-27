"use client";
import React from "react";
import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/aceternity/background-beams";
import { FloatingNav } from "@/components/aceternity/floating-navbar";
import { HoverCard } from "@/components/aceternity/hover-card";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Package, 
  Truck, 
  Shield, 
  Users, 
  BarChart3, 
  Factory,
  Store,
  CheckCircle2,
  Plus,
  Zap,
  FlaskConical,
  TrendingUp
} from "lucide-react";

  const navItems = [
    { name: "Dashboard", link: "/dashboard", icon: <Package className="h-4 w-4" /> },
    { name: "Mint", link: "/mint", icon: <Plus className="h-4 w-4" /> },
    { name: "Inventory", link: "/inventory", icon: <Package className="h-4 w-4" /> },
    { name: "Transfer", link: "/transfer", icon: <Zap className="h-4 w-4" /> },
    { name: "Laboratory", link: "/laboratory", icon: <FlaskConical className="h-4 w-4" /> },
    { name: "Pharmacy", link: "/pharmacy", icon: <Store className="h-4 w-4" /> },
    { name: "Verify", link: "/verify", icon: <Shield className="h-4 w-4" /> },
    { name: "Analytics", link: "/analytics", icon: <TrendingUp className="h-4 w-4" /> },
  ];

const statsCards = [
  {
    title: "Total Batches",
    value: "1,247",
    change: "+12.5%",
    icon: Package,
    color: "from-blue-500 to-blue-700",
  },
  {
    title: "Active Transfers",
    value: "87",
    change: "+4.2%",
    icon: Truck,
    color: "from-green-500 to-green-700",
  },
  {
    title: "Verified Stakeholders",
    value: "342",
    change: "+8.1%",
    icon: Users,
    color: "from-purple-500 to-purple-700",
  },
  {
    title: "Security Score",
    value: "98.7%",
    change: "+0.3%",
    icon: Shield,
    color: "from-red-500 to-red-700",
  },
];

const recentBatches = [
  {
    id: "PH-2025-001",
    drug: "Aspirin 500mg",
    status: "In Transit",
    manufacturer: "PharmaCorp",
    expiry: "2026-12-31",
    quantity: 10000,
  },
  {
    id: "PH-2025-002", 
    drug: "Ibuprofen 200mg",
    status: "Delivered",
    manufacturer: "MediTech",
    expiry: "2027-06-15",
    quantity: 5000,
  },
  {
    id: "PH-2025-003",
    drug: "Paracetamol 500mg", 
    status: "Manufacturing",
    manufacturer: "HealthLabs",
    expiry: "2026-09-20",
    quantity: 15000,
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen relative">
      <BackgroundBeams />
      
      <FloatingNav navItems={navItems} />
      
      <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2 pb-4">
              MediSeal Dashboard
            </h1>
            <p className="text-gray-400 text-lg">
              Pharmaceutical Supply Chain Management System
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <HoverCard>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} bg-opacity-20`}>
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <p className="text-xs text-gray-400">
                      <span className="text-green-400">{stat.change}</span> from last month
                    </p>
                  </CardContent>
                </HoverCard>
              </motion.div>
            ))}
          </div>

          {/* Supply Chain Flow Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <HoverCard>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Pharmaceutical Supply Chain Flow
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Complete flow from manufacturing to consumer verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Link href="/mint" className="group">
                    <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg hover:border-blue-400/40 transition-all duration-300 text-center">
                      <div className="p-3 bg-blue-500/20 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="h-6 w-6 text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-white mb-1 text-sm">1. Mint</h3>
                      <p className="text-xs text-gray-400">Manufacture & Create Batch</p>
                    </div>
                  </Link>

                  <div className="hidden md:flex items-center justify-center">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                  </div>

                  <Link href="/inventory" className="group">
                    <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 rounded-lg hover:border-cyan-400/40 transition-all duration-300 text-center">
                      <div className="p-3 bg-cyan-500/20 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Package className="h-6 w-6 text-cyan-400" />
                      </div>
                      <h3 className="font-semibold text-white mb-1 text-sm">2. Inventory</h3>
                      <p className="text-xs text-gray-400">Warehouse Storage</p>
                    </div>
                  </Link>

                  <div className="hidden md:flex items-center justify-center">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-cyan-500 to-green-500"></div>
                  </div>

                  <Link href="/transfer" className="group">
                    <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg hover:border-green-400/40 transition-all duration-300 text-center">
                      <div className="p-3 bg-green-500/20 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap className="h-6 w-6 text-green-400" />
                      </div>
                      <h3 className="font-semibold text-white mb-1 text-sm">3. Transfer</h3>
                      <p className="text-xs text-gray-400">Distribution Network</p>
                    </div>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <Link href="/pharmacy" className="group">
                    <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-lg hover:border-orange-400/40 transition-all duration-300 text-center">
                      <div className="p-3 bg-orange-500/20 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Store className="h-6 w-6 text-orange-400" />
                      </div>
                      <h3 className="font-semibold text-white mb-1 text-sm">4. Pharmacy</h3>
                      <p className="text-xs text-gray-400">Retail & Prescription Dispensing</p>
                    </div>
                  </Link>

                  <Link href="/verify" className="group">
                    <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg hover:border-purple-400/40 transition-all duration-300 text-center">
                      <div className="p-3 bg-purple-500/20 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Shield className="h-6 w-6 text-purple-400" />
                      </div>
                      <h3 className="font-semibold text-white mb-1 text-sm">5. Consumer/Verify</h3>
                      <p className="text-xs text-gray-400">End Consumer Authentication</p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </HoverCard>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <HoverCard className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription className="text-gray-400 pb-4">
                      Common pharmaceutical supply chain operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      {[
                        { icon: Package, label: "Mint Batch", color: "blue", link: "/mint" },
                        { icon: Package, label: "Inventory", color: "purple", link: "/inventory" },
                        { icon: Truck, label: "Transfer", color: "green", link: "/transfer" },
                        { icon: FlaskConical, label: "Laboratory", color: "cyan", link: "/laboratory" },
                        { icon: Store, label: "Pharmacy", color: "orange", link: "/pharmacy" },
                        { icon: Shield, label: "Verify", color: "red", link: "/verify" },
                      ].map((action) => (
                        <motion.div
                          key={action.label}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Link href={action.link}>
                            <Button
                              variant="outline"
                              className="h-20 w-full flex-col gap-2 transition-all duration-300 hover:scale-105"
                            >
                              <action.icon className="h-6 w-6" />
                              <span className="text-xs">{action.label}</span>
                            </Button>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </HoverCard>

                {/* Recent Batches */}
                <HoverCard>
                  <CardHeader>
                    <CardTitle className="text-white">Recent Batches</CardTitle>
                    <CardDescription className="text-gray-400">
                      Latest pharmaceutical batch activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentBatches.map((batch, index) => (
                        <motion.div
                          key={batch.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-700/50"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                              <Package className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-white">{batch.drug}</h4>
                              <p className="text-sm text-gray-400">
                                {batch.id} • {batch.manufacturer}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={batch.status === "Delivered" ? "default" : "secondary"}
                              className="mb-1"
                            >
                              {batch.status}
                            </Badge>
                            <p className="text-xs text-gray-400">{batch.quantity.toLocaleString()} units</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </HoverCard>
              </motion.div>
            </div>

            {/* Right Column */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <HoverCard className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { service: "Blockchain", status: "online", color: "green" },
                      { service: "IPFS Network", status: "online", color: "green" },
                      { service: "API Gateway", status: "online", color: "green" },
                      { service: "Database", status: "maintenance", color: "yellow" },
                    ].map((service) => (
                      <div key={service.service} className="flex items-center justify-between">
                        <span className="text-gray-300">{service.service}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full bg-${service.color}-500`} />
                          <span className="text-sm text-gray-400 capitalize">{service.status}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </HoverCard>

                <HoverCard>
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Stakeholder Network
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { type: "Manufacturers", count: 45, icon: Factory },
                      { type: "Distributors", count: 128, icon: Truck },
                      { type: "Pharmacies", count: 289, icon: Store },
                      { type: "Regulators", count: 8, icon: CheckCircle2 },
                    ].map((stakeholder) => (
                      <div key={stakeholder.type} className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-700/50">
                          <stakeholder.icon className="h-4 w-4 text-gray-300" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{stakeholder.count}</div>
                          <div className="text-xs text-gray-400">{stakeholder.type}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </HoverCard>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}