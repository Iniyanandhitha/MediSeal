"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LoginModal } from "@/components/LoginModal";
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

  const handleWalletAction = () => {
    if (isAuthenticated) {
      logout();
    } else {
      setShowLoginModal(true);
    }
  };

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
        {filteredNavItems.map((navItem: NavItem, idx: number) => (
          <Link
            key={`link-${idx}`}
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
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handleWalletAction}
            className="text-sm font-medium relative border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700/50 hover:border-gray-500 px-4 py-2 rounded-full bg-transparent transition-all duration-200"
          >
            <span>
              {isAuthenticated 
                ? user?.role === 'consumer' 
                  ? `${user.walletAddress?.slice(0, 6)}...${user.walletAddress?.slice(-4)}`
                  : `${user?.name || user?.id}` 
                : "Login"
              }
            </span>
            <div className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-scooter-400 to-transparent h-px" />
          </Button>
        </motion.div>
      </motion.div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
};