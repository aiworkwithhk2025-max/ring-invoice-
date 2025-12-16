import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Settings, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const RingLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="bill-gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F5F3FF" />
        <stop offset="100%" stopColor="#EDE9FE" />
      </linearGradient>
    </defs>
    
    {/* Banknotes - Stacked and fanned */}
    <g transform="translate(45, 100)">
      {/* Bill 1 */}
      <g transform="rotate(-15 40 60)">
         <rect x="0" y="0" width="90" height="55" rx="6" fill="url(#bill-gradient)" stroke="#531FDE" strokeWidth="5" />
         <circle cx="45" cy="27.5" r="12" fill="#531FDE" opacity="0.2" />
      </g>
      {/* Bill 2 */}
      <g transform="translate(15, -5) rotate(0 40 60)">
         <rect x="0" y="0" width="90" height="55" rx="6" fill="url(#bill-gradient)" stroke="#531FDE" strokeWidth="5" />
         <circle cx="45" cy="27.5" r="12" fill="#531FDE" opacity="0.2" />
      </g>
      {/* Bill 3 */}
      <g transform="translate(30, -5) rotate(15 40 60)">
         <rect x="0" y="0" width="90" height="55" rx="6" fill="url(#bill-gradient)" stroke="#531FDE" strokeWidth="5" />
         <circle cx="45" cy="27.5" r="14" fill="#531FDE" />
      </g>
    </g>

    {/* Arrows - Swooshing up */}
    <g transform="translate(0, -10)">
      <path d="M40 110 Q 70 40 150 60" stroke="#7C3AED" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M130 45 L 150 60 L 132 75" fill="#7C3AED" />

      <path d="M30 130 Q 60 60 140 80" stroke="#531FDE" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M120 65 L 140 80 L 122 95" fill="#531FDE" />

      <path d="M20 150 Q 50 80 130 100" stroke="#4C1DCB" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M110 85 L 130 100 L 112 115" fill="#4C1DCB" />
    </g>
  </svg>
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FileText, label: 'Invoices', path: '/invoices' },
    { icon: Users, label: 'Clients', path: '/clients' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <RingLogo className="w-8 h-8" />
          <span className="font-bold text-xl text-gray-900 tracking-tight">Ring</span>
        </div>
        <button 
          onClick={toggleMobileMenu} 
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" 
            onClick={closeMobileMenu}
          />
          
          {/* Sidebar Content */}
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out animate-in slide-in-from-left">
            <div className="flex flex-col h-full">
               <div className="p-6 flex items-center gap-3 border-b border-gray-100 h-16">
                <RingLogo className="w-8 h-8" />
                <span className="font-bold text-xl text-gray-900 tracking-tight">Ring</span>
              </div>
              
              <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-brand-50 text-brand-800 shadow-sm border border-brand-100'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    JD
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">John Doe</span>
                    <span className="text-xs text-gray-500">Admin</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex z-20">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <RingLogo className="w-10 h-10" />
          <span className="font-bold text-2xl text-gray-900 tracking-tight">Ring</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-50 text-brand-800 shadow-sm border border-brand-100'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              JD
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">John Doe</span>
              <span className="text-xs text-gray-500">Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;