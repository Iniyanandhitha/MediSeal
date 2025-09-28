"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useWeb3, shortenAddress } from '@/contexts/Web3Context';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Wallet, 
  ChevronDown, 
  Copy, 
  ExternalLink, 
  LogOut,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface ConnectWalletButtonProps {
  className?: string;
  showBalance?: boolean;
  variant?: 'default' | 'outline' | 'secondary';
}

export function ConnectWalletButton({ 
  className = '', 
  showBalance = true,
  variant = 'default' 
}: ConnectWalletButtonProps) {
  const { wallet, connectWallet, disconnectWallet, isMetaMaskInstalled } = useWeb3();
  const { logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConnect = async () => {
    if (!isMetaMaskInstalled) {
      alert('Please install MetaMask to connect your wallet');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }
    
    await connectWallet();
  };

  const copyAddress = async () => {
    if (wallet.address) {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openEtherscan = () => {
    if (wallet.address && wallet.chainId) {
      let explorerUrl = '';
      
      switch (wallet.chainId) {
        case 1:
          explorerUrl = `https://etherscan.io/address/${wallet.address}`;
          break;
        case 11155111:
          explorerUrl = `https://sepolia.etherscan.io/address/${wallet.address}`;
          break;
        default:
          explorerUrl = `https://etherscan.io/address/${wallet.address}`;
      }
      
      window.open(explorerUrl, '_blank');
    }
  };

  // Show install MetaMask button if not installed
  if (!isMetaMaskInstalled) {
    return (
      <Button 
        onClick={handleConnect}
        variant="outline"
        className={`bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700 ${className}`}
      >
        <AlertCircle className="w-4 h-4 mr-2" />
        Install MetaMask
      </Button>
    );
  }

    // Show connect button if wallet not connected
  if (!wallet.isConnected) {
    return (
      <Button 
        onClick={handleConnect} 
        disabled={wallet.isConnecting}
        className={`bg-scooter-600 hover:bg-scooter-700 text-white border border-scooter-600 hover:border-scooter-700 ${className}`}
      >
        {wallet.isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </>
        )}
      </Button>
    );
  }

  // Show connected wallet with dropdown
  return (
    <div className="relative">
      <Button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        variant={variant}
        className={`flex items-center space-x-2 ${className}`}
      >
        <Wallet className="w-4 h-4" />
        <span className="font-mono">
          {shortenAddress(wallet.address || '')}
        </span>
        {showBalance && wallet.balance && (
          <span className="text-sm opacity-75">
            {parseFloat(wallet.balance).toFixed(3)} ETH
          </span>
        )}
        <ChevronDown className="w-4 h-4" />
      </Button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-72 bg-gray-900/95 border border-gray-700 rounded-lg shadow-lg z-20"
          >
            <div className="p-4">
              {/* Wallet Address Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-300">
                    Wallet Address
                  </span>
                  <span className="text-xs px-3 py-1 bg-green-500 text-white rounded-full font-medium">
                    Chain ID: {wallet.chainId}
                  </span>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                  <span className="font-mono text-sm text-white block break-all">
                    {wallet.address}
                  </span>
                </div>
              </div>

              {/* Balance Section */}
              {wallet.balance && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-300 block mb-2">
                    Balance
                  </span>
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                    <div className="text-xl font-bold text-white">
                      {parseFloat(wallet.balance).toFixed(6)} ETH
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  onClick={copyAddress}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy Address'}
                </Button>

                <Button
                  onClick={openEtherscan}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Explorer
                </Button>

                <Button
                  onClick={() => {
                    disconnectWallet();
                    logout();
                    setIsDropdownOpen(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-red-400 bg-gray-800 border-gray-600 hover:bg-red-900/20 hover:border-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}