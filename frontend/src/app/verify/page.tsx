"use client";

import React, { useState } from "react";
import { BackgroundBeams } from "@/components/aceternity/background-beams";
import { FloatingNav } from "@/components/aceternity/floating-navbar";
import { HoverCard } from "@/components/aceternity/hover-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QRScannerModal } from "@/components/qr-scanner-modal";
import { motion } from "framer-motion";
import { 
  Shield, 
  Search, 
  CheckCircle, 
  AlertTriangle,
  Package,
  FileText,
  ExternalLink,
  Copy,
  QrCode,
  Eye,
  Plus,
  Zap,
  Hash,
  Lock,
  Store
} from "lucide-react";

interface VerificationResult {
  isValid: boolean;
  batchNumber: string;
  drugName: string;
  manufacturer: string;
  manufacturingDate: string;
  expiryDate: string;
  quantity: number;
  status: string;
  blockchainHash: string;
  ipfsHash: string;
  verificationTimestamp: string;
  certifications: Array<{
    name: string;
    status: string;
    issuedDate: string;
  }>;
  transferHistory: Array<{
    date: string;
    from: string;
    to: string;
    quantity: number;
    status: string;
  }>;
}

const VerifyPage = () => {
  const [verificationId, setVerificationId] = useState("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const navItems = [
    { name: "Dashboard", link: "/dashboard", icon: <Package className="h-4 w-4" /> },
    { name: "Mint", link: "/mint", icon: <Plus className="h-4 w-4" /> },
    { name: "Inventory", link: "/inventory", icon: <Package className="h-4 w-4" /> },
    { name: "Transfer", link: "/transfer", icon: <Zap className="h-4 w-4" /> },
    { name: "Pharmacy", link: "/pharmacy", icon: <Store className="h-4 w-4" /> },
    { name: "Verify", link: "/verify", icon: <Shield className="h-4 w-4" /> },
  ];

  // Mock verification data
  const mockVerificationResult = {
    isValid: true,
    batchNumber: "B-2024-001",
    drugName: "Acetaminophen 500mg",
    manufacturer: "PharmaCorp Industries",
    manufacturingDate: "2024-01-15",
    expiryDate: "2026-01-15",
    quantity: 5000,
    status: "Active",
    blockchainHash: "0x7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730",
    ipfsHash: "QmY7Yh4UquoXHLPFo2XbhXkhBvFoPwmQUSa92pxnxjQuPU",
    verificationTimestamp: "2024-12-15T10:30:00Z",
    certifications: [
      { name: "FDA Approved", status: "Valid", issuedDate: "2023-11-20" },
      { name: "GMP Certified", status: "Valid", issuedDate: "2023-10-15" },
      { name: "ISO 9001", status: "Valid", issuedDate: "2023-09-10" },
    ],
    transferHistory: [
      {
        date: "2024-01-15",
        from: "PharmaCorp Industries",
        to: "Distribution Center A",
        quantity: 5000,
        status: "Completed"
      },
      {
        date: "2024-03-10",
        from: "Distribution Center A",
        to: "Regional Pharmacy Chain",
        quantity: 2000,
        status: "Completed"
      }
    ]
  };

  const handleVerification = async () => {
    if (!verificationId.trim()) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setVerificationResult(mockVerificationResult);
      setIsLoading(false);
    }, 2000);
  };

  const handleQRScan = (data: string) => {
    setVerificationId(data);
    // Automatically trigger verification after scanning
    setTimeout(() => {
      handleVerification();
    }, 500);
  };

  const handleBatchHistory = () => {
    // TODO: Implement batch history functionality
    alert("Batch history feature will show detailed tracking information");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const recentVerifications = [
    {
      id: "B-2024-001",
      drugName: "Acetaminophen 500mg",
      manufacturer: "PharmaCorp Industries",
      status: "verified",
      timestamp: "2024-12-15 10:30",
    },
    {
      id: "B-2024-002",
      drugName: "Ibuprofen 200mg",
      manufacturer: "MediTech Solutions",
      status: "verified",
      timestamp: "2024-12-15 09:15",
    },
    {
      id: "B-2024-003",
      drugName: "Amoxicillin 250mg",
      manufacturer: "BioPharm Labs",
      status: "warning",
      timestamp: "2024-12-14 16:45",
    },
  ];

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
            Drug Verification
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Verify the authenticity and integrity of pharmaceutical products using blockchain technology and IPFS documentation.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Verification Form */}
          <HoverCard className="p-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Verify Product</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="verificationId" className="text-white font-medium">
                    Batch Number or QR Code
                  </Label>
                  <div className="relative">
                    <Input
                      id="verificationId"
                      value={verificationId}
                      onChange={(e) => setVerificationId(e.target.value)}
                      className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 pr-12"
                      placeholder="Enter batch number (e.g., B-2024-001)"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleVerification}
                  disabled={isLoading || !verificationId.trim()}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 text-lg disabled:opacity-30 shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Verify Product
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowQRScanner(true)}
                    className="bg-white text-black border-white hover:bg-gray-200 font-medium"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Scan QR
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleBatchHistory}
                    className="bg-white text-black border-white hover:bg-gray-200 font-medium"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Batch History
                  </Button>
                </div>
              </div>
            </motion.div>
          </HoverCard>

          {/* Verification Guidelines */}
          <HoverCard className="p-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">How to Verify</h3>
              </div>

              <div className="space-y-4 text-gray-300">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-white">Enter Batch Number</p>
                    <p className="text-sm">Type the batch number found on the product packaging</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-white">Scan QR Code</p>
                    <p className="text-sm">Use your device camera to scan the verification QR code</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-white">Review Results</p>
                    <p className="text-sm">Check blockchain verification and product authenticity</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Lock className="h-4 w-4 text-blue-400" />
                  <p className="font-medium text-blue-400">Secure Verification</p>
                </div>
                <p className="text-sm text-gray-400">
                  All verification data is stored immutably on the blockchain and cannot be tampered with.
                </p>
              </div>
            </motion.div>
          </HoverCard>
        </div>

        {/* Verification Results */}
        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <HoverCard className="p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className={`p-3 rounded-lg ${verificationResult.isValid ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}>
                  {verificationResult.isValid ? (
                    <CheckCircle className="h-6 w-6 text-white" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-white" />
                  )}
                </div>
                <h2 className="text-2xl font-bold">
                  {verificationResult.isValid ? "Verification Successful" : "Verification Failed"}
                </h2>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-gray-900/50 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Product Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Drug Name:</span>
                        <span className="text-white font-medium">{verificationResult.drugName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Batch Number:</span>
                        <span className="text-blue-400 font-mono">{verificationResult.batchNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Manufacturer:</span>
                        <span className="text-white">{verificationResult.manufacturer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Manufacturing Date:</span>
                        <span className="text-white">{verificationResult.manufacturingDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Expiry Date:</span>
                        <span className="text-white">{verificationResult.expiryDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-green-400">{verificationResult.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-900/50 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Blockchain Verification</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-400">Blockchain Hash:</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(verificationResult.blockchainHash)}
                            className="p-1 h-auto text-gray-400 hover:text-white"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-blue-400 font-mono text-xs break-all">
                          {verificationResult.blockchainHash}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-400">IPFS Hash:</span>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(verificationResult.ipfsHash)}
                              className="p-1 h-auto text-gray-400 hover:text-white"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="p-1 h-auto text-gray-400 hover:text-white"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-purple-400 font-mono text-xs">
                          {verificationResult.ipfsHash}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-gray-900/50 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Certifications</h3>
                    <div className="space-y-3">
                      {verificationResult.certifications.map((cert, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{cert.name}</p>
                            <p className="text-xs text-gray-400">Issued: {cert.issuedDate}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-green-400 text-sm">{cert.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-gray-900/50 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Transfer History</h3>
                    <div className="space-y-3">
                      {verificationResult.transferHistory.map((transfer, index: number) => (
                        <div key={index} className="p-3 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{transfer.from} → {transfer.to}</span>
                            <span className="text-green-400 text-sm">{transfer.status}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>{transfer.date}</span>
                            <span>{transfer.quantity} units</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </HoverCard>
          </motion.div>
        )}

        {/* Recent Verifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <HoverCard className="p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <Hash className="h-6 w-6 text-white" />
              </div>
                        <h2 className="text-2xl font-bold mb-6 text-white">Recent Verifications</h2>
            </div>

            <div className="space-y-4">
              {recentVerifications.map((verification, index) => (
                <motion.div
                  key={verification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:bg-gray-800/80 hover:border-gray-600 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${verification.status === 'verified' ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                      {verification.status === 'verified' ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{verification.drugName}</p>
                      <p className="text-sm text-blue-400">{verification.id}</p>
                      <p className="text-xs text-gray-400">{verification.manufacturer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">{verification.timestamp}</p>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${verification.status === 'verified' ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                      {verification.status === 'verified' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      <span className="capitalize">{verification.status}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </HoverCard>
        </motion.div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
      />
    </div>
  );
};

export default VerifyPage;