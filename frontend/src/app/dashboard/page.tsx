"use client";
import React from "react";
import { motion } from "framer-motion";
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
    color: "from-blue-400 to-blue-600",
  },
  {
    title: "Active Transfers",
    value: "87",
    change: "+4.2%",
    icon: Truck,
    color: "from-cyan-400 to-cyan-600",
  },
  {
    title: "Verified Stakeholders",
    value: "342",
    change: "+8.1%",
    icon: Users,
    color: "from-indigo-400 to-indigo-600",
  },
  {
    title: "Security Score",
    value: "98.7%",
    change: "+0.3%",
    icon: Shield,
    color: "from-teal-400 to-teal-600",
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
    <div className="min-h-screen bg-slate-950 relative">
      {/* Lamp Background Effect - Fixed */}
      <div className="fixed inset-0 z-0">
        <div className="relative flex w-full h-full scale-y-125 items-center justify-center isolate z-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0.5, width: "15rem" }}
            animate={{ opacity: 1, width: "30rem" }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            style={{
              backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
            }}
            className="absolute inset-auto right-1/2 h-56 overflow-visible w-[30rem] bg-gradient-conic from-blue-500 via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top]"
          >
            <div className="absolute w-[100%] left-0 bg-slate-950 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
            <div className="absolute w-40 h-[100%] left-0 bg-slate-950 bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0.5, width: "15rem" }}
            animate={{ opacity: 1, width: "30rem" }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            style={{
              backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
            }}
            className="absolute inset-auto left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-blue-500 text-white [--conic-position:from_290deg_at_center_top]"
          >
            <div className="absolute w-40 h-[100%] right-0 bg-slate-950 bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
            <div className="absolute w-[100%] right-0 bg-slate-950 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          </motion.div>
          <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-slate-950 blur-2xl"></div>
          <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md"></div>
          <div className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-1/2 rounded-full bg-blue-500 opacity-50 blur-3xl"></div>
          <motion.div
            initial={{ width: "8rem" }}
            animate={{ width: "16rem" }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="absolute inset-auto z-30 h-36 w-64 -translate-y-[6rem] rounded-full bg-blue-400 blur-2xl"
          ></motion.div>
          <motion.div
            initial={{ width: "15rem" }}
            animate={{ width: "30rem" }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="absolute inset-auto z-50 h-0.5 w-[30rem] -translate-y-[7rem] bg-blue-400"
          ></motion.div>
          <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-slate-950"></div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10">
        <FloatingNav navItems={navItems} />
        
        <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent mb-2 pb-4">
              MediSeal Dashboard
            </h1>
            <p className="text-blue-100 text-lg">
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
                    <CardTitle className="text-sm font-medium text-blue-100">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} bg-opacity-30`}>
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <p className="text-xs text-blue-200">
                      <span className="text-cyan-300">{stat.change}</span> from last month
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
                  <Truck className="h-5 w-5 text-blue-400" />
                  Pharmaceutical Supply Chain Flow
                </CardTitle>
                <CardDescription className="text-blue-200">
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
                      <p className="text-xs text-blue-200">Manufacture & Create Batch</p>
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
                      <p className="text-xs text-blue-200">Warehouse Storage</p>
                    </div>
                  </Link>

                  <div className="hidden md:flex items-center justify-center">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-cyan-500 to-teal-500"></div>
                  </div>

                  <Link href="/transfer" className="group">
                    <div className="p-4 bg-gradient-to-br from-teal-500/10 to-teal-600/10 border border-teal-500/20 rounded-lg hover:border-teal-400/40 transition-all duration-300 text-center">
                      <div className="p-3 bg-teal-500/20 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap className="h-6 w-6 text-teal-400" />
                      </div>
                      <h3 className="font-semibold text-white mb-1 text-sm">3. Transfer</h3>
                      <p className="text-xs text-blue-200">Distribution Network</p>
                    </div>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <Link href="/pharmacy" className="group">
                    <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border border-indigo-500/20 rounded-lg hover:border-indigo-400/40 transition-all duration-300 text-center">
                      <div className="p-3 bg-indigo-500/20 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Store className="h-6 w-6 text-indigo-400" />
                      </div>
                      <h3 className="font-semibold text-white mb-1 text-sm">4. Pharmacy</h3>
                      <p className="text-xs text-blue-200">Retail & Prescription Dispensing</p>
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
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription className="text-blue-200 pb-4">
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
                    <CardDescription className="text-blue-200">
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
                              <p className="text-sm text-blue-200">
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
                            <p className="text-xs text-blue-200">{batch.quantity.toLocaleString()} units</p>
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
                      <Shield className="h-5 w-5 text-blue-400" />
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
                        <span className="text-blue-100">{service.service}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full bg-${service.color}-500`} />
                          <span className="text-sm text-blue-200 capitalize">{service.status}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </HoverCard>

                <HoverCard>
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-400" />
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
                        <div className="p-2 rounded-lg bg-blue-500/20">
                          <stakeholder.icon className="h-4 w-4 text-blue-300" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{stakeholder.count}</div>
                          <div className="text-xs text-blue-200">{stakeholder.type}</div>
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
    </div>
  );
}