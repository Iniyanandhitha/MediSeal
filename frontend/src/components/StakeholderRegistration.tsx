"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWeb3, shortenAddress } from '@/contexts/Web3Context';
import { 
  X, 
  Factory,
  Truck,
  Store,
  FlaskConical,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Wallet
} from 'lucide-react';

interface StakeholderRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (stakeholder: RegisteredStakeholder) => void;
}

type StakeholderRole = 'manufacturer' | 'distributor' | 'pharmacy' | 'laboratory';

interface StakeholderData {
  role: StakeholderRole;
  organizationName: string;
  licenseNumber: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  country: string;
}

interface RegisteredStakeholder extends StakeholderData {
  walletAddress: string;
  transactionHash: string;
  isVerified: boolean;
}

const roleConfig = {
  manufacturer: {
    icon: Factory,
    title: 'Manufacturer',
    description: 'Drug manufacturing companies',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  distributor: {
    icon: Truck,
    title: 'Distributor', 
    description: 'Supply chain distributors',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  pharmacy: {
    icon: Store,
    title: 'Pharmacy',
    description: 'Retail pharmacies',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  laboratory: {
    icon: FlaskConical,
    title: 'Laboratory',
    description: 'Quality testing laboratories',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20'
  }
};

export function StakeholderRegistration({ isOpen, onClose, onSuccess }: StakeholderRegistrationProps) {
  const { wallet, connectWallet } = useWeb3();
  const [currentStep, setCurrentStep] = useState(1);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'registering' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [stakeholderData, setStakeholderData] = useState<StakeholderData>({
    role: 'manufacturer',
    organizationName: '',
    licenseNumber: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    country: ''
  });

  const handleInputChange = (field: keyof StakeholderData, value: string) => {
    setStakeholderData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    return stakeholderData.role && 
           stakeholderData.organizationName.trim() && 
           stakeholderData.licenseNumber.trim();
  };

  const validateStep2 = () => {
    return stakeholderData.email.trim() && 
           stakeholderData.address.trim() && 
           stakeholderData.city.trim() && 
           stakeholderData.country.trim();
  };

  // Kept for future blockchain integration
  // const getRoleValue = (role: StakeholderRole): number => {
  //   const roleMap = {
  //     manufacturer: 0,
  //     distributor: 1,
  //     pharmacy: 2,
  //     laboratory: 5
  //   };
  //   return roleMap[role];
  // };

  const registerOnBlockchain = async (): Promise<string> => {
    // Mock blockchain registration - replace with actual smart contract call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate blockchain transaction
        const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
        if (Math.random() > 0.1) { // 90% success rate
          resolve(mockTxHash);
        } else {
          reject(new Error('Blockchain registration failed'));
        }
      }, 3000);
    });

    /* 
    // Actual blockchain integration would look like this:
    
    try {
      // Load contract ABI and address
      const contractAddress = 'YOUR_CONTRACT_ADDRESS';
      const contractABI = [...]; // Your contract ABI
      
      // Create contract instance
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      // Call registerStakeholder function
      const tx = await contract.registerStakeholder(
        wallet.address,
        getRoleValue(stakeholderData.role)
      );
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      return receipt.hash;
      
    } catch (error) {
      throw new Error(`Blockchain registration failed: ${error.message}`);
    }
    */
  };

  const handleRegistration = async () => {
    if (!wallet.isConnected) {
      setErrorMessage('Please connect your wallet first');
      return;
    }

    setIsRegistering(true);
    setRegistrationStatus('registering');
    setErrorMessage('');

    try {
      // Register on blockchain
      const txHash = await registerOnBlockchain();

      // Create registered stakeholder object
      const registeredStakeholder: RegisteredStakeholder = {
        ...stakeholderData,
        walletAddress: wallet.address!,
        transactionHash: txHash,
        isVerified: false // Will be verified by admin later
      };

      setRegistrationStatus('success');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(registeredStakeholder);
      }

      // Auto close after 3 seconds
      setTimeout(() => {
        onClose();
        resetForm();
      }, 3000);

    } catch (error) {
      setRegistrationStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setRegistrationStatus('idle');
    setErrorMessage('');
    setStakeholderData({
      role: 'manufacturer',
      organizationName: '',
      licenseNumber: '',
      email: '',
      phoneNumber: '',
      address: '',
      city: '',
      country: ''
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900/95 border border-gray-700 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Stakeholder Registration
              </h2>
              <p className="text-gray-400">
                Register your organization on the MediSeal blockchain
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    ${currentStep >= step 
                      ? 'bg-scooter-600 text-white' 
                      : 'bg-gray-700 text-gray-400'
                    }
                  `}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`
                      w-12 h-1 mx-2
                      ${currentStep > step 
                        ? 'bg-scooter-600' 
                        : 'bg-gray-700'
                      }
                    `} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          {registrationStatus === 'success' ? (
            // Success State
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-600 mb-2">
                Registration Successful!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your stakeholder registration has been submitted to the blockchain.
              </p>
              <p className="text-sm text-gray-500">
                You will be notified once your registration is verified by an administrator.
              </p>
            </div>
          ) : registrationStatus === 'error' ? (
            // Error State  
            <div className="text-center py-8">
              <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-red-600 mb-2">
                Registration Failed
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {errorMessage}
              </p>
              <Button onClick={() => setRegistrationStatus('idle')}>
                Try Again
              </Button>
            </div>
          ) : currentStep === 1 ? (
            // Step 1: Basic Information
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-4 block text-white">
                  Select Your Role
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(roleConfig).map(([role, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={role}
                        onClick={() => handleInputChange('role', role as StakeholderRole)}
                        className={`
                          p-4 rounded-lg border-2 transition-all duration-200 text-left bg-gray-800/50
                          ${stakeholderData.role === role
                            ? `border-scooter-500 ${config.color}`
                            : 'border-gray-700 hover:border-gray-600'
                          }
                        `}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${config.color}`} />
                        <h3 className="font-semibold text-white">{config.title}</h3>
                        <p className="text-sm text-gray-400">
                          {config.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organizationName" className="text-white">Organization Name *</Label>
                  <Input
                    id="organizationName"
                    value={stakeholderData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    placeholder="Enter organization name"
                    className="mt-2 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="licenseNumber" className="text-white">License Number *</Label>
                  <Input
                    id="licenseNumber"
                    value={stakeholderData.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    placeholder="Enter license number"
                    className="mt-2 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!validateStep1()}
                >
                  Next Step
                </Button>
              </div>
            </div>
          ) : currentStep === 2 ? (
            // Step 2: Contact Information
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-white">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={stakeholderData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="organization@example.com"
                    className="mt-2 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber" className="text-white">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={stakeholderData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="mt-2 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-white">Street Address *</Label>
                <Input
                  id="address"
                  value={stakeholderData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Main Street"
                  className="mt-2 bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-white">City *</Label>
                  <Input
                    id="city"
                    value={stakeholderData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="New York"
                    className="mt-2 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="text-white">Country *</Label>
                  <Input
                    id="country"
                    value={stakeholderData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="United States"
                    className="mt-2 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!validateStep2()}
                >
                  Next Step
                </Button>
              </div>
            </div>
          ) : (
            // Step 3: Wallet Connection & Registration
            <div className="space-y-6">
              {/* Wallet Connection */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                  <Wallet className="w-5 h-5 mr-2" />
                  Wallet Connection
                </h3>
                
                {wallet.isConnected ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        Connected Wallet:
                      </span>
                      <span className="font-mono text-sm text-white">
                        {shortenAddress(wallet.address || '')}
                      </span>
                    </div>
                    {wallet.balance && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">
                          Balance:
                        </span>
                        <span className="text-sm text-white">
                          {parseFloat(wallet.balance).toFixed(4)} ETH
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-400 mb-4">
                      Connect your wallet to complete registration
                    </p>
                    <Button onClick={connectWallet} className="bg-scooter-600 hover:bg-scooter-700">
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Wallet
                    </Button>
                  </div>
                )}
              </div>

              {/* Registration Summary */}
              <div className="bg-scooter-900/20 border border-scooter-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-white">Registration Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Role:</span>
                    <span className="font-semibold text-white">
                      {roleConfig[stakeholderData.role].title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Organization:</span>
                    <span className="font-semibold text-white">
                      {stakeholderData.organizationName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">License:</span>
                    <span className="font-semibold text-white">
                      {stakeholderData.licenseNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  disabled={isRegistering}
                >
                  Previous
                </Button>
                <Button
                  onClick={handleRegistration}
                  disabled={!wallet.isConnected || isRegistering}
                  className="min-w-[140px] bg-gradient-to-r from-scooter-400 to-scooter-700 hover:from-scooter-500 hover:to-scooter-800"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && registrationStatus === 'idle' && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-400 text-sm">{errorMessage}</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}