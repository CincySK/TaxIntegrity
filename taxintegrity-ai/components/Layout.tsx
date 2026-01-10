
import React from 'react';
import { ShieldAlert, FileText, LayoutDashboard, Settings, Info, ArrowLeft, ExternalLink } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

// Check if we're embedded in an iframe
const isEmbedded = typeof window !== 'undefined' && window.self !== window.top;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden" style={{ backgroundColor: '#020617' }}>
      {/* Sidebar - hidden when embedded */}
      {!isEmbedded && (
        <aside className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col hidden md:flex">
          <div className="p-6 flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
              <ShieldAlert size={24} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">TaxIntegrity</span>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            <a 
              href="../index.html" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-indigo-400 hover:bg-indigo-600/20 hover:text-indigo-300 mb-2 border border-indigo-500/30"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Main Site</span>
            </a>
            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
            <NavItem icon={<FileText size={20} />} label="Documents" />
            <NavItem icon={<ShieldAlert size={20} />} label="Fraud Reports" />
            <NavItem icon={<Settings size={20} />} label="Settings" />
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs">AI</div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Gemini 3 Pro</span>
                <span className="text-[10px] text-slate-400 uppercase">Operational</span>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className={`h-16 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-8 z-10 ${isEmbedded ? 'px-4' : ''}`}>
          {isEmbedded ? (
            <>
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-indigo-600 rounded-lg">
                  <ShieldAlert size={18} className="text-white" />
                </div>
                <h2 className="text-lg font-semibold text-white">TaxIntegrity RAG Console</h2>
              </div>
              <a 
                href="index.html" 
                target="_top" 
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5"
              >
                <ExternalLink size={14} /> Open Full View
              </a>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-white">Advanced RAG Analyzer</h2>
              <div className="flex items-center gap-4">
                <a 
                  href="../index.html" 
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft size={16} /> Main Site
                </a>
                <button className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                  <Info size={16} /> Help Center
                </button>
                <div className="h-8 w-8 rounded-full border border-slate-700 bg-slate-800"></div>
              </div>
            </>
          )}
        </header>
        
        <div className="flex-1 overflow-y-auto bg-slate-950" style={{ backgroundColor: '#020617' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <a href="#" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${active ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
    {icon}
    <span className="font-medium">{label}</span>
  </a>
);

export default Layout;
