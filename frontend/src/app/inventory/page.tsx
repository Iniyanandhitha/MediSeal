"use client";

import React, { useState } from "react";
import { BackgroundBeams } from "@/components/aceternity/background-beams";
import { FloatingNav } from "@/components/aceternity/floating-navbar";
import { HoverCard } from "@/components/aceternity/hover-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { 
  Package, 
  Search, 
  Eye, 
  Download, 
  Calendar,
  MapPin,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Zap,
  Store
} from "lucide-react";

const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const navItems = [
    { name: "Dashboard", link: "/dashboard", icon: <Package className="h-4 w-4" /> },
    { name: "Mint", link: "/mint", icon: <Plus className="h-4 w-4" /> },
    { name: "Inventory", link: "/inventory", icon: <Package className="h-4 w-4" /> },
    { name: "Transfer", link: "/transfer", icon: <Zap className="h-4 w-4" /> },
    { name: "Pharmacy", link: "/pharmacy", icon: <Store className="h-4 w-4" /> },
    { name: "Verify", link: "/verify", icon: <Shield className="h-4 w-4" /> },
  ];

  // Mock inventory data
  const inventoryData = [
    {
      id: "B-2024-001",
      drugName: "Acetaminophen 500mg",
      batchNumber: "B-2024-001",
      quantity: 5000,
      remaining: 4750,
      manufacturer: "PharmaCorp Industries",
      location: "Warehouse A-12",
      status: "active",
      manufacturingDate: "2024-01-15",
      expiryDate: "2026-01-15",
      blockchainHash: "0x7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730",
      ipfsHash: "QmY7Yh4UquoXHLPFo2XbhXkhBvFoPwmQUSa92pxnxjQuPU",
      lastUpdated: "2024-12-15",
    },
    {
      id: "B-2024-002",
      drugName: "Ibuprofen 200mg",
      batchNumber: "B-2024-002",
      quantity: 3000,
      remaining: 2100,
      manufacturer: "MediTech Solutions",
      location: "Warehouse B-5",
      status: "low_stock",
      manufacturingDate: "2024-02-10",
      expiryDate: "2026-02-10",
      blockchainHash: "0x8e976f960c3577829d4e88297d4b9f6e77c4ed9bd1d00caafd4850616ded88841",
      ipfsHash: "QmZ8Zi5VqzpXILQGp3XcUYkCwGuJSDa93qyooxkQuQV",
      lastUpdated: "2024-12-14",
    },
    {
      id: "B-2024-003",
      drugName: "Amoxicillin 250mg",
      batchNumber: "B-2024-003",
      quantity: 1500,
      remaining: 150,
      manufacturer: "BioPharm Labs",
      location: "Warehouse C-3",
      status: "critical",
      manufacturingDate: "2024-03-05",
      expiryDate: "2025-12-31",
      blockchainHash: "0x9f087g071d4688940e5f99408e5c0g7f88d5fe0ce2e11dbbge4961727efe99952",
      ipfsHash: "QmA9Aj6WtmTJMLRHq4YdHZkDxGuKTEb94ryznrlRvR",
      lastUpdated: "2024-12-13",
    },
    {
      id: "B-2024-004",
      drugName: "Metformin 500mg",
      batchNumber: "B-2024-004",
      quantity: 8000,
      remaining: 7200,
      manufacturer: "DiabetesCare Inc",
      location: "Warehouse A-8",
      status: "active",
      manufacturingDate: "2024-04-20",
      expiryDate: "2027-04-20",
      blockchainHash: "0xa0198h182e5799051f6aa519f6d1h8g99e6gf1df3f22eccch5072838fgf00a63",
      ipfsHash: "QmB0Bk7YumUKOMSIr5ZeIalExHyLUFc05szaorSsS",
      lastUpdated: "2024-12-15",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "low_stock":
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default:
        return <Package className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400 bg-green-400/10";
      case "low_stock":
        return "text-yellow-400 bg-yellow-400/10";
      case "critical":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const filteredInventory = inventoryData.filter(item => {
    const matchesSearch = item.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || item.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <BackgroundBeams />
      <FloatingNav navItems={navItems} />
      
      <div className="relative z-20 pt-32 pb-16 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6 pb-4">
            Inventory Management
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Track and manage your pharmaceutical inventory with real-time blockchain verification and comprehensive analytics.
          </p>
        </motion.div>

        {/* Search and Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <HoverCard className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by drug name, batch number, or manufacturer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  onClick={() => setFilterStatus("all")}
                  className={filterStatus === "all" ? "bg-blue-500 hover:bg-blue-600" : "border-gray-700 text-black hover:bg-gray-800"}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === "active" ? "default" : "outline"}
                  onClick={() => setFilterStatus("active")}
                  className={filterStatus === "active" ? "bg-green-500 hover:bg-green-600" : "border-gray-700 text-black hover:bg-gray-800"}
                >
                  Active
                </Button>
                <Button
                  variant={filterStatus === "low_stock" ? "default" : "outline"}
                  onClick={() => setFilterStatus("low_stock")}
                  className={filterStatus === "low_stock" ? "bg-yellow-500 hover:bg-yellow-600" : "border-gray-700 text-black hover:bg-gray-800"}
                >
                  Low Stock
                </Button>
                <Button
                  variant={filterStatus === "critical" ? "default" : "outline"}
                  onClick={() => setFilterStatus("critical")}
                  className={filterStatus === "critical" ? "bg-red-500 hover:bg-red-600" : "border-gray-700 text-black hover:bg-gray-800"}
                >
                  Critical
                </Button>
              </div>
            </div>
          </HoverCard>
        </motion.div>

        {/* Inventory Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <HoverCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Batches</p>
                <p className="text-2xl font-bold text-white">{inventoryData.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-400" />
            </div>
          </HoverCard>

          <HoverCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Stock</p>
                <p className="text-2xl font-bold text-green-400">
                  {inventoryData.filter(item => item.status === "active").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </HoverCard>

          <HoverCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {inventoryData.filter(item => item.status === "low_stock").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </HoverCard>

          <HoverCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Critical</p>
                <p className="text-2xl font-bold text-red-400">
                  {inventoryData.filter(item => item.status === "critical").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </HoverCard>
        </motion.div>

        {/* Inventory Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <HoverCard className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-2 text-gray-400 font-medium">Batch Info</th>
                    <th className="text-left py-4 px-2 text-gray-400 font-medium">Stock</th>
                    <th className="text-left py-4 px-2 text-gray-400 font-medium">Location</th>
                    <th className="text-left py-4 px-2 text-gray-400 font-medium">Dates</th>
                    <th className="text-left py-4 px-2 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-4 px-2 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border-b border-gray-800 hover:bg-gray-900/30"
                    >
                      <td className="py-4 px-2">
                        <div>
                          <p className="font-semibold text-white">{item.drugName}</p>
                          <p className="text-sm text-blue-400">{item.batchNumber}</p>
                          <p className="text-xs text-gray-400">{item.manufacturer}</p>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div>
                          <p className="text-white">{item.remaining.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">of {item.quantity.toLocaleString()}</p>
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                              style={{ width: `${(item.remaining / item.quantity) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300">{item.location}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div>
                          <div className="flex items-center space-x-1 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            <span>Mfg: {item.manufacturingDate}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-400 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>Exp: {item.expiryDate}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className={`inline-flex items-center space-x-2 px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          <span className="capitalize">{item.status.replace("_", " ")}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="border-gray-700 text-black hover:bg-gray-800 hover:text-white hover:invert">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-gray-700 text-black hover:bg-gray-800 hover:text-white hover:invert">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </HoverCard>
        </motion.div>
      </div>
    </div>
  );
};

export default InventoryPage;