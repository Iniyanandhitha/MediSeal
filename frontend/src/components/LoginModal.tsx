"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { 
  X, 
  User, 
  Factory,
  Truck,
  Store,
  Loader2,
  FlaskConical
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LoginRole = 'manufacturer' | 'distributor' | 'laboratory' | 'pharmacy';

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<LoginRole | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const roleConfig = {
    manufacturer: {
      icon: Factory,
      label: 'Manufacturer',
      color: 'from-blue-500 to-cyan-500',
      description: 'Drug manufacturing companies',
      identifierLabel: 'Manufacturer License ID',
      placeholder: 'e.g., MFR-001',
      examples: ['MFR-001 (PharmaCorp Industries)', 'MFR-002 (BioTech Solutions)']
    },
    distributor: {
      icon: Truck,
      label: 'Distributor',
      color: 'from-purple-500 to-pink-500',
      description: 'Supply chain distributors',
      identifierLabel: 'Distributor License ID',
      placeholder: 'e.g., DIST-001',
      examples: ['DIST-001 (MediSupply Chain Co.)', 'DIST-002 (Global Pharma Logistics)']
    },
    laboratory: {
      icon: FlaskConical,
      label: 'Laboratory',
      color: 'from-cyan-500 to-teal-500',
      description: 'Quality testing laboratories',
      identifierLabel: 'Laboratory License ID',
      placeholder: 'e.g., LAB-001',
      examples: ['LAB-001 (PharmaTest Labs)', 'LAB-002 (Quality Assurance Center)']
    },
    pharmacy: {
      icon: Store,
      label: 'Pharmacy',
      color: 'from-green-500 to-emerald-500',
      description: 'Retail pharmacies',
      identifierLabel: 'Pharmacy License ID',
      placeholder: 'e.g., PHARM-001',
      examples: ['PHARM-001 (HealthCare Pharmacy)', 'PHARM-002 (City Medical Store)']
    }
  };

  const handleRoleLogin = async () => {
    if (!selectedRole) return;
    
    setError('');
    
    if (!identifier.trim()) {
      setError('Please enter your license ID');
      return;
    }

    const success = await login({
      role: selectedRole,
      identifier: identifier.trim(),
      password: password || undefined,
    });

    if (success) {
      onClose();
      resetForm();
    } else {
      setError('Invalid credentials. Please check your license ID.');
    }
  };

  const resetForm = () => {
    setSelectedRole(null);
    setIdentifier('');
    setPassword('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900/95 border border-gray-700 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Login to MediSeal</h2>
              <p className="text-gray-400 mt-1">Select your role to access the platform</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Role Selection */}
          {!selectedRole ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Choose Your Role</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(roleConfig).map(([role, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <motion.button
                      key={role}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedRole(role as LoginRole)}
                      className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-gray-600 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${config.color}`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{config.label}</h4>
                          <p className="text-sm text-gray-400">{config.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Login Form */
            <div className="space-y-6">
              {/* Selected Role Header */}
              <div className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-lg">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${roleConfig[selectedRole].color}`}>
                  {React.createElement(roleConfig[selectedRole].icon, { className: "h-6 w-6 text-white" })}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{roleConfig[selectedRole].label} Login</h3>
                  <p className="text-sm text-gray-400">{roleConfig[selectedRole].description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRole(null)}
                  className="ml-auto text-gray-400 hover:text-white"
                >
                  Change Role
                </Button>
              </div>

              {/* Organization Login Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="identifier" className="text-white">
                    {roleConfig[selectedRole].identifierLabel}
                  </Label>
                  <Input
                    id="identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={roleConfig[selectedRole].placeholder}
                    className="mt-2 bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                {/* Example IDs */}
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Demo Login IDs:</h4>
                  <div className="space-y-1">
                    {roleConfig[selectedRole].examples.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setIdentifier(example.split(' ')[0])}
                        className="block text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleRoleLogin}
                  disabled={isLoading || !identifier.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </>
                  )}
                </Button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};