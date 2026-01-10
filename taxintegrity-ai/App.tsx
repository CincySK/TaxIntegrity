
import React from 'react';
import Layout from './components/Layout';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  return (
    <Layout>
      <div className="h-full flex flex-col p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Integrity Console</h1>
            <p className="text-slate-400 max-w-xl">
              Monitor, detect, and analyze financial data streams for potential tax non-compliance using Gemini-powered Retrieval Augmented Generation.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
              <span className="block text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Active Cases</span>
              <span className="text-xl font-bold text-white">1,284</span>
            </div>
            <div className="px-4 py-2 bg-emerald-600/10 border border-emerald-500/20 rounded-xl">
              <span className="block text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Efficiency</span>
              <span className="text-xl font-bold text-white">+24.2%</span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-slate-900/30 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-sm">
          <ChatInterface />
        </div>
      </div>
    </Layout>
  );
};

export default App;
