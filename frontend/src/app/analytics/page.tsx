'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Users, 
  Package, 
  TestTube,
  Shield,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { FloatingNav } from "@/components/aceternity/floating-navbar";
import { navItems } from "@/config/navigation";

interface BlockchainMetrics {
  totalBatches: number;
  totalStakeholders: number;
  totalTransactions: number;
  gasUsed: string;
  averageGasPrice: string;
  networkStatus: 'healthy' | 'congested' | 'slow';
}

interface StakeholderStats {
  manufacturers: number;
  distributors: number;
  retailers: number;
  healthcareProviders: number;
  regulators: number;
  laboratories: number;
}

interface RecentTransaction {
  hash: string;
  type: string;
  from: string;
  to: string;
  timestamp: string;
  gasUsed: number;
  status: 'success' | 'pending' | 'failed';
}

const BlockchainAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<BlockchainMetrics>({
    totalBatches: 0,
    totalStakeholders: 0,
    totalTransactions: 0,
    gasUsed: '0',
    averageGasPrice: '0',
    networkStatus: 'healthy'
  });

  const [stakeholderStats, setStakeholderStats] = useState<StakeholderStats>({
    manufacturers: 0,
    distributors: 0,
    retailers: 0,
    healthcareProviders: 0,
    regulators: 0,
    laboratories: 0
  });

  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching blockchain data
    const fetchBlockchainData = async () => {
      setIsLoading(true);
      
      // Mock data - in real implementation, this would fetch from blockchain
      setTimeout(() => {
        setMetrics({
          totalBatches: 1247,
          totalStakeholders: 156,
          totalTransactions: 3421,
          gasUsed: '2.4M',
          averageGasPrice: '15.2',
          networkStatus: 'healthy'
        });

        setStakeholderStats({
          manufacturers: 23,
          distributors: 45,
          retailers: 67,
          healthcareProviders: 12,
          regulators: 5,
          laboratories: 4
        });

        setRecentTransactions([
          {
            hash: '0x1234...5678',
            type: 'Batch Mint',
            from: '0xabcd...ef01',
            to: 'Contract',
            timestamp: '2 minutes ago',
            gasUsed: 169466,
            status: 'success'
          },
          {
            hash: '0x5678...9abc',
            type: 'Lab Test Result',
            from: '0x742d...1f7f',
            to: 'Contract',
            timestamp: '5 minutes ago',
            gasUsed: 102568,
            status: 'success'
          },
          {
            hash: '0x9abc...def0',
            type: 'Batch Transfer',
            from: '0x1234...5678',
            to: '0x9876...5432',
            timestamp: '8 minutes ago',
            gasUsed: 85432,
            status: 'success'
          }
        ]);

        setIsLoading(false);
      }, 1500);
    };

    fetchBlockchainData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNetworkStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'congested':
        return 'text-yellow-600 bg-yellow-100';
      case 'slow':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <FloatingNav navItems={navItems} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading blockchain analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <FloatingNav navItems={navItems} />
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <div className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Blockchain Analytics
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Real-time insights into MediSeal&apos;s Web3 pharmaceutical supply chain
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Package className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Batches</p>
                  <p className="text-2xl font-bold text-white">{metrics.totalBatches.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Stakeholders</p>
                  <p className="text-2xl font-bold text-white">{metrics.totalStakeholders}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Activity className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Transactions</p>
                  <p className="text-2xl font-bold text-white">{metrics.totalTransactions.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Avg Gas (Gwei)</p>
                  <p className="text-2xl font-bold text-white">{metrics.averageGasPrice}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Network Status */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Network Status</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getNetworkStatusColor(metrics.networkStatus)}`}>
                {metrics.networkStatus.charAt(0).toUpperCase() + metrics.networkStatus.slice(1)}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{metrics.gasUsed}</div>
                <div className="text-sm text-gray-400">Total Gas Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">0x791...265E</div>
                <div className="text-sm text-gray-400">Contract Address</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">Sepolia</div>
                <div className="text-sm text-gray-400">Network</div>
              </div>
            </div>
          </div>

          {/* Stakeholder Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-6">Stakeholder Distribution</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="h-4 w-4 text-blue-400 mr-2" />
                    <span className="text-gray-300">Manufacturers</span>
                  </div>
                  <span className="text-white font-semibold">{stakeholderStats.manufacturers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-gray-300">Distributors</span>
                  </div>
                  <span className="text-white font-semibold">{stakeholderStats.distributors}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="h-4 w-4 text-purple-400 mr-2" />
                    <span className="text-gray-300">Retailers</span>
                  </div>
                  <span className="text-white font-semibold">{stakeholderStats.retailers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-red-400 mr-2" />
                    <span className="text-gray-300">Healthcare Providers</span>
                  </div>
                  <span className="text-white font-semibold">{stakeholderStats.healthcareProviders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-yellow-400 mr-2" />
                    <span className="text-gray-300">Regulators</span>
                  </div>
                  <span className="text-white font-semibold">{stakeholderStats.regulators}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TestTube className="h-4 w-4 text-cyan-400 mr-2" />
                    <span className="text-gray-300">Laboratories</span>
                  </div>
                  <span className="text-white font-semibold">{stakeholderStats.laboratories}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-6">Recent Transactions</h2>
              <div className="space-y-4">
                {recentTransactions.map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center">
                      {getStatusIcon(tx.status)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-white">{tx.type}</div>
                        <div className="text-xs text-gray-400">{tx.hash}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white">{tx.gasUsed.toLocaleString()} gas</div>
                      <div className="text-xs text-gray-400">{tx.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gas Optimization Info */}
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-6 w-6 text-green-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">Gas Optimization Achievements</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">20.1%</div>
                <div className="text-sm text-gray-300">Gas Savings</div>
                <div className="text-xs text-gray-400">vs. Original Contract</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">606K</div>
                <div className="text-sm text-gray-300">Gas Units Saved</div>
                <div className="text-xs text-gray-400">Per Deployment</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-1">$18.20</div>
                <div className="text-sm text-gray-300">USD Saved</div>
                <div className="text-xs text-gray-400">Per Deployment</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainAnalytics;