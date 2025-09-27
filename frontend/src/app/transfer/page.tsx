"use client";

import React, { useState } from "react";
import { BackgroundBeams } from "@/components/aceternity/background-beams";
import { FloatingNav } from "@/components/aceternity/floating-navbar";
import { HoverCard } from "@/components/aceternity/hover-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { 
  Package, 
  Zap, 
  ArrowRight, 
  User, 
  Calendar,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Send,
  Eye,
  Download,
  Store
} from "lucide-react";

const TransferPage = () => {
  const [transferData, setTransferData] = useState({
    batchId: "",
    recipientAddress: "",
    quantity: "",
    location: "",
    estimatedDelivery: "",
    notes: "",
  });

  const [activeTransfers] = useState([
    {
      id: "T-2024-001",
      batchNumber: "B-2024-001",
      drugName: "Acetaminophen 500mg",
      from: "PharmaCorp Industries",
      to: "MediStore Chain",
      quantity: 500,
      status: "in_transit",
      progress: 65,
      estimatedDelivery: "2024-12-18",
      trackingHash: "0x9a8b7c6d5e4f3g2h1i0j",
      lastUpdate: "2024-12-15 14:30",
    },
    {
      id: "T-2024-002",
      batchNumber: "B-2024-003",
      drugName: "Amoxicillin 250mg",
      from: "BioPharm Labs",
      to: "City Hospital",
      quantity: 200,
      status: "pending",
      progress: 0,
      estimatedDelivery: "2024-12-20",
      trackingHash: "0x1j0i2h3g4f5e6d7c8b9a",
      lastUpdate: "2024-12-15 09:15",
    },
    {
      id: "T-2024-003",
      batchNumber: "B-2024-002",
      drugName: "Ibuprofen 200mg",
      from: "MediTech Solutions",
      to: "Regional Pharmacy",
      quantity: 300,
      status: "delivered",
      progress: 100,
      estimatedDelivery: "2024-12-14",
      trackingHash: "0xa9b8c7d6e5f4g3h2i1j0",
      lastUpdate: "2024-12-14 16:45",
    },
  ]);

  const navItems = [
    { name: "Dashboard", link: "/dashboard", icon: <Package className="h-4 w-4" /> },
    { name: "Mint", link: "/mint", icon: <Plus className="h-4 w-4" /> },
    { name: "Inventory", link: "/inventory", icon: <Package className="h-4 w-4" /> },
    { name: "Transfer", link: "/transfer", icon: <Zap className="h-4 w-4" /> },
    { name: "Pharmacy", link: "/pharmacy", icon: <Store className="h-4 w-4" /> },
    { name: "Verify", link: "/verify", icon: <Shield className="h-4 w-4" /> },
  ];

  const handleInputChange = (field: string, value: string) => {
    setTransferData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement transfer logic
    console.log("Initiating transfer:", transferData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "in_transit":
        return <Clock className="h-4 w-4 text-blue-400" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default:
        return <Package className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-400 bg-green-400/10";
      case "in_transit":
        return "text-blue-400 bg-blue-400/10";
      case "pending":
        return "text-yellow-400 bg-yellow-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "from-green-500 to-green-600";
      case "in_transit":
        return "from-blue-500 to-purple-500";
      case "pending":
        return "from-yellow-500 to-orange-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

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
            Transfer Management
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Securely transfer pharmaceutical batches with real-time tracking and blockchain verification.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Transfer Form */}
          <HoverCard className="p-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Send className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Initiate Transfer</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="batchId" className="text-gray-300">Batch ID</Label>
                  <Select onValueChange={(value: string) => handleInputChange("batchId", value)}>
                    <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                      <SelectValue placeholder="Select batch to transfer" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white">
                      <SelectItem value="B-2024-001" className="text-white hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white">B-2024-001 - Acetaminophen 500mg</SelectItem>
                      <SelectItem value="B-2024-002" className="text-white hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white">B-2024-002 - Ibuprofen 200mg</SelectItem>
                      <SelectItem value="B-2024-004" className="text-white hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white">B-2024-004 - Metformin 500mg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientAddress" className="text-gray-300">Recipient Address</Label>
                  <Input
                    id="recipientAddress"
                    value={transferData.recipientAddress}
                    onChange={(e) => handleInputChange("recipientAddress", e.target.value)}
                    className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-400"
                    placeholder="0x742d35Cc6631C0532925a3b8D186aAd5c4b2c0aa"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-gray-300">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={transferData.quantity}
                      onChange={(e) => handleInputChange("quantity", e.target.value)}
                      className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-400"
                      placeholder="1000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedDelivery" className="text-gray-300">Est. Delivery</Label>
                    <Input
                      id="estimatedDelivery"
                      type="date"
                      value={transferData.estimatedDelivery}
                      onChange={(e) => handleInputChange("estimatedDelivery", e.target.value)}
                      className="bg-gray-900/50 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-300">Destination</Label>
                  <Input
                    id="location"
                    value={transferData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-400"
                    placeholder="Distribution Center, 123 Main St, City, State"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 text-lg"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Initiate Transfer
                </Button>
              </form>
            </motion.div>
          </HoverCard>

          {/* Transfer Stats */}
          <div className="space-y-6">
            <HoverCard className="p-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Transfer Statistics</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <p className="text-2xl font-bold text-blue-400">12</p>
                    <p className="text-gray-400 text-sm">Total Transfers</p>
                  </div>
                  <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <p className="text-2xl font-bold text-yellow-400">3</p>
                    <p className="text-gray-400 text-sm">In Transit</p>
                  </div>
                  <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <p className="text-2xl font-bold text-green-400">8</p>
                    <p className="text-gray-400 text-sm">Delivered</p>
                  </div>
                  <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <p className="text-2xl font-bold text-red-400">1</p>
                    <p className="text-gray-400 text-sm">Pending</p>
                  </div>
                </div>
              </motion.div>
            </HoverCard>

            <HoverCard className="p-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Security Features</h3>
                </div>

                <div className="space-y-3 text-gray-400">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <p>End-to-end blockchain verification</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-400" />
                    <p>Real-time location tracking</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-purple-400" />
                    <p>Tamper-proof documentation</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-pink-400" />
                    <p>Multi-signature validation</p>
                  </div>
                </div>
              </motion.div>
            </HoverCard>
          </div>
        </div>

        {/* Active Transfers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <HoverCard className="p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Active Transfers</h2>
            </div>

            <div className="space-y-6">
              {activeTransfers.map((transfer, index) => (
                <motion.div
                  key={transfer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border border-gray-700 rounded-lg p-6 hover:bg-gray-900/30 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{transfer.drugName}</h3>
                        <div className={`inline-flex items-center space-x-2 px-2 py-1 rounded-full text-xs ${getStatusColor(transfer.status)}`}>
                          {getStatusIcon(transfer.status)}
                          <span className="capitalize">{transfer.status.replace("_", " ")}</span>
                        </div>
                      </div>
                      
                      <p className="text-blue-400 text-sm mb-2">{transfer.batchNumber}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-400">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{transfer.from}</span>
                          <ArrowRight className="h-4 w-4" />
                          <span>{transfer.to}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4" />
                          <span>{transfer.quantity} units</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Est: {transfer.estimatedDelivery}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Progress</p>
                        <p className="text-lg font-semibold text-white">{transfer.progress}%</p>
                        <div className="w-32 bg-gray-700 rounded-full h-2 mt-1">
                          <div
                            className={`bg-gradient-to-r ${getProgressColor(transfer.status)} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${transfer.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="border-gray-700 text-black hover:bg-gray-800 hover:text-white hover:invert">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-gray-700 text-black hover:bg-gray-800 hover:text-white hover:invert">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </HoverCard>
        </motion.div>
      </div>
    </div>
  );
};

export default TransferPage;