import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageEditor from './components/ImageEditor';
import VideoEditor from './components/VideoEditor';
import TextDrafts from './components/TextDrafts';
import PublishingGrid from './components/PublishingGrid';
import CampaignHub from './components/CampaignHub';
import { AppTab, AppNotification } from './types';
import { Sparkles, WifiOff, X, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('image');
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(true); // starts true by default to show offline capability first!
  const [apiHealth, setApiHealth] = useState<{ hasApiKey: boolean; status: string } | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Toast helper
  const addNotification = (noti: Omit<AppNotification, 'id'>) => {
    const id = `noti-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullNoti = { ...noti, id };
    setNotifications(prev => [fullNoti, ...prev]);

    // Auto close
    setTimeout(() => {
      removeNotification(id);
    }, noti.duration || 4500);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Check the Express backend's status
  const checkStatus = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setApiHealth({ hasApiKey: data.hasApiKey, status: data.status });
        
        // Auto-connect if api key available
        if (data.hasApiKey) {
          setIsOfflineMode(false);
          addNotification({
            title: 'Live Services Connected',
            message: 'Detected active Gemini API secret on host. Successfully transitioned online.',
            type: 'success'
          });
        } else {
          setIsOfflineMode(true);
          addNotification({
            title: 'No API Key Found',
            message: 'Using offline generators. Add GEMINI_API_KEY inside the secrets drawer if you wish to enable advanced AI assist.',
            type: 'warning'
          });
        }
      } else {
        throw new Error('Healthy test ping did not resolve');
      }
    } catch (err) {
      console.warn('Backend server ping could not resolve, defaulting offline.', err);
      setIsOfflineMode(true);
      setApiHealth({ hasApiKey: false, status: 'offline' });
      addNotification({
        title: 'Offline Suite Ready',
        message: 'No server proxy detected. Accessing offline-capable client engines.',
        type: 'info'
      });
    }
  };

  // Perform checks on mount
  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="min-h-screen bg-editorial-bg text-editorial-dark font-sans antialiased overflow-x-hidden selection:bg-editorial-accent/30 selection:text-editorial-dark" id="main-application-frame">
      
      {/* Top Navigation Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOfflineMode={isOfflineMode}
        setIsOfflineMode={setIsOfflineMode}
        checkStatus={checkStatus}
        apiHealth={apiHealth}
      />

      {/* Primary Workspace Stage */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Connection status warning badge if offline */}
        {isOfflineMode && (
          <div className="mb-6 bg-editorial-cream border border-editorial-dark px-4 py-3 flex items-start gap-3">
            <WifiOff className="h-5 w-5 text-editorial-accent shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-editorial-dark font-serif-italic">Offline Sandbox Enabled</h4>
              <p className="text-[11px] text-editorial-dark/80 leading-normal mt-0.5">
                Every tool is running native offline code inside your browser block. Drawing brushstrokes, image presets, local slide exports, custom HTML document sheets, and ad slogans generate instantly without transmitting network data. Disengage this sandbox in the header menu to activate real-time Gemini AI copilots.
              </p>
            </div>
          </div>
        )}

        {/* Dynamic panel render switches */}
        <div className="animate-fade-in duration-300">
          {activeTab === 'image' && (
            <ImageEditor isOfflineMode={isOfflineMode} addNotification={addNotification} />
          )}
          {activeTab === 'video' && (
            <VideoEditor isOfflineMode={isOfflineMode} addNotification={addNotification} />
          )}
          {activeTab === 'text' && (
            <TextDrafts isOfflineMode={isOfflineMode} addNotification={addNotification} />
          )}
          {activeTab === 'publish' && (
            <PublishingGrid isOfflineMode={isOfflineMode} addNotification={addNotification} />
          )}
          {activeTab === 'campaign' && (
            <CampaignHub isOfflineMode={isOfflineMode} addNotification={addNotification} />
          )}
        </div>

      </main>

      {/* Custom Toast Notification Stack elements */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none" id="toast-notification-dock">
        {notifications.map((n) => {
          let themeClasses = 'bg-editorial-bg border-editorial-dark text-editorial-dark';
          let IconComp = Terminal;

          if (n.type === 'success') {
            themeClasses = 'bg-emerald-50 border-emerald-800 text-emerald-950';
            IconComp = CheckCircle2;
          } else if (n.type === 'warning') {
            themeClasses = 'bg-amber-50 border-amber-800 text-amber-950';
            IconComp = AlertCircle;
          } else if (n.type === 'error') {
            themeClasses = 'bg-red-50 border-red-800 text-red-950';
            IconComp = AlertCircle;
          }

          return (
            <div
              key={n.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 border shadow-md transition-all duration-300 transform translate-y-0 ${themeClasses}`}
              style={{ minWidth: '260px' }}
            >
              <IconComp className="h-5 w-5 shrink-0 mt-0.5" style={{ color: n.type === 'success' ? '#10b981' : n.type === 'warning' ? '#f59e0b' : n.type === 'error' ? '#ef4444' : '#121212' }} />
              <div className="flex-1">
                <h5 className="text-xs font-bold font-sans">{n.title}</h5>
                <p className="text-[10px] opacity-80 leading-normal mt-0.5 font-sans">{n.message}</p>
              </div>
              <button
                onClick={() => removeNotification(n.id)}
                className="text-editorial-dark/40 hover:text-editorial-dark transition p-1 shrink-0"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
