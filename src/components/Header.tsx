import React from 'react';
import { Sparkles, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { AppTab } from '../types';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  isOfflineMode: boolean;
  setIsOfflineMode: (offline: boolean) => void;
  checkStatus: () => void;
  apiHealth: { hasApiKey: boolean; status: string } | null;
}

export default function Header({
  activeTab,
  setActiveTab,
  isOfflineMode,
  setIsOfflineMode,
  checkStatus,
  apiHealth
}: HeaderProps) {
  const tabs: { id: AppTab; label: string; desc: string }[] = [
    { id: 'image', label: 'Image Editor', desc: 'Canvas filters & drawing' },
    { id: 'video', label: 'Video Stage', desc: 'Slideshow frame exports' },
    { id: 'text', label: 'Draft Desk', desc: 'Rich doc tone rewriter' },
    { id: 'publish', label: 'Publish Grid', desc: 'Grid block layout arranger' },
    { id: 'campaign', label: 'Campaign Hub', desc: 'Interactive social ad previews' },
  ];

  return (
    <header className="border-b border-editorial-dark bg-editorial-cream sticky top-0 z-40 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Branding & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 border border-editorial-dark bg-editorial-dark flex items-center justify-center shadow-sm">
            <Sparkles className="h-5 w-5 text-editorial-bg animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-editorial-dark flex items-center gap-2 font-serif-italic">
              OmniStudio <span className="text-[10px] bg-editorial-dark text-editorial-bg font-mono px-2 py-0.5 tracking-wider uppercase">Offline AI Suite</span>
            </h1>
            <p className="text-xs text-editorial-dark/60 font-sans">All-in-one image, video, rich text, brochure layout, & ad campaign builder</p>
          </div>
        </div>

        {/* Connectivity Control Simulator */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Key Checklist & Health */}
          <div className="hidden lg:flex items-center gap-2 mr-2 text-[11px] font-mono border-r border-editorial-dark/30 pr-4 text-editorial-dark/60">
            <span>Gemini Key:</span>
            {apiHealth?.hasApiKey ? (
              <span className="text-emerald-700 flex items-center gap-1 font-bold">
                ● Registered
              </span>
            ) : (
              <span className="text-amber-800 font-semibold cursor-help" title="Using offline capabilities. Configure key in Secrets panel for online assistance.">
                Offline Mode Active
              </span>
            )}
          </div>

          <button
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            className={`flex items-center gap-2 px-3.5 py-1.5 border uppercase tracking-wider text-xs font-semibold cursor-pointer transition-all duration-300 ${
              isOfflineMode
                ? 'bg-editorial-dark text-editorial-bg border-editorial-dark'
                : 'bg-editorial-bg text-editorial-dark border-editorial-dark hover:bg-editorial-cream'
            }`}
          >
            {isOfflineMode ? (
              <>
                <WifiOff className="h-3.5 w-3.5 shrink-0" />
                <span>Offline Sandbox Active</span>
              </>
            ) : (
              <>
                <Wifi className="h-3.5 w-3.5 shrink-0" />
                <span>Dynamic Live Connected</span>
              </>
            )}
          </button>

          <button 
            onClick={checkStatus}
            className="p-2 border border-editorial-dark text-editorial-dark hover:bg-editorial-dark/10 transition cursor-pointer"
            title="Check connection health"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>

      {/* Primary Tab Navigation */}
      <div className="max-w-7xl mx-auto mt-4 overflow-x-auto scrollbar-none">
        <div className="flex border-b border-editorial-dark/25 p-0.5 gap-1 min-w-[620px]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-3 text-left transition-all cursor-pointer border-t border-x border-transparent ${
                  isActive 
                    ? 'bg-editorial-bg text-editorial-dark border-editorial-dark border-b-transparent border-t-2 font-bold shadow-none' 
                    : 'text-editorial-dark/60 hover:text-editorial-dark hover:bg-editorial-dark/5'
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wider">{tab.label}</div>
                <div className="text-[10px] opacity-70 line-clamp-1 mt-0.5 font-sans font-normal">{tab.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
