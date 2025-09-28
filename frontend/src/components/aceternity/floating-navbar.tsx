"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LoginModal } from "@/components/LoginModal";
import { LogOut, ChevronDown } from "lucide-react";
import Link from "next/link";

interface NavItem {
  name: string;
  link: string;
  icon?: React.ReactNode;
}

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: NavItem[];
  className?: string;
}) => {
  const { user, isAuthenticated, logout, canAccessPage } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleWalletAction = () => {
    if (isAuthenticated) {
      setShowDropdown(!showDropdown);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter navigation items based on user permissions
  const filteredNavItems = navItems.filter(item => {
    const pageName = item.link.replace('/', '') || 'dashboard';
    return canAccessPage(pageName);
  });

  return (
    <>
      <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.2,
        }}
        className={`flex max-w-fit fixed top-10 inset-x-0 mx-auto border border-gray-600/50 rounded-full bg-gray-900/90 backdrop-blur-lg shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] px-8 py-2 items-center justify-center space-x-4 ${className}`}
      >
        {filteredNavItems.map((navItem: NavItem) => (
          <Link
            key={`${navItem.name}-${navItem.link}`}
            href={navItem.link}
            className="relative text-gray-300 items-center flex space-x-1 hover:text-white transition-colors duration-200"
          >
            <span className="block sm:hidden">{navItem.icon}</span>
            <motion.span
              className="hidden sm:block text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {navItem.name}
            </motion.span>
          </Link>
        ))}
        
        {/* Authentication Button */}
        <div className="relative" ref={dropdownRef}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleWalletAction}
              className="text-sm font-medium relative border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700/50 hover:border-gray-500 px-4 py-2 rounded-full bg-transparent transition-all duration-200 flex items-center space-x-2"
            >
              <span>
                {isAuthenticated 
                  ? user?.role === 'consumer' 
                    ? `${user.walletAddress?.slice(0, 6)}...${user.walletAddress?.slice(-4)}`
                    : `${user?.name || user?.id}` 
                  : "Connect & Login"
                }
              </span>
              {isAuthenticated && <ChevronDown className="h-3 w-3" />}
              <div className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-scooter-400 to-transparent h-px" />
            </Button>
          </motion.div>

          {/* Dropdown Menu */}
          {isAuthenticated && showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50"
            >
              <div className="p-2">
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect & Logout
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
};