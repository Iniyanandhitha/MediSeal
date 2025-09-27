# PharmaChain Frontend

A futuristic and modern web application for pharmaceutical supply chain management built with cutting-edge technologies.

## 🚀 Features

### ✨ Modern UI/UX
- **Futuristic Design**: Stunning glassmorphism effects, animated backgrounds, and modern gradients
- **Aceternity UI Components**: Custom animated components for enhanced user experience
- **Shadcn/UI**: Robust and accessible UI components
- **Framer Motion**: Smooth animations and micro-interactions
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### 🔒 Core Functionality
- **Dashboard**: Comprehensive overview of pharmaceutical inventory and operations
- **Mint Batch**: Create new pharmaceutical batches with blockchain verification
- **Inventory Management**: Track and manage pharmaceutical stock levels
- **Transfer System**: Secure batch transfers between stakeholders
- **Verification Portal**: Real-time drug authenticity verification

## 🛠 Technology Stack

### Frontend Framework
- **Next.js 14**: React framework with App Router for optimal performance
- **TypeScript**: Type-safe development with enhanced developer experience
- **React 18**: Latest React features with concurrent rendering

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Aceternity UI**: Futuristic animated components
- **Shadcn/UI**: Modern component library
- **Framer Motion**: Production-ready motion library
- **Lucide React**: Beautiful, customizable icons

### Development Tools
- **ESLint**: Code linting for consistent code quality
- **PostCSS**: CSS processing with autoprefixer
- **Turbopack**: Ultra-fast bundler for development

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Main dashboard
│   │   ├── mint/              # Batch minting interface
│   │   ├── inventory/         # Inventory management
│   │   ├── transfer/          # Transfer operations
│   │   ├── verify/            # Product verification
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/
│   │   ├── aceternity/        # Custom animated components
│   │   │   ├── background-beams.tsx
│   │   │   ├── floating-navbar.tsx
│   │   │   └── hover-card.tsx
│   │   └── ui/                # Shadcn/UI components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       └── textarea.tsx
│   └── lib/
│       └── utils.ts           # Utility functions
├── public/                    # Static assets
├── tailwind.config.ts         # Tailwind configuration
├── next.config.ts            # Next.js configuration
└── package.json              # Dependencies and scripts
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue to Purple gradients (#3B82F6 → #8B5CF6)
- **Secondary**: Purple to Pink gradients (#8B5CF6 → #EC4899)
- **Success**: Green shades (#10B981)
- **Warning**: Yellow/Orange shades (#F59E0B)
- **Error**: Red shades (#EF4444)
- **Background**: Dark theme with gray-900/black base

### Typography
- **Font**: System fonts with fallbacks
- **Headings**: Bold weights with gradient text effects
- **Body**: Regular weight with high contrast for readability

### Components
- **Glass morphism**: Backdrop blur effects with transparency
- **Animated backgrounds**: Dynamic beam effects and gradients
- **Hover effects**: 3D transforms and glow effects
- **Loading states**: Smooth skeleton loaders and spinners

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PharmaChain/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 📱 Pages Overview

### 🏠 Homepage (`/`)
- **Hero Section**: Animated introduction with call-to-action buttons
- **Features Grid**: Key capabilities showcase
- **Navigation**: Quick access to dashboard and verification

### 📊 Dashboard (`/dashboard`)
- **Statistics Cards**: Key metrics with animated counters
- **Quick Actions**: One-click access to common operations
- **Recent Activity**: Latest batches and transfers
- **System Status**: Real-time health monitoring

### 🏭 Mint (`/mint`)
- **Batch Form**: Comprehensive batch creation interface
- **File Upload**: Document attachment with IPFS integration
- **Preview Panel**: Real-time batch information display
- **Guidelines**: Helpful minting instructions

### 📦 Inventory (`/inventory`)
- **Search & Filter**: Advanced inventory search capabilities
- **Stock Overview**: Visual stock level indicators
- **Batch Table**: Detailed inventory listing with actions
- **Status Indicators**: Color-coded status system

### 🔄 Transfer (`/transfer`)
- **Transfer Form**: Secure batch transfer interface
- **Active Transfers**: Real-time transfer tracking
- **Progress Indicators**: Visual transfer progress
- **Security Features**: Verification and tracking details

### 🔍 Verify (`/verify`)
- **Verification Form**: QR code and batch number input
- **Results Display**: Comprehensive verification results
- **Blockchain Data**: Hash verification and IPFS links
- **Transfer History**: Complete audit trail

## 🎯 Key Features

### 🔮 Futuristic UI Elements
- **Animated Backgrounds**: Dynamic beam effects with particle systems
- **Floating Navigation**: Glassmorphism navigation with smooth transitions
- **Hover Cards**: 3D transform effects on interactive elements
- **Gradient Text**: Multi-color gradient text animations
- **Loading States**: Skeleton loaders and progress indicators

### 🎪 Animations & Interactions
- **Page Transitions**: Smooth enter/exit animations
- **Micro-interactions**: Button hovers and form interactions
- **Scroll Animations**: Reveal animations on scroll
- **Loading States**: Professional loading experiences

### 📱 Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Perfect tablet experience
- **Desktop Enhanced**: Rich desktop interactions
- **Cross-Browser**: Compatible across modern browsers

## 🔧 Customization

### Adding New Components
1. Create component in appropriate directory
2. Follow naming conventions (PascalCase)
3. Include TypeScript interfaces
4. Add Framer Motion animations
5. Implement responsive design

### Modifying Styles
- Edit `tailwind.config.ts` for theme customization
- Use CSS variables for dynamic theming
- Follow existing color palette and spacing

### Adding New Pages
1. Create page in `src/app/` directory
2. Include in navigation system
3. Add responsive layout
4. Implement loading states

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Create `.env.local` for environment-specific configurations:

```env
NEXT_PUBLIC_BLOCKCHAIN_RPC_URL=your_rpc_url
NEXT_PUBLIC_IPFS_GATEWAY=your_ipfs_gateway
```

### Deployment Platforms
- **Vercel**: Optimal for Next.js applications
- **Netlify**: Static site hosting with edge functions
- **AWS Amplify**: Full-stack deployment
- **Docker**: Containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Aceternity UI**: For beautiful animated components
- **Shadcn/UI**: For robust UI primitives
- **Framer Motion**: For smooth animations
- **Tailwind CSS**: For utility-first styling
- **Next.js Team**: For the excellent React framework

---

Built with ❤️ for the future of pharmaceutical supply chain management.
