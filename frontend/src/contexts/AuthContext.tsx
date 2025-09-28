"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'manufacturer' | 'distributor' | 'laboratory' | 'pharmacy' | 'consumer' | null;

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email?: string;
  walletAddress?: string;
  organizationId?: string;
  licenseNumber?: string;
  isVerified: boolean;
  isMaster?: boolean;
}

// Master wallet addresses with full platform access
const MASTER_WALLETS = [
  '0x35b149a0ebB942A81830F3E126357bC10378E849',
  '0x2962B9266a48E8F83c583caD27Be093f231781b8',
  '0x5387ffAB40F66172b7eEbCEDDC0F1f3bc7536092'
].map(addr => addr.toLowerCase());

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  walletConnected: boolean;
  connectedAddress: string | null;
  isMasterWallet: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  hasPermission: (requiredRole: UserRole) => boolean;
  canAccessPage: (page: string) => boolean;
}

export interface LoginCredentials {
  role: UserRole;
  identifier: string; // License ID, Organization ID, etc.
  password?: string;
  walletAddress?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for different user types - In production, this would come from your backend
const mockUsers = {
  manufacturer: {
    'MFR-001': {
      id: 'MFR-001',
      role: 'manufacturer' as UserRole,
      name: 'PharmaCorp Industries',
      email: 'contact@pharmacorp.com',
      organizationId: 'MFR-001',
      licenseNumber: 'MFG-LIC-2025-001',
      walletAddress: '0x742d35Cc6634C0532925a3b8D8b8FbD7341d1234',
      isVerified: true,
    },
    'MFR-002': {
      id: 'MFR-002',
      role: 'manufacturer' as UserRole,
      name: 'BioTech Solutions',
      email: 'info@biotech.com',
      organizationId: 'MFR-002',
      licenseNumber: 'MFG-LIC-2025-002',
      walletAddress: '0x8E5a2e2b4C8D0F6A2B3C1d2E3F4a5B6C7d8e9f01',
      isVerified: true,
    }
  },
  distributor: {
    'DIST-001': {
      id: 'DIST-001',
      role: 'distributor' as UserRole,
      name: 'MediSupply Chain Co.',
      email: 'ops@medisupply.com',
      organizationId: 'DIST-001',
      licenseNumber: 'DIST-LIC-2025-001',
      walletAddress: '0x1A2b3C4d5E6F7a8B9c0D1e2F3a4B5c6D7e8F9011',
      isVerified: true,
    },
    'DIST-002': {
      id: 'DIST-002',
      role: 'distributor' as UserRole,
      name: 'Global Pharma Logistics',
      email: 'contact@globallogistics.com',
      organizationId: 'DIST-002',
      licenseNumber: 'DIST-LIC-2025-002',
      walletAddress: '0x9F8e7D6c5B4a394847362518A7b6C5d4E3f2e101',
      isVerified: true,
    }
  },
  laboratory: {
    'LAB-001': {
      id: 'LAB-001',
      role: 'laboratory' as UserRole,
      name: 'PharmaTest Labs',
      email: 'quality@pharmatest.com',
      organizationId: 'LAB-001',
      licenseNumber: 'LAB-LIC-2025-001',
      walletAddress: '0x2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F901234',
      isVerified: true,
    },
    'LAB-002': {
      id: 'LAB-002',
      role: 'laboratory' as UserRole,
      name: 'Quality Assurance Center',
      email: 'testing@qacenter.com',
      organizationId: 'LAB-002',
      licenseNumber: 'LAB-LIC-2025-002',
      walletAddress: '0x3C4d5E6f7A8b9C0d1E2f3A4b5C6d7E8f90123456',
      isVerified: true,
    }
  },
  pharmacy: {
    'PHARM-001': {
      id: 'PHARM-001',
      role: 'pharmacy' as UserRole,
      name: 'HealthCare Pharmacy',
      email: 'pharmacist@healthcare.com',
      organizationId: 'PHARM-001',
      licenseNumber: 'PHARM-LIC-2025-001',
      walletAddress: '0x4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9012345678',
      isVerified: true,
    },
    'PHARM-002': {
      id: 'PHARM-002',
      role: 'pharmacy' as UserRole,
      name: 'City Medical Store',
      email: 'info@citymedical.com',
      organizationId: 'PHARM-002',
      licenseNumber: 'PHARM-LIC-2025-002',
      walletAddress: '0x5E6f7A8b9C0d1E2f3A4b5C6d7E8f901234567890',
      isVerified: true,
    }
  }
};

const isMasterWallet = (address: string | null): boolean => {
  if (!address) return false;
  return MASTER_WALLETS.includes(address.toLowerCase());
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored authentication on mount
    const storedUser = localStorage.getItem('mediseal_user');
    const storedAddress = localStorage.getItem('mediseal_wallet');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedAddress) {
      setConnectedAddress(storedAddress);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Require wallet connection for all stakeholder logins
      if (!connectedAddress) {
        setIsLoading(false);
        return false; // Must connect wallet first
      }

      if (credentials.role === 'consumer') {
        // Consumers only use wallet connection
        const consumerUser: User = {
          id: connectedAddress,
          role: 'consumer',
          name: 'Consumer',
          walletAddress: connectedAddress,
          isVerified: true,
        };
        setUser(consumerUser);
        localStorage.setItem('mediseal_user', JSON.stringify(consumerUser));
        return true;
      }

      // For stakeholder roles, check mock database and verify wallet address matches
      const roleUsers = mockUsers[credentials.role as keyof typeof mockUsers];
      if (roleUsers && credentials.identifier in roleUsers) {
        const foundUser = roleUsers[credentials.identifier as keyof typeof roleUsers];
        
        // Master wallets can login as any stakeholder without wallet address validation
        if (isMasterWallet(connectedAddress)) {
          const userWithWallet = foundUser as User;
          // Create a copy with master wallet address and master flag
          const masterUser: User = {
            ...userWithWallet,
            walletAddress: connectedAddress, // Use master wallet address
            isMaster: true, // Mark as master for backend access
          };
          setUser(masterUser);
          localStorage.setItem('mediseal_user', JSON.stringify(masterUser));
          return true;
        }
        
        // Regular users: verify that connected wallet matches the stakeholder's registered wallet
        const userWithWallet = foundUser as User;
        if (userWithWallet.walletAddress?.toLowerCase() === connectedAddress.toLowerCase()) {
          setUser(userWithWallet);
          localStorage.setItem('mediseal_user', JSON.stringify(userWithWallet));
          return true;
        } else {
          // Wallet address doesn't match the stakeholder
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setConnectedAddress(null);
    localStorage.removeItem('mediseal_user');
    localStorage.removeItem('mediseal_wallet');
  };

  const connectWallet = async (): Promise<boolean> => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
        if (accounts && accounts.length > 0) {
          const walletAddress = accounts[0];
          setConnectedAddress(walletAddress);
          localStorage.setItem('mediseal_wallet', walletAddress);
          
          // Auto-login master wallets (silent access as manufacturer)
          if (isMasterWallet(walletAddress)) {
            const masterUser: User = {
              id: walletAddress,
              role: 'manufacturer',
              name: 'Master Admin',
              walletAddress: walletAddress,
              isVerified: true,
              isMaster: true,
            };
            setUser(masterUser);
            localStorage.setItem('mediseal_user', JSON.stringify(masterUser));
          }
          
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Wallet connection error:', error);
      return false;
    }
  };

  const disconnectWallet = () => {
    setConnectedAddress(null);
    localStorage.removeItem('mediseal_wallet');
    
    // If user is logged in as stakeholder, log them out since wallet is required
    if (user && user.role !== 'consumer') {
      setUser(null);
      localStorage.removeItem('mediseal_user');
    } else if (user?.role === 'consumer') {
      // If consumer, fully logout
      setUser(null);
      localStorage.removeItem('mediseal_user');
    }
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!user || !requiredRole) return false;
    return user.role === requiredRole;
  };

  const canAccessPage = (page: string): boolean => {
    // Master wallets have access to everything
    if (user?.isMaster || isMasterWallet(connectedAddress)) {
      return true;
    }
    
    // Verify page only needs wallet connection
    if (page === 'verify') {
      return !!connectedAddress;
    }
    
    // All other pages need full authentication (wallet + stakeholder login)
    if (!user || !connectedAddress) return false;
    
    switch (page) {
      case 'mint':
        return user.role === 'manufacturer';
      case 'inventory':
        return user.role === 'manufacturer' || user.role === 'distributor';
      case 'transfer':
        return user.role === 'manufacturer' || user.role === 'distributor';
      case 'laboratory':
        return user.role === 'laboratory';
      case 'pharmacy':
        return user.role === 'pharmacy';
      case 'analytics':
        return user.role !== 'consumer'; // All stakeholders can view analytics
      case 'dashboard':
        return user.role !== 'consumer'; // Consumers don't need dashboard
      default:
        return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    walletConnected: !!connectedAddress,
    connectedAddress,
    isMasterWallet: isMasterWallet(connectedAddress),
    login,
    logout,
    connectWallet,
    disconnectWallet,
    hasPermission,
    canAccessPage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
