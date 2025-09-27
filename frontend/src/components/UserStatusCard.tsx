"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { HoverCard } from '@/components/aceternity/hover-card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  User, 
  Shield, 
  Factory, 
  Truck, 
  Store, 
  Wallet,
  CheckCircle
} from 'lucide-react';

export const UserStatusCard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  const getRoleConfig = () => {
    switch (user.role) {
      case 'manufacturer':
        return {
          icon: Factory,
          label: 'Manufacturer',
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-blue-500/10',
          textColor: 'text-blue-400'
        };
      case 'distributor':
        return {
          icon: Truck,
          label: 'Distributor',
          color: 'from-purple-500 to-pink-500',
          bgColor: 'bg-purple-500/10',
          textColor: 'text-purple-400'
        };
      case 'pharmacy':
        return {
          icon: Store,
          label: 'Pharmacy',
          color: 'from-green-500 to-emerald-500',
          bgColor: 'bg-green-500/10',
          textColor: 'text-green-400'
        };
      case 'consumer':
        return {
          icon: Shield,
          label: 'Consumer',
          color: 'from-orange-500 to-red-500',
          bgColor: 'bg-orange-500/10',
          textColor: 'text-orange-400'
        };
      default:
        return {
          icon: User,
          label: 'User',
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gray-500/10',
          textColor: 'text-gray-400'
        };
    }
  };

  const roleConfig = getRoleConfig();
  const IconComponent = roleConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <HoverCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Account Status</h3>
          <Badge variant="outline" className="border-green-500 text-green-400">
            <CheckCircle className="h-3 w-3 mr-1" />
            Authenticated
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Role Information */}
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${roleConfig.bgColor}`}>
              <IconComponent className={`h-6 w-6 ${roleConfig.textColor}`} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Role</p>
              <p className={`font-semibold ${roleConfig.textColor}`}>
                {roleConfig.label}
              </p>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Name:</span>
              <span className="text-white font-medium">{user.name}</span>
            </div>

            {user.organizationId && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">ID:</span>
                <span className="text-blue-400 font-mono text-sm">{user.organizationId}</span>
              </div>
            )}

            {user.licenseNumber && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">License:</span>
                <span className="text-green-400 font-mono text-sm">{user.licenseNumber}</span>
              </div>
            )}

            {user.walletAddress && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400 flex items-center">
                  <Wallet className="h-3 w-3 mr-1" />
                  Wallet:
                </span>
                <span className="text-purple-400 font-mono text-sm">
                  {`${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
                </span>
              </div>
            )}

            {user.email && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Email:</span>
                <span className="text-gray-300 text-sm">{user.email}</span>
              </div>
            )}
          </div>

          {/* Access Permissions */}
          <div className="pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-2">Access Permissions:</p>
            <div className="flex flex-wrap gap-2">
              {getAccessiblePages().map((page) => (
                <Badge
                  key={page}
                  variant="secondary"
                  className="text-xs bg-gray-800 text-gray-300"
                >
                  {page}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </HoverCard>
    </motion.div>
  );

  function getAccessiblePages() {
    const pages: string[] = [];
    
    if (user?.role === 'manufacturer') {
      pages.push('Dashboard', 'Mint', 'Inventory', 'Transfer', 'Verify');
    } else if (user?.role === 'distributor') {
      pages.push('Dashboard', 'Inventory', 'Transfer', 'Verify');
    } else if (user?.role === 'pharmacy') {
      pages.push('Dashboard', 'Pharmacy', 'Verify');
    } else if (user?.role === 'consumer') {
      pages.push('Verify');
    }
    
    return pages;
  }
};