"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

// Types for Web3 functionality
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (data: unknown) => void) => void;
  removeListener: (event: string, handler: (data: unknown) => void) => void;
}

interface WindowWithEthereum extends Window {
  ethereum?: EthereumProvider;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  balance: string | null;
}

export interface Web3ContextType {
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchChain: (chainId: number) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  isMetaMaskInstalled: boolean;
}

// Chain configurations
export const SUPPORTED_CHAINS = {
  HARDHAT: {
    id: 31337,
    name: 'Hardhat Local',
    rpcUrl: 'http://127.0.0.1:8545',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
  },
  SEPOLIA: {
    id: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
  }
};

// Create context
const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Provider component
export function Web3Provider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
    balance: null
  });

  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  // Check if MetaMask is installed
  useEffect(() => {
    setIsMetaMaskInstalled(typeof window !== 'undefined' && typeof (window as unknown as { ethereum?: unknown }).ethereum !== 'undefined');
  }, []);

  const checkConnection = useCallback(async () => {
    if (!isMetaMaskInstalled) return;

    try {
      const ethereum = (window as WindowWithEthereum).ethereum;
      if (!ethereum) return;
      
      const accounts = await ethereum.request({
        method: 'eth_accounts'
      }) as string[];

      if (accounts.length > 0) {
        const chainId = await ethereum.request({
          method: 'eth_chainId'
        }) as string;

        const balance = await ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest']
        }) as string;

        setWallet({
          address: accounts[0],
          isConnected: true,
          isConnecting: false,
          chainId: parseInt(chainId, 16),
          balance: formatEther(balance)
        });
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  }, [isMetaMaskInstalled]);

  // Check if already connected on load
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      alert('Please install MetaMask to connect your wallet');
      return;
    }

    setWallet(prev => ({ ...prev, isConnecting: true }));

    try {
      const ethereum = (window as WindowWithEthereum).ethereum;
      if (!ethereum) throw new Error('Ethereum provider not found');
      
      // Request account access
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[];

      const chainId = await ethereum.request({
        method: 'eth_chainId'
      }) as string;

      const balance = await ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      }) as string;

      setWallet({
        address: accounts[0],
        isConnected: true,
        isConnecting: false,
        chainId: parseInt(chainId, 16),
        balance: formatEther(balance)
      });

      // Try to switch to Hardhat network for development
      try {
        await switchChain(SUPPORTED_CHAINS.HARDHAT.id);
      } catch (switchError) {
        console.log('Could not switch to Hardhat network:', switchError);
      }

    } catch (error: unknown) {
      console.error('Error connecting wallet:', error);
      setWallet(prev => ({ ...prev, isConnecting: false }));
      
      const errorObj = error as { code?: number };
      if (errorObj.code === 4001) {
        alert('Please connect to MetaMask.');
      } else {
        alert('Failed to connect wallet. Please try again.');
      }
    }
  };

  const disconnectWallet = () => {
    setWallet({
      address: null,
      isConnected: false,
      isConnecting: false,
      chainId: null,
      balance: null
    });
  };

  const switchChain = async (chainId: number) => {
    if (!isMetaMaskInstalled || !wallet.isConnected) return;

    try {
      const ethereum = (window as WindowWithEthereum).ethereum;
      if (!ethereum) return;
      
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      });
    } catch (error: unknown) {
      // Chain not added to MetaMask
      const errorObj = error as { code?: number };
      if (errorObj.code === 4902) {
        const chain = Object.values(SUPPORTED_CHAINS).find(c => c.id === chainId);
        if (chain) {
          const ethereum = (window as WindowWithEthereum).ethereum;
          if (!ethereum) return;
          
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${chainId.toString(16)}`,
              chainName: chain.name,
              rpcUrls: [chain.rpcUrl],
              nativeCurrency: chain.nativeCurrency
            }]
          });
        }
      }
      throw error;
    }
  };

  const signMessage = async (message: string): Promise<string> => {
    if (!isMetaMaskInstalled || !wallet.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const ethereum = (window as WindowWithEthereum).ethereum;
      if (!ethereum) throw new Error('Ethereum provider not found');
      
      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [message, wallet.address]
      }) as string;
      return signature;
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled) return;

    const handleAccountsChanged = (data: unknown) => {
      const accounts = data as string[];
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setWallet(prev => ({ ...prev, address: accounts[0] }));
      }
    };

    const handleChainChanged = (data: unknown) => {
      const chainId = data as string;
      setWallet(prev => ({ ...prev, chainId: parseInt(chainId, 16) }));
    };

    const ethereum = (window as WindowWithEthereum).ethereum;
    if (ethereum) {
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [isMetaMaskInstalled]);

  const value: Web3ContextType = {
    wallet,
    connectWallet,
    disconnectWallet,
    switchChain,
    signMessage,
    isMetaMaskInstalled
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

// Hook to use Web3 context
export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

// Utility function to format Wei to Ether
function formatEther(wei: string): string {
  const ethValue = parseInt(wei, 16) / Math.pow(10, 18);
  return ethValue.toFixed(4);
}

// Utility function to shorten address
export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}