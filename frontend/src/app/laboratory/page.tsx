'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TestTube, Search, AlertCircle, CheckCircle, Clock, Microscope } from 'lucide-react';
import { BackgroundBeams } from "@/components/aceternity/background-beams";
import { FloatingNav } from "@/components/aceternity/floating-navbar";
import { HoverCard } from "@/components/aceternity/hover-card";
import { navItems } from "@/config/navigation";
import BatchTesting from '../../components/BatchTesting';

interface Batch {
  tokenId: string;
  batchId: string;
  manufacturerName: string;
  status: string;
  manufacturingDate: string;
  expiryDate: string;
}

const LaboratoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    setBatches([
      {
        tokenId: '0',
        batchId: 'PHARMA-2025-001',
        manufacturerName: 'Pharma Corp Manufacturing',
        status: 'MANUFACTURED',
        manufacturingDate: '2025-09-22',
        expiryDate: '2027-09-22'
      },
      {
        tokenId: '1',
        batchId: 'PHARMA-2025-002',
        manufacturerName: 'Pharma Corp Manufacturing',
        status: 'TESTED',
        manufacturingDate: '2025-09-21',
        expiryDate: '2027-09-21'
      },
      {
        tokenId: '2',
        batchId: 'BIOSAFE-2025-001',
        manufacturerName: 'BioSafe Pharmaceuticals',
        status: 'MANUFACTURED',
        manufacturingDate: '2025-09-20',
        expiryDate: '2027-09-20'
      }
    ]);
  }, []);

  const handleSearch = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const filteredBatches = batches.filter(batch =>
    batch.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.tokenId.includes(searchTerm) ||
    batch.manufacturerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'TESTED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'MANUFACTURED':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TESTED':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'MANUFACTURED':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  if (selectedBatch) {
    return (
      <div className="min-h-screen relative">
        <BackgroundBeams />
        <FloatingNav navItems={navItems} />
        
        <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => setSelectedBatch(null)}
              className="mb-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
            >
              ← Back to Batch List
            </button>
            <BatchTesting
              tokenId={selectedBatch.tokenId}
              batchId={selectedBatch.batchId}
              manufacturerName={selectedBatch.manufacturerName}
            />
          </div>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center mb-4">
              <TestTube className="h-12 w-12 text-cyan-400 mr-4" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Laboratory Testing Center
                </h1>
                <p className="text-gray-400 text-lg mt-2">
                  Test pharmaceutical batches and submit results to blockchain
                </p>
              </div>
            </div>
          </div>

          {/* Laboratory Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <HoverCard>
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <Microscope className="h-6 w-6 text-cyan-400 mr-3" />
                  <h2 className="text-xl font-semibold text-white">Laboratory Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <span className="font-medium text-cyan-300">Name:</span>
                    <p className="text-gray-300">PharmaLab Testing Center</p>
                  </div>
                  <div>
                    <span className="font-medium text-cyan-300">License:</span>
                    <p className="text-gray-300">LAB-2025-001</p>
                  </div>
                  <div>
                    <span className="font-medium text-cyan-300">Certification:</span>
                    <p className="text-gray-300">ISO 17025:2017</p>
                  </div>
                  <div>
                    <span className="font-medium text-cyan-300">Wallet:</span>
                    <p className="text-gray-300 font-mono text-sm">0x742d35cc...de1f7f</p>
                  </div>
                </div>
              </div>
            </HoverCard>
          </motion.div>

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <HoverCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Search Batches for Testing</h3>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search by Batch ID, Token ID, or Manufacturer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 flex items-center transition-all duration-300"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {isLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
            </HoverCard>
          </motion.div>

          {/* Batches List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <HoverCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-6">
                  Available Batches ({filteredBatches.length})
                </h3>
                
                {filteredBatches.length === 0 ? (
                  <div className="py-12 text-center">
                    <TestTube className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No batches found matching your search criteria.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBatches.map((batch, index) => (
                      <motion.div
                        key={batch.tokenId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-gray-600 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <h4 className="text-xl font-semibold text-white mr-4">
                                {batch.batchId}
                              </h4>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(batch.status)}`}>
                                {getStatusIcon(batch.status)}
                                <span className="ml-2">{batch.status}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                              <div>
                                <span className="font-medium text-gray-400">Token ID:</span>
                                <span className="text-gray-300 ml-2">{batch.tokenId}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-400">Manufacturer:</span>
                                <span className="text-gray-300 ml-2">{batch.manufacturerName}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-400">Manufactured:</span>
                                <span className="text-gray-300 ml-2">{batch.manufacturingDate}</span>
                              </div>
                            </div>

                            <div className="text-sm">
                              <span className="font-medium text-gray-400">Expiry Date:</span>
                              <span className="text-gray-300 ml-2">{batch.expiryDate}</span>
                            </div>
                          </div>
                          
                          <div className="ml-6">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedBatch(batch)}
                              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center"
                            >
                              <TestTube className="h-4 w-4 mr-2" />
                              Test Batch
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </HoverCard>
          </motion.div>

          {/* Testing Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <HoverCard>
              <div className="p-6">
                <h4 className="font-semibold text-white mb-4 flex items-center">
                  <AlertCircle className="h-5 w-5 text-cyan-400 mr-2" />
                  Testing Instructions
                </h4>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <p>Select a batch from the list above to begin testing</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <p>Complete all required tests: Purity, Potency, Sterility, and Contamination screening</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <p>Submit test results to the blockchain for permanent verification</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <p>Each test result creates an immutable record linked to the batch NFT</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <p>Only verified laboratories can submit test results</p>
                  </div>
                </div>
              </div>
            </HoverCard>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LaboratoryPage;