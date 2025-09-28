declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    strokeWidth?: string | number;
  }

  export type LucideIcon = FC<LucideProps>;

  // Commonly used icons
  export const X: LucideIcon;
  export const User: LucideIcon;
  export const Factory: LucideIcon;
  export const Truck: LucideIcon;
  export const Store: LucideIcon;
  export const FlaskConical: LucideIcon;
  export const Loader2: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Wallet: LucideIcon;
  export const Plus: LucideIcon;
  export const Package: LucideIcon;
  export const Shield: LucideIcon;
  export const Users: LucideIcon;
  export const BarChart3: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const Zap: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const Eye: LucideIcon;
  export const Copy: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const LogOut: LucideIcon;
  export const Check: LucideIcon;

  // Export all icons as a default export as well
  const lucideReact: {
    [key: string]: LucideIcon;
  };
  export default lucideReact;
}