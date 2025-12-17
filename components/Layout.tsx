import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Users, Settings, Menu, X, Plus, 
  Search, Bell, Zap, Loader2, Command, PieChart, Wallet
} from 'lucide-react';
import { generateSmartInvoiceItems } from '../services/geminiService';

interface LayoutProps {
  children: React.ReactNode;
}

const RingLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.5" />
    <path strokeLinecap="round" d="M12 8v8M8 12h8" />
  </svg>
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSmartCreateOpen, setIsSmartCreateOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FileText, label: 'Invoices', path: '/invoices' }, 
    { icon: Users, label: 'Clients', path: '/clients' },
    { icon: Wallet, label: 'Expenses', path: '/expenses-placeholder' },
    { icon: Users, label: 'Payroll', path: '/payroll-placeholder' },
    { icon: PieChart, label: 'Reports', path: '/reports-placeholder' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleSmartCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const items = await generateSmartInvoiceItems(aiPrompt);
      setIsSmartCreateOpen(false);
      setAiPrompt('');
      navigate('/invoices/new', { state: { smartItems: items } });
    } catch (error) {
      console.error(error);
      alert("Failed to generate invoice items. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualCreate = () => {
    setIsSmartCreateOpen(false);
    navigate('/invoices/new');
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans text-sm text-gray-900 selection:bg-gray-900 selection:text-white">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white z-30 flex items-center justify-between px-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <RingLogo className="w-6 h-6 text-black" />
          <span className="font-bold text-lg tracking-tight">RING</span>
        </div>
        <button 
          onClick={toggleMobileMenu} 
          className="p-2 text-gray-500 hover:text-black transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={closeMobileMenu}>
           <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
           <div 
             className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out p-6"
             onClick={(e) => e.stopPropagation()}
           >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                   <RingLogo className="w-6 h-6 text-black" />
                   <span className="font-bold text-xl tracking-tight">RING</span>
                </div>
                <button onClick={closeMobileMenu}>
                   <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="mb-8">
                <button 
                  onClick={() => { closeMobileMenu(); setIsSmartCreateOpen(true); }}
                  className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-3.5 rounded-full font-medium shadow-lg shadow-gray-200 active:scale-95 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create New</span>
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gray-100 text-black font-semibold'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" strokeWidth={2} />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
           </div>
        </div>
      )}

      {/* Desktop Sidebar - Clean & White */}
      <aside className="w-[260px] bg-white flex-col hidden md:flex z-20 flex-shrink-0 p-6 border-r border-gray-50/50">
        <div className="flex items-center gap-2 mb-10 px-2">
           <RingLogo className="w-6 h-6 text-black" />
           <span className="font-bold text-xl tracking-tight">RING</span>
        </div>

        <div className="mb-8">
          <button 
            onClick={() => setIsSmartCreateOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white px-4 py-3 rounded-full font-medium shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 group"
          >
            <Plus className="w-4 h-4" />
            <span>Create New</span>
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gray-50 text-black font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-black font-medium'
                }`
              }
            >
              <item.icon className={`w-5 h-5 transition-colors ${({ isActive }: any) => isActive ? 'text-black' : 'text-gray-400'}`} strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Snippet */}
        <div className="mt-auto pt-6 flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                LS
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">Landscape Svcs</p>
                <p className="text-xs text-gray-400 truncate">Pro Plan</p>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden pt-16 md:pt-0 relative bg-[#fdfdfd]">
        {/* Minimal Header */}
        <header className="h-24 bg-transparent flex flex-col justify-center px-8 flex-shrink-0 space-y-4">
           {/* Top Row */}
           <div className="flex items-center justify-between mt-4">
              <h2 className="font-bold text-2xl text-gray-900 tracking-tight">Overview</h2>
              <div className="flex items-center gap-3">
                  <div className="relative hidden md:block group">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      className="pl-10 pr-4 py-2 rounded-full bg-gray-100/50 border-none focus:bg-gray-100 focus:ring-0 outline-none w-64 transition-all text-sm placeholder:text-gray-400"
                    />
                  </div>
                  <button className="w-9 h-9 bg-gray-100/50 hover:bg-gray-100 rounded-full flex items-center justify-center transition-all relative">
                    <Bell className="w-4 h-4 text-gray-600" />
                    <span className="absolute top-2.5 right-3 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  </button>
              </div>
           </div>

           {/* Sub Nav */}
           <div className="flex items-center justify-between pb-2">
              <div className="flex gap-6">
                 <button className="text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-black pb-1 transition-all">Overview</button>
                 <button className="text-sm font-medium text-gray-400 hover:text-gray-600 border-b-2 border-transparent pb-1 transition-all">Analytics</button>
                 <button className="text-sm font-medium text-gray-400 hover:text-gray-600 border-b-2 border-transparent pb-1 transition-all">Reports</button>
              </div>
              <div className="hidden md:block">
                 <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors">
                    <Zap className="w-3 h-3 text-gray-400" />
                    AI Insights
                 </button>
              </div>
           </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar relative">
          {children}
        </main>

        {/* Smart Create Modal */}
        {isSmartCreateOpen && (
          <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up ring-1 ring-gray-100">
                <div className="p-8">
                   <div className="flex justify-between items-start mb-6">
                      <div>
                          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                            <Zap className="w-5 h-5 text-black fill-black" />
                          </div>
                          <h2 className="text-2xl font-bold text-gray-900">Smart Create</h2>
                          <p className="text-gray-500 mt-1">Describe what you want to bill for.</p>
                      </div>
                      <button onClick={() => setIsSmartCreateOpen(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                   </div>

                   <form onSubmit={handleSmartCreate} className="space-y-6">
                       <div className="relative">
                           <textarea 
                             autoFocus
                             placeholder="E.g. Invoice to Acme Corp for 5 hours of consultation at $150/hr and a $500 retainer fee." 
                             className="w-full p-4 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-black focus:ring-0 outline-none resize-none h-32 text-base transition-all placeholder:text-gray-400"
                             value={aiPrompt}
                             onChange={(e) => setAiPrompt(e.target.value)}
                             onKeyDown={(e) => {
                                 if (e.key === 'Enter' && !e.shiftKey) {
                                     e.preventDefault();
                                     handleSmartCreate(e);
                                 }
                             }}
                           />
                           <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-gray-400">
                               <Command className="w-3 h-3" />
                               <span>Enter</span>
                           </div>
                       </div>
                       
                       <div className="flex gap-3">
                          <button 
                            type="button"
                            onClick={handleManualCreate}
                            className="flex-1 py-3 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            Manual
                          </button>
                          <button 
                            type="submit"
                            disabled={!aiPrompt.trim() || isGenerating}
                            className="flex-1 py-3 rounded-xl bg-black text-white font-medium hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                          >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                            Generate
                          </button>
                       </div>
                   </form>
                </div>
                <div className="bg-gray-50 p-4 text-center">
                    <p className="text-xs text-gray-400 font-medium">Powered by Gemini 2.5 Flash</p>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;