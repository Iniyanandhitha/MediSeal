import { Package, Plus, Zap, Store, Shield, TestTube, BarChart3 } from 'lucide-react';

export const navItems = [
  { name: "Dashboard", link: "/dashboard", icon: <Package className="h-4 w-4" /> },
  { name: "Mint", link: "/mint", icon: <Plus className="h-4 w-4" /> },
  { name: "Inventory", link: "/inventory", icon: <Package className="h-4 w-4" /> },
  { name: "Transfer", link: "/transfer", icon: <Zap className="h-4 w-4" /> },
  { name: "Laboratory", link: "/laboratory", icon: <TestTube className="h-4 w-4" /> },
  { name: "Pharmacy", link: "/pharmacy", icon: <Store className="h-4 w-4" /> },
  { name: "Verify", link: "/verify", icon: <Shield className="h-4 w-4" /> },
  { name: "Analytics", link: "/analytics", icon: <BarChart3 className="h-4 w-4" /> },
];