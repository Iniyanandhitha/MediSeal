"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { shortenAddress } from '@/contexts/Web3Context';
import { 
  X, 
  User, 
  Factory,
  Truck,
  Store,
  Loader2,
  FlaskConical,
  Wallet,
  Plus,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

import { StakeholderRegistration } from './StakeholderRegistration';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LoginRole = 'manufacturer' | 'distributor' | 'laboratory' | 'pharmacy';

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, isLoading, walletConnected, connectedAddress, connectWallet } = useAuth();
  const [currentStep, setCurrentStep] = useState(1); // 1: Wallet, 2: Role, 3: ID
  const [selectedRole, setSelectedRole] = useState<LoginRole | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);

  const roleConfig = {
    manufacturer: {
      icon: Factory,
      label: 'Manufacturer',
      color: 'from-scooter-400 to-scooter-700',
      description: 'Drug manufacturing companies',
      identifierLabel: 'Manufacturer License ID',
      placeholder: 'e.g., MFR-001',
      examples: ['MFR-001 (PharmaCorp Industries)', 'MFR-002 (BioTech Solutions)']
    },
    distributor: {
      icon: Truck,
      label: 'Distributor',
      color: 'from-scooter-100 to-scooter-400',
      description: 'Supply chain distributors',
      identifierLabel: 'Distributor License ID',
      placeholder: 'e.g., DIST-001',
      examples: ['DIST-001 (MediSupply Chain Co.)', 'DIST-002 (Global Pharma Logistics)']
    },
    laboratory: {
      icon: FlaskConical,
      label: 'Laboratory',
      color: 'from-scooter-50 to-scooter-100',
      description: 'Quality testing laboratories',
      identifierLabel: 'Laboratory License ID',
      placeholder: 'e.g., LAB-001',
      examples: ['LAB-001 (PharmaTest Labs)', 'LAB-002 (Quality Assurance Center)']
    },
    pharmacy: {
      icon: Store,
      label: 'Pharmacy',
      color: 'from-scooter-400 to-scooter-700',
      description: 'Retail pharmacies',
      identifierLabel: 'Pharmacy License ID',
      placeholder: 'e.g., PHARM-001',
      examples: ['PHARM-001 (HealthCare Pharmacy)', 'PHARM-002 (City Medical Store)']
    }
  };

  const handleWalletConnect = async () => {
    setError('');
    console.log('Attempting to connect wallet...');
    
    // Check if MetaMask is available
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }
    
    try {
      console.log('Requesting MetaMask popup for user approval...');
      const success = await connectWallet();
      console.log('Wallet connection result:', success);
      
      if (success) {
        console.log('Wallet connected successfully, proceeding to role selection');
        setCurrentStep(2);
      } else {
        setError('Failed to connect wallet. Please approve the connection in MetaMask and try again.');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      setError('Connection cancelled or failed. Please approve the MetaMask connection to continue.');
    }
  };

  const handleRoleSelection = (role: LoginRole) => {
    setSelectedRole(role);
    setCurrentStep(3);
  };

  const handleStakeholderLogin = async () => {
    if (!selectedRole || !identifier.trim()) {
      setError('Please enter your stakeholder ID');
      return;
    }

    setError('');
    const success = await login({
      role: selectedRole,
      identifier: identifier.trim(),
    });

    if (success) {
      onClose();
      resetForm();
    } else {
      setError('Invalid credentials or wallet address doesn\'t match this stakeholder ID.');
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedRole(null);
    setIdentifier('');
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

          {/* Multi-Step Login Flow */}
          {currentStep === 1 ? (
            /* Step 1: Wallet Connection */
            <div className="space-y-6">
              <div className="text-center">
                <Wallet className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
                <p className="text-gray-400 mb-6">
                  Click below to open MetaMask and approve the connection request
                </p>
                
                {walletConnected ? (
                  <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-4">
                    <p className="text-green-400 text-sm">
                      ✓ Wallet Connected: {shortenAddress(connectedAddress || '')}
                    </p>
                  </div>
                ) : null}
                
                <Button
                  onClick={handleWalletConnect}
                  disabled={isLoading || walletConnected}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Waiting for MetaMask approval...
                    </>
                  ) : walletConnected ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Connected - Continue
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Open MetaMask & Approve Connection
                    </>
                  )}
                </Button>

                {walletConnected && (
                  <Button
                    onClick={() => setCurrentStep(2)}
                    className="w-full mt-3 bg-gradient-to-r from-scooter-400 to-scooter-700"
                  >
                    Next: Choose Role
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>

              {/* New Registration Option */}
              <div className="pt-6 border-t border-gray-700">
                <Button
                  onClick={() => setShowRegistration(true)}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700/50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Register as New Stakeholder
                </Button>
              </div>
            </div>
          ) : currentStep === 2 ? (
            /* Step 2: Role Selection */
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Select Your Role</h3>
                <p className="text-gray-400">Choose your stakeholder type</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(roleConfig).map(([role, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <motion.button
                      key={role}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRoleSelection(role as LoginRole)}
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

              <Button
                onClick={() => setCurrentStep(1)}
                variant="outline"
                className="w-full border-gray-600 text-gray-300"
              >
                ← Back to Wallet Connection
              </Button>
            </div>
          ) : (
            /* Step 3: Stakeholder ID Entry */
            <div className="space-y-6">
              {/* Selected Role Header */}
              <div className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-lg">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${roleConfig[selectedRole!].color}`}>
                  {React.createElement(roleConfig[selectedRole!].icon, { className: "h-6 w-6 text-white" })}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{roleConfig[selectedRole!].label} Login</h3>
                  <p className="text-sm text-gray-400">{roleConfig[selectedRole!].description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(2)}
                  className="ml-auto text-gray-400 hover:text-white"
                >
                  Change Role
                </Button>
              </div>

              {/* Wallet Info */}
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  🔗 Connected Wallet: {shortenAddress(connectedAddress || '')}
                </p>
              </div>

              {/* Stakeholder ID Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="identifier" className="text-white">
                    {roleConfig[selectedRole!].identifierLabel}
                  </Label>
                  <Input
                    id="identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={roleConfig[selectedRole!].placeholder}
                    className="mt-2 bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                {/* Example IDs */}
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Demo Login IDs:</h4>
                  <div className="space-y-1">
                    {roleConfig[selectedRole!].examples.map((example, index) => (
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

                <div className="flex space-x-3">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300"
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={handleStakeholderLogin}
                    disabled={isLoading || !identifier.trim()}
                    className="flex-1 bg-gradient-to-r from-scooter-400 to-scooter-700 hover:from-scooter-400 hover:to-scooter-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4 mr-2" />
                        Login
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Stakeholder Registration Modal */}
      <StakeholderRegistration
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
        onSuccess={(stakeholder) => {
          console.log('Stakeholder registered:', stakeholder);
          setShowRegistration(false);
          onClose();
        }}
      />
    </AnimatePresence>
  );
};