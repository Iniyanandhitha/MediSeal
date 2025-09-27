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
  Store, 
  Pill,
  UserCheck,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Zap,
  QrCode,
  Users,
  Truck,
  FileText,
  Search,
  Eye
} from "lucide-react";

const PharmacyPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const navItems = [
    { name: "Dashboard", link: "/dashboard", icon: <Package className="h-4 w-4" /> },
    { name: "Mint", link: "/mint", icon: <Plus className="h-4 w-4" /> },
    { name: "Inventory", link: "/inventory", icon: <Package className="h-4 w-4" /> },
    { name: "Transfer", link: "/transfer", icon: <Zap className="h-4 w-4" /> },
    { name: "Pharmacy", link: "/pharmacy", icon: <Store className="h-4 w-4" /> },
    { name: "Verify", link: "/verify", icon: <Shield className="h-4 w-4" /> },
  ];

  // Mock pharmacy inventory data
  const pharmacyInventory = [
    {
      id: "B-2024-001",
      drugName: "Acetaminophen 500mg",
      batchNumber: "B-2024-001",
      received: 250,
      dispensed: 45,
      remaining: 205,
      expiryDate: "2026-01-15",
      supplier: "PharmaCorp Industries",
      receivedDate: "2024-12-10",
      status: "active",
      prescriptionsActive: 12,
    },
    {
      id: "B-2024-002",
      drugName: "Ibuprofen 200mg",
      batchNumber: "B-2024-002",
      received: 180,
      dispensed: 95,
      remaining: 85,
      expiryDate: "2026-02-10",
      supplier: "MediTech Solutions",
      receivedDate: "2024-12-08",
      status: "low_stock",
      prescriptionsActive: 8,
    },
    {
      id: "B-2024-003",
      drugName: "Amoxicillin 250mg",
      batchNumber: "B-2024-003",
      received: 100,
      dispensed: 88,
      remaining: 12,
      expiryDate: "2025-12-31",
      supplier: "BioPharm Labs",
      receivedDate: "2024-12-05",
      status: "critical",
      prescriptionsActive: 3,
    },
  ];

  // Mock recent dispensations
  const recentDispensations = [
    {
      id: "RX-001",
      patientId: "P-12345",
      drugName: "Acetaminophen 500mg",
      batchNumber: "B-2024-001",
      quantity: 30,
      prescribedBy: "Dr. Smith",
      dispensedDate: "2024-12-15 14:30",
      pharmacist: "Jane Doe",
    },
    {
      id: "RX-002",
      patientId: "P-67890",
      drugName: "Ibuprofen 200mg",
      batchNumber: "B-2024-002",
      quantity: 20,
      prescribedBy: "Dr. Johnson",
      dispensedDate: "2024-12-15 13:15",
      pharmacist: "Mike Wilson",
    },
    {
      id: "RX-003",
      patientId: "P-54321",
      drugName: "Amoxicillin 250mg",
      batchNumber: "B-2024-003",
      quantity: 14,
      prescribedBy: "Dr. Brown",
      dispensedDate: "2024-12-15 11:45",
      pharmacist: "Sarah Connor",
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

  const handleDispensation = (batchId: string) => {
    // TODO: Implement dispensation logic
    alert(`Dispensing medication from batch ${batchId}`);
  };

  const filteredInventory = pharmacyInventory.filter(item =>
    item.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 pb-4">
            Pharmacy Management
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Manage pharmaceutical inventory, dispense medications, and track patient prescriptions with blockchain verification.
          </p>
        </motion.div>

        {/* Pharmacy Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <HoverCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Available Drugs</p>
                <p className="text-2xl font-bold text-white">{pharmacyInventory.length}</p>
              </div>
              <Pill className="h-8 w-8 text-blue-400" />
            </div>
          </HoverCard>

          <HoverCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Todays Dispensations</p>
                <p className="text-2xl font-bold text-green-400">{recentDispensations.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-400" />
            </div>
          </HoverCard>

          <HoverCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Prescriptions</p>
                <p className="text-2xl font-bold text-purple-400">
                  {pharmacyInventory.reduce((sum, item) => sum + item.prescriptionsActive, 0)}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-400" />
            </div>
          </HoverCard>

          <HoverCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-400">
                  {pharmacyInventory.filter(item => item.status === "low_stock" || item.status === "critical").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </HoverCard>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Pharmacy Inventory */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <HoverCard className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      <Store className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Pharmacy Inventory</h2>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search medications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 w-64"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredInventory.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border border-gray-700 rounded-lg p-4 hover:bg-gray-900/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{item.drugName}</h3>
                            <div className={`inline-flex items-center space-x-2 px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                              {getStatusIcon(item.status)}
                              <span className="capitalize">{item.status.replace("_", " ")}</span>
                            </div>
                          </div>
                          
                          <p className="text-blue-400 text-sm mb-2">{item.batchNumber}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                            <div>
                              <p className="text-gray-500">Received</p>
                              <p className="text-white font-medium">{item.received}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Dispensed</p>
                              <p className="text-white font-medium">{item.dispensed}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Remaining</p>
                              <p className="text-white font-medium">{item.remaining}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Active Rx</p>
                              <p className="text-white font-medium">{item.prescriptionsActive}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-6 mt-3 text-xs text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>Exp: {item.expiryDate}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Truck className="h-3 w-3" />
                              <span>From: {item.supplier}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>Received: {item.receivedDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          <Button
                            size="sm"
                            onClick={() => handleDispensation(item.id)}
                            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                          >
                            <Pill className="h-4 w-4 mr-2" />
                            Dispense
                          </Button>
                          <Button size="sm" variant="outline" className="border-gray-700 text-black hover:bg-gray-800 hover:text-white hover:invert">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Stock Level Indicator */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Stock Level</span>
                          <span>{Math.round((item.remaining / item.received) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.status === "critical" 
                                ? "bg-gradient-to-r from-red-500 to-red-600"
                                : item.status === "low_stock"
                                ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                                : "bg-gradient-to-r from-green-500 to-blue-500"
                            }`}
                            style={{ width: `${(item.remaining / item.received) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </HoverCard>
            </motion.div>
          </div>

          {/* Recent Dispensations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <HoverCard className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Recent Dispensations</h3>
              </div>

              <div className="space-y-4">
                {recentDispensations.map((dispensation, index) => (
                  <motion.div
                    key={dispensation.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 bg-gray-900/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-white">{dispensation.drugName}</p>
                        <p className="text-sm text-blue-400">{dispensation.batchNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">{dispensation.quantity} units</p>
                        <p className="text-xs text-gray-500">{dispensation.dispensedDate}</p>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>Patient: {dispensation.patientId}</p>
                      <p>Prescribed by: {dispensation.prescribedBy}</p>
                      <p>Pharmacist: {dispensation.pharmacist}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </HoverCard>
          </motion.div>
        </div>

        {/* Quick Actions for Pharmacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <HoverCard className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Pharmacy Actions</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 text-white"
              >
                <QrCode className="h-6 w-6" />
                <span className="text-xs">Scan Prescription</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 text-white"
              >
                <Users className="h-6 w-6" />
                <span className="text-xs">Patient Lookup</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 text-white"
              >
                <FileText className="h-6 w-6" />
                <span className="text-xs">Generate Report</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 text-white"
              >
                <Shield className="h-6 w-6" />
                <span className="text-xs">Verify Batch</span>
              </Button>
            </div>
          </HoverCard>
        </motion.div>
      </div>
    </div>
  );
};

export default PharmacyPage;