"use client";

import { useState, useCallback } from "react";

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  isConnecting: boolean;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    isConnecting: false,
  });

  const connectWallet = useCallback(async () => {
    try {
      setWalletState(prev => ({ ...prev, isConnecting: true }));

      // Check if MetaMask is installed
      if (typeof window !== "undefined" && window.ethereum) {
        // Request account access
        const accountsResponse = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const accounts = accountsResponse as string[];

        if (accounts.length > 0) {
          const address = accounts[0];
          
          // Get balance (optional)
          const balanceResponse = await window.ethereum.request({
            method: "eth_getBalance",
            params: [address, "latest"],
          });

          const balance = balanceResponse as string;

          // Convert balance from wei to ETH
          const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);

          setWalletState({
            isConnected: true,
            address,
            balance: balanceInEth.toFixed(4),
            isConnecting: false,
          });

          return { success: true, address };
        }
      } else {
        throw new Error("MetaMask not found");
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      setWalletState(prev => ({ ...prev, isConnecting: false }));
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: errorMessage };
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: null,
      isConnecting: false,
    });
  }, []);

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    formatAddress,
  };
};

// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isMetaMask?: boolean;
    };
  }
}