"use client";

import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { motion } from "framer-motion";
import { X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const handleScan = (detectedCodes: { rawValue: string }[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      onScan(detectedCodes[0].rawValue);
      onClose();
    }
  };

  const handleError = (error: unknown) => {
    console.error("QR Scanner Error:", error);
    setHasPermission(false);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Camera className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Scan QR Code</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-800 mb-4">
          {hasPermission === false ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <Camera className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-white font-medium mb-2">Camera Permission Required</p>
              <p className="text-gray-400 text-sm mb-4">
                Please allow camera access to scan QR codes
              </p>
              <Button
                onClick={() => setHasPermission(null)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <Scanner
              onScan={handleScan}
              onError={handleError}
            />
          )}
        </div>

        <div className="text-center text-gray-400 text-sm">
          Position the QR code within the camera view to scan
        </div>
      </motion.div>
    </motion.div>
  );
};