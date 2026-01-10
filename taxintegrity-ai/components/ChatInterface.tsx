
import { Send, FileCheck, AlertTriangle, ChevronRight, FileText, ShieldCheck, Lock } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { geminiService, INTERNAL_KNOWLEDGE_BASE } from '../services/geminiService';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "TaxIntegrity Console Online. Analyzing system knowledge base: GAO-24-106449 (IRS Tax Gap). How can I assist with your audit query?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await geminiService.getChatResponse(input, messages);
      const modelMessage: Message = {
        role: 'model',
        content: response.text || "Communication error with integrity engine.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isApiKeyError = errorMessage.includes('API') || errorMessage.includes('key') || errorMessage.includes('401') || errorMessage.includes('403');
      
      setMessages(prev => [...prev, {
        role: 'model',
        content: isApiKeyError 
          ? "⚠️ API Configuration Required: Please set up your GEMINI_API_KEY in the .env file to enable AI responses. Visit https://aistudio.google.com/apikey to get a free API key."
          : `Operational failure: ${errorMessage}. Please check the console for details.`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full max-w-6xl mx-auto">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900 border-x border-slate-800">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-xl ${
                m.role === 'user' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-800 text-slate-100 border border-slate-700'
              }`}>
                <div className="text-sm prose prose-invert">
                  {m.content.split('\n').map((line, idx) => (
                    <p key={idx} className="mb-2 last:mb-0 leading-relaxed">{line}</p>
                  ))}
                </div>
                <span className="text-[10px] opacity-50 mt-2 block uppercase tracking-widest font-bold">
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {m.role === 'model' ? 'Verified System' : 'Auditor'}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 flex gap-2 items-center">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-300 font-medium">Consulting Internal Knowledge...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar - Upload Removed */}
        <div className="p-6 border-t border-slate-800 bg-slate-950">
          <div className="flex gap-4 items-end bg-slate-900 border border-slate-700 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Query verified tax evidence..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-500 p-3 resize-none max-h-48 scrollbar-hide"
            />
            <div className="flex gap-2 pb-1 pr-1">
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-500 mt-3 font-medium uppercase tracking-tighter flex items-center justify-center gap-1">
            <Lock size={10} /> Locked Context Environment • Gemini-3 Pro
          </p>
        </div>
      </div>

      {/* RAG Context Sidebar - Fixed/Static */}
      <div className="w-80 p-6 hidden lg:block overflow-y-auto border-r border-slate-800">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <ShieldCheck size={16} className="text-indigo-400" /> System Context
        </h3>
        
        <div className="space-y-3">
          {INTERNAL_KNOWLEDGE_BASE.map(source => (
            <div key={source.id} className="p-3 bg-slate-900 border border-indigo-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={14} className="text-indigo-400 shrink-0" />
                <span className="text-xs font-semibold truncate text-slate-300">{source.fileName}</span>
              </div>
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-full"></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Verified Source</span>
                <span className="text-[9px] text-indigo-400 font-bold tracking-widest underline decoration-indigo-500/30 cursor-help">READ ONLY</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" /> Active Constraints
          </h3>
          <InsightCard 
            title="Closed-World RAG" 
            desc="Model will not use data outside the verified GAO reports." 
            severity="low"
          />
          <InsightCard 
            title="Fact Precision" 
            desc="Temperature set to 0.1 for high-fidelity compliance analysis." 
            severity="medium"
          />
        </div>
      </div>
    </div>
  );
};

const InsightCard = ({ title, desc, severity }: { title: string, desc: string, severity: 'low' | 'medium' | 'high' }) => (
  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs font-bold text-slate-200">{title}</span>
      <div className={`w-2 h-2 rounded-full ${severity === 'high' ? 'bg-red-500' : severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
    </div>
    <p className="text-[11px] text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

export default ChatInterface;
