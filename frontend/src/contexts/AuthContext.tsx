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
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
      isVerified: true,
    },
    'MFR-002': {
      id: 'MFR-002',
      role: 'manufacturer' as UserRole,
      name: 'BioTech Solutions',
      email: 'info@biotech.com',
      organizationId: 'MFR-002',
      licenseNumber: 'MFG-LIC-2025-002',
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
      isVerified: true,
    },
    'DIST-002': {
      id: 'DIST-002',
      role: 'distributor' as UserRole,
      name: 'Global Pharma Logistics',
      email: 'contact@globallogistics.com',
      organizationId: 'DIST-002',
      licenseNumber: 'DIST-LIC-2025-002',
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
      isVerified: true,
    },
    'LAB-002': {
      id: 'LAB-002',
      role: 'laboratory' as UserRole,
      name: 'Quality Assurance Center',
      email: 'testing@qacenter.com',
      organizationId: 'LAB-002',
      licenseNumber: 'LAB-LIC-2025-002',
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
      isVerified: true,
    },
    'PHARM-002': {
      id: 'PHARM-002',
      role: 'pharmacy' as UserRole,
      name: 'City Medical Store',
      email: 'info@citymedical.com',
      organizationId: 'PHARM-002',
      licenseNumber: 'PHARM-LIC-2025-002',
      isVerified: true,
    }
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication on mount
    const storedUser = localStorage.getItem('mediseal_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (credentials.role === 'consumer') {
        // Consumers only use wallet connection
        if (credentials.walletAddress) {
          const consumerUser: User = {
            id: credentials.walletAddress,
            role: 'consumer',
            name: 'Consumer',
            walletAddress: credentials.walletAddress,
            isVerified: true,
          };
          setUser(consumerUser);
          localStorage.setItem('mediseal_user', JSON.stringify(consumerUser));
          return true;
        }
        return false;
      }

      // For other roles, check mock database
      const roleUsers = mockUsers[credentials.role as keyof typeof mockUsers];
      if (roleUsers && credentials.identifier in roleUsers) {
        const foundUser = roleUsers[credentials.identifier as keyof typeof roleUsers];
        setUser(foundUser);
        localStorage.setItem('mediseal_user', JSON.stringify(foundUser));
        return true;
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
    localStorage.removeItem('mediseal_user');
  };

  const connectWallet = async (): Promise<boolean> => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
        if (accounts && accounts.length > 0) {
          const walletAddress = accounts[0];
          
          // If user is already logged in with a role, just add wallet
          if (user && user.role !== 'consumer') {
            const updatedUser = { ...user, walletAddress };
            setUser(updatedUser);
            localStorage.setItem('mediseal_user', JSON.stringify(updatedUser));
            return true;
          }
          
          // If no user or consumer, create consumer user
          const consumerUser: User = {
            id: walletAddress,
            role: 'consumer',
            name: 'Consumer',
            walletAddress,
            isVerified: true,
          };
          setUser(consumerUser);
          localStorage.setItem('mediseal_user', JSON.stringify(consumerUser));
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
    if (user?.role === 'consumer') {
      // If consumer, fully logout
      logout();
    } else if (user) {
      // If other role, just remove wallet address
      const updatedUser = { ...user, walletAddress: undefined };
      setUser(updatedUser);
      localStorage.setItem('mediseal_user', JSON.stringify(updatedUser));
    }
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!user || !requiredRole) return false;
    return user.role === requiredRole;
  };

  const canAccessPage = (page: string): boolean => {
    if (!user) return page === 'verify'; // Only verify page is public
    
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
      case 'verify':
        return true; // Anyone can verify
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
