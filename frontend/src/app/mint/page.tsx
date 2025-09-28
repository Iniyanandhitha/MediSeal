"use client";

import React, { useState } from "react";
import { LampHeader } from "@/components/aceternity/lamp-header";
import { FloatingNav } from "@/components/aceternity/floating-navbar";
import { HoverCard } from "@/components/aceternity/hover-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Plus, Package, CheckCircle2 as Calendar, User, Package as FileText, Shield, Plus as Upload, Zap, Store } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const MintPage = () => {
  const [formData, setFormData] = useState({
    drugName: "",
    batchNumber: "",
    quantity: "",
    manufacturingDate: "",
    expiryDate: "",
    manufacturer: "",
    description: "",
    category: "",
  });

  const [files, setFiles] = useState<File[]>([]);

  const navItems = [
    { name: "Dashboard", link: "/dashboard", icon: <Package className="h-4 w-4" /> },
    { name: "Mint", link: "/mint", icon: <Plus className="h-4 w-4" /> },
    { name: "Inventory", link: "/inventory", icon: <Package className="h-4 w-4" /> },
    { name: "Transfer", link: "/transfer", icon: <Zap className="h-4 w-4" /> },
    { name: "Pharmacy", link: "/pharmacy", icon: <Store className="h-4 w-4" /> },
    { name: "Verify", link: "/verify", icon: <Shield className="h-4 w-4" /> },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement minting logic
    console.log("Minting batch:", formData, files);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <FloatingNav navItems={navItems} />
      
      <LampHeader 
        title="Mint New Batch"
        subtitle="Create a new pharmaceutical batch with immutable blockchain verification and IPFS documentation storage."
        className="mb-8"
      />
      
      <div className="relative z-20 pb-16 px-4 max-w-6xl mx-auto">

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Minting Form */}
          <HoverCard className="p-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Batch Information</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="drugName" className="text-blue-100">Drug Name</Label>
                    <Input
                      id="drugName"
                      value={formData.drugName}
                      onChange={(e) => handleInputChange("drugName", e.target.value)}
                      className="bg-slate-900/50 border-blue-500/30 text-white placeholder-blue-300/50 focus:border-blue-400"
                      placeholder="Enter drug name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="batchNumber" className="text-blue-100">Batch Number</Label>
                    <Input
                      id="batchNumber"
                      value={formData.batchNumber}
                      onChange={(e) => handleInputChange("batchNumber", e.target.value)}
                      className="bg-slate-900/50 border-blue-500/30 text-white placeholder-blue-300/50 focus:border-blue-400"
                      placeholder="B-2024-001"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-blue-100">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange("quantity", e.target.value)}
                      className="bg-slate-900/50 border-blue-500/30 text-white placeholder-blue-300/50 focus:border-blue-400"
                      placeholder="1000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-blue-100">Category</Label>
                    <Select onValueChange={(value: string) => handleInputChange("category", value)}>
                      <SelectTrigger className="bg-slate-900/50 border-blue-500/30 text-white focus:border-blue-400">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-blue-500/30">
                        <SelectItem value="prescription">Prescription</SelectItem>
                        <SelectItem value="otc">Over-the-Counter</SelectItem>
                        <SelectItem value="controlled">Controlled Substance</SelectItem>
                        <SelectItem value="vaccine">Vaccine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manufacturingDate" className="text-blue-100">Manufacturing Date</Label>
                    <Input
                      id="manufacturingDate"
                      type="date"
                      value={formData.manufacturingDate}
                      onChange={(e) => handleInputChange("manufacturingDate", e.target.value)}
                      className="bg-slate-900/50 border-blue-500/30 text-white focus:border-blue-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiryDate" className="text-blue-100">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                      className="bg-slate-900/50 border-blue-500/30 text-white focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufacturer" className="text-blue-100">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => handleInputChange("manufacturer", e.target.value)}
                    className="bg-slate-900/50 border-blue-500/30 text-white placeholder-blue-300/50 focus:border-blue-400"
                    placeholder="PharmaCorp Industries"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-blue-100">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
                    className="bg-slate-900/50 border-blue-500/30 text-white placeholder-blue-300/50 focus:border-blue-400"
                    placeholder="Enter batch description, ingredients, and any additional notes..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documents" className="text-blue-100">Upload Documents</Label>
                  <div className="border-2 border-dashed border-blue-500/30 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                    <p className="text-blue-200 mb-2">Drop files here or click to upload</p>
                    <Input
                      id="documents"
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="bg-slate-900/50 border-blue-500/30 text-white file:bg-blue-500 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 pb-4"
                    />
                  </div>
                  {files.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-blue-200">Selected files:</p>
                      {files.map((file, index) => (
                        <p key={index} className="text-sm text-blue-400">{file.name}</p>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white font-medium py-3 text-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Mint Batch
                </Button>
              </form>
            </motion.div>
          </HoverCard>

          {/* Preview and Info */}
          <div className="space-y-6">
            <HoverCard className="p-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Batch Preview</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-blue-500/30">
                    <h4 className="font-semibold text-blue-400 mb-2">Blockchain Hash</h4>
                    <p className="text-blue-200 font-mono text-sm">Will be generated after minting</p>
                  </div>

                  <div className="p-4 bg-slate-900/50 rounded-lg border border-blue-500/30">
                    <h4 className="font-semibold text-purple-400 mb-2">IPFS Hash</h4>
                    <p className="text-blue-200 font-mono text-sm">Documents will be stored on IPFS</p>
                  </div>

                  <div className="p-4 bg-slate-900/50 rounded-lg border border-blue-500/30">
                    <h4 className="font-semibold text-teal-400 mb-2">Verification Status</h4>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-teal-400" />
                      <span className="text-blue-200">Pending verification</span>
                    </div>
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
                  <div className="p-3 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Minting Guidelines</h3>
                </div>

                <div className="space-y-3 text-blue-200">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-blue-400 mt-0.5" />
                    <p>Ensure manufacturing and expiry dates are accurate</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-teal-400 mt-0.5" />
                    <p>Upload all relevant compliance documents</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-purple-400 mt-0.5" />
                    <p>Batch data will be immutably stored on blockchain</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Zap className="h-5 w-5 text-cyan-400 mt-0.5" />
                    <p>Minting process may take 30-60 seconds</p>
                  </div>
                </div>
              </motion.div>
            </HoverCard>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProtectedMintPage = () => {
  return (
    <ProtectedRoute 
      pageName="mint" 
      onLoginRequired={() => {}}
    >
      <MintPage />
    </ProtectedRoute>
  );
};

export default ProtectedMintPage;