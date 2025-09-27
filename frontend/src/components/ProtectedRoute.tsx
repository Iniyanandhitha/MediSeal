"use client";

import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  pageName: string;
  onLoginRequired: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  pageName,
  onLoginRequired
}) => {
  const { user, isAuthenticated, canAccessPage } = useAuth();

  // Check if user can access this page
  if (!canAccessPage(pageName)) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="mb-6">
            {!isAuthenticated ? (
              <Lock className="h-16 w-16 text-red-400 mx-auto mb-4" />
            ) : (
              <AlertTriangle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            )}
          </div>

          {!isAuthenticated ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
              <p className="text-gray-400 mb-6">
                Please log in to access this page. Different stakeholders have different access levels in the pharmaceutical supply chain.
              </p>
              <Button
                onClick={onLoginRequired}
                className="bg-gradient-to-r from-scooter-400 to-scooter-700 hover:from-scooter-400 hover:to-scooter-700"
              >
                <Shield className="h-4 w-4 mr-2" />
                Login to Continue
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
              <p className="text-gray-400 mb-4">
                Your role <span className="text-blue-400 font-semibold">({user?.role})</span> does not have permission to access this page.
              </p>
              <div className="bg-gray-800/30 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-white mb-2">Page Access Requirements:</h3>
                <div className="text-sm text-gray-300 space-y-1">
                  {getPageAccessInfo(pageName).map((info, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${info.hasAccess ? 'bg-green-400' : 'bg-gray-500'}`} />
                      <span className={info.hasAccess ? 'text-green-400' : 'text-gray-400'}>
                        {info.role}: {info.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Go Back
              </Button>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};

function getPageAccessInfo(pageName: string) {
  const accessMap: Record<string, Array<{ role: string; description: string; hasAccess: boolean }>> = {
    mint: [
      { role: 'Manufacturer', description: 'Create new drug batches', hasAccess: true },
      { role: 'Distributor', description: 'No access to manufacturing', hasAccess: false },
      { role: 'Pharmacy', description: 'No access to manufacturing', hasAccess: false },
      { role: 'Consumer', description: 'No access to manufacturing', hasAccess: false },
    ],
    inventory: [
      { role: 'Manufacturer', description: 'Manage production inventory', hasAccess: true },
      { role: 'Distributor', description: 'Manage distribution inventory', hasAccess: true },
      { role: 'Pharmacy', description: 'No access to supply chain inventory', hasAccess: false },
      { role: 'Consumer', description: 'No access to inventory management', hasAccess: false },
    ],
    transfer: [
      { role: 'Manufacturer', description: 'Transfer to distributors', hasAccess: true },
      { role: 'Distributor', description: 'Transfer to pharmacies', hasAccess: true },
      { role: 'Pharmacy', description: 'No access to bulk transfers', hasAccess: false },
      { role: 'Consumer', description: 'No access to transfers', hasAccess: false },
    ],
    pharmacy: [
      { role: 'Manufacturer', description: 'No access to retail operations', hasAccess: false },
      { role: 'Distributor', description: 'No access to retail operations', hasAccess: false },
      { role: 'Pharmacy', description: 'Manage prescriptions and dispensing', hasAccess: true },
      { role: 'Consumer', description: 'No access to pharmacy management', hasAccess: false },
    ],
    verify: [
      { role: 'Manufacturer', description: 'Verify any batch', hasAccess: true },
      { role: 'Distributor', description: 'Verify any batch', hasAccess: true },
      { role: 'Pharmacy', description: 'Verify any batch', hasAccess: true },
      { role: 'Consumer', description: 'Verify purchased medications', hasAccess: true },
    ],
    dashboard: [
      { role: 'Manufacturer', description: 'Manufacturing overview', hasAccess: true },
      { role: 'Distributor', description: 'Distribution overview', hasAccess: true },
      { role: 'Pharmacy', description: 'Pharmacy overview', hasAccess: true },
      { role: 'Consumer', description: 'Use verification only', hasAccess: false },
    ],
  };

  return accessMap[pageName] || [];
}