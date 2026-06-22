import React, { useState } from 'react';
import { 
  FileText, Download, Sparkles, RefreshCw, Plus, 
  Trash2, Layers, Check, TextQuote, HelpCircle, Save 
} from 'lucide-react';
import { TextDocument } from '../types';

interface TextDraftsProps {
  isOfflineMode: boolean;
  addNotification: (noti: { title: string; message: string; type: 'success' | 'warning' | 'error' | 'info' }) => void;
}

const INITIAL_DOCUMENTS: TextDocument[] = [
  {
    id: 'doc-1',
    title: 'Ad Campaign Manifesto',
    content: `# Brand Revolution: Bold & Organic Brews\n\n## The Core Mission\nOur brand is here to revolutionize the morning routine. By delivering premium, sustainably sourced, organic coffee beans right to our customers' doors, we make premium quality effortless.\n\n## Key Selling Propositions\n* 100% certified organic coffee farming partnerships.\n* Biodegradable bag materials that support zero-waste living.\n* Micro-roasted batches ensuring peak freshness in every cup.`,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000
  },
  {
    id: 'doc-2',
    title: 'Product Pitch Email',
    content: `Subject: Synergizing organic coffee delivery inside your workplace! ☕\n\nDear Office Manager,\n\nI hope your morning is going excellently. I'm reaching out because we noticed your company's incredible focus on employee wellness. \n\nWe want to bring organic micro-batch craft brews directly to your break room. Let's schedule a 5-minute call to chat about transforming your office energy!`,
    createdAt: Date.now() - 1800000,
    updatedAt: Date.now() - 1800000
  }
];

export default function TextDrafts({ isOfflineMode, addNotification }: TextDraftsProps) {
  // Documents state
  const [documents, setDocuments] = useState<TextDocument[]>(INITIAL_DOCUMENTS);
  const [activeDocId, setActiveDocId] = useState<string>(INITIAL_DOCUMENTS[0].id);
  const [newTitleInput, setNewTitleInput] = useState<string>('');

  // Editing and analysis states
  const activeDoc = documents.find(d => d.id === activeDocId) || documents[0];
  const [selectedText, setSelectedText] = useState<string>('');

  // AI Copilot states
  const [customPrompt, setCustomPrompt] = useState<string>('Refine this draft by adding an engaging introductory line.');
  const [aiResult, setAiResult] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Stats calculation
  const getStats = (contentStr: string) => {
    const textCleaned = contentStr.trim();
    const chars = textCleaned.length;
    const words = textCleaned ? textCleaned.split(/\s+/).length : 0;
    const readingTime = Math.ceil(words / 200); // 200 words per minute average
    return { chars, words, readingTime };
  };

  const activeStats = getStats(activeDoc?.content || '');

  // Handle local text updates
  const handleContentChange = (val: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === activeDocId) {
        return { ...doc, content: val, updatedAt: Date.now() };
      }
      return doc;
    }));
  };

  const handleTitleChange = (val: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === activeDocId) {
        return { ...doc, title: val, updatedAt: Date.now() };
      }
      return doc;
    }));
  };

  // Add a new blank document
  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitleInput.trim() || 'Untitled Document';
    const newDoc: TextDocument = {
      id: `doc-${Date.now()}`,
      title,
      content: `# ${title}\n\nStart writing your new editorial campaign details here...`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setDocuments(prev => [...prev, newDoc]);
    setActiveDocId(newDoc.id);
    setNewTitleInput('');
    addNotification({
      title: 'Document Created',
      message: `Opened drafting desk sheet: "${title}"`,
      type: 'success'
    });
  };

  // Delete document
  const handleDeleteDocument = (id: string) => {
    if (documents.length <= 1) {
      addNotification({
        title: 'Delete Blocked',
        message: 'You must maintain at least one active document.',
        type: 'warning'
      });
      return;
    }
    setDocuments(prev => prev.filter(d => d.id !== id));
    setActiveDocId(documents.find(d => d.id !== id)?.id || '');
    addNotification({
      title: 'Document Deleted',
      message: 'Moved draft files to garbage archive.',
      type: 'info'
    });
  };

  // 100% Offline Multi-preset linguistic rewrite templates!
  const applyOfflineTone = (tone: 'professional' | 'casual' | 'condensed' | 'sales') => {
    let text = activeDoc.content;
    let rewritten = '';

    if (tone === 'professional') {
      rewritten = `[Executive Tone Mod] ${text.replace(/We want/g, "Our consolidated organizational goal is")
                                        .replace(/sustainably sourced/g, "sustainably-integrated premium agricultural assets")
                                        .replace(/revolutionary/g, "disruptive marketplace paradigm-shift")}\n\n_Draft modified locally via premium business linguistic patterns._`;
    } else if (tone === 'casual') {
      rewritten = `Hey everyone! Check this out: 🙌\n\n${text.replace(/Dear Office Manager,/g, "Hey team manager, what is up!")
                                                        .replace(/premium/g, "awesome")
                                                        .replace(/effortless/g, "super simple & breezy")}\n\n💥 Lets chat soon! Cheers!`;
    } else if (tone === 'condensed') {
      // Strips empty spacing and shortens to essential bullet formats
      const lines = text.split('\n').filter(l => l.trim().length > 3 && !l.includes('#'));
      rewritten = `## Summarized Key Points:\n` + lines.slice(0, 4).map(l => `* ${l.trim().replace(/^[\*\-\.\s]+/, '')}`).join('\n');
    } else if (tone === 'sales') {
      rewritten = `⚠️ ATTENTION ADVERTISERS! ⚠️\n\n🚀 BREAKTHROUGH OFFER: ${text.toUpperCase()}\n\n👉 Act now to revolutionize your bottom line today! 💰`;
    }

    handleContentChange(rewritten);
    addNotification({
      title: 'Offline Rewrite Applied',
      message: `Enacted client-side "${tone}" text parser templates.`,
      type: 'success'
    });
  };

  // Standard Plaintext / Markdown download trigger
  const handleDownloadFile = () => {
    const blob = new Blob([activeDoc.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${activeDoc.title.replace(/\s+/g, '-').toLowerCase()}-draft.md`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotification({
      title: 'Markdown Downloaded',
      message: `Exported draft as: ${activeDoc.title.replace(/\s+/g, '-').toLowerCase()}-draft.md`,
      type: 'success'
    });
  };

  // Tracking selections to let users edit individual substrings with Gemini
  const handleTextAreaSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    if (start !== end) {
      const selectedStr = target.value.substring(start, end);
      setSelectedText(selectedStr);
    } else {
      setSelectedText('');
    }
  };

  // Online feature: Call server-side Gemini text rewrite proxies
  const handleGeminiTextCopilot = async (action: 'rewrite' | 'expand' | 'summarize' | 'general') => {
    if (isOfflineMode) {
      addNotification({
        title: 'Network Simulation Block',
        message: 'Turn off "Offline Sandbox" inside top menu to send copy drafts to Gemini AI models.',
        type: 'warning'
      });
      return;
    }

    setIsAiLoading(true);
    setAiResult('');

    // If highlighting text, prioritize executing edits on selection, fallback to full document.
    const textTarget = selectedText || activeDoc.content;

    try {
      const response = await fetch('/api/gemini/text-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textTarget,
          action,
          tone: 'professional',
          customPrompt: action === 'general' ? customPrompt : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Copilot endpoint error");

      setAiResult(data.result);

      addNotification({
        title: 'Draft Streamed',
        message: 'Awaiting copy integration choice.',
        type: 'success'
      });
    } catch (err: any) {
      console.error(err);
      addNotification({
        title: 'Copilot Error',
        message: err.message || 'Key configuration details mismatch.',
        type: 'error'
      });
      setAiResult(`Notice: Unable to reach Gemini backend client. Details: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const integrateAiResult = () => {
    if (!aiResult) return;
    
    if (selectedText) {
      // Insert back replacing selection
      const fullContent = activeDoc.content;
      const replaced = fullContent.replace(selectedText, aiResult);
      handleContentChange(replaced);
      setSelectedText('');
    } else {
      // Overwrite/append full doc
      handleContentChange(aiResult);
    }
    
    setAiResult('');
    addNotification({
      title: 'Copilot Content Integrated',
      message: 'Integrated results directly into document draft.',
      type: 'success'
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="text-editorial-workspace">
      
      {/* 1. Left controls panel (Xl col-span-3) */}
      <div className="xl:col-span-3 flex flex-col gap-4 border border-editorial-dark bg-editorial-cream p-5 rounded-none text-editorial-dark">
        <div className="flex items-center justify-between border-b border-editorial-dark/25 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-editorial-dark flex items-center gap-2">
            <Layers className="h-4 w-4 text-editorial-accent" /> Copy Desk Drafts
          </h3>
          <span className="text-[10px] font-mono text-editorial-bg bg-editorial-dark px-2 py-0.5 tracking-wider uppercase">Offline OK</span>
        </div>

        {/* Create new document field */}
        <form onSubmit={handleCreateDocument} className="flex gap-2">
          <input
            type="text"
            value={newTitleInput}
            onChange={(e) => setNewTitleInput(e.target.value)}
            placeholder="New document name..."
            className="flex-1 text-xs px-3 py-2 border border-editorial-dark bg-editorial-bg text-editorial-dark focus:border-editorial-accent focus:outline-none rounded-none"
          />
          <button
            type="submit"
            className="p-2 bg-editorial-dark hover:bg-editorial-accent text-editorial-bg rounded-none transition"
            title="Create blank draft"
          >
            <Plus className="h-4 w-4" />
          </button>
        </form>

        {/* Existing docs list */}
        <div className="flex flex-col gap-2 mt-2 max-h-[160px] overflow-y-auto scrollbar-thin">
          {documents.map(doc => {
            const isSelected = doc.id === activeDocId;
            return (
              <div
                key={doc.id}
                onClick={() => {
                  setActiveDocId(doc.id);
                  setAiResult('');
                }}
                className={`flex items-center justify-between p-2.5 rounded-none border transition cursor-pointer ${
                  isSelected 
                    ? 'bg-editorial-bg text-editorial-dark border-editorial-dark font-bold' 
                    : 'bg-editorial-cream text-editorial-dark/60 border-editorial-dark/30 hover:border-editorial-dark'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className={`h-4 w-4 shrink-0 ${isSelected ? 'text-editorial-accent' : 'text-editorial-dark/50'}`} />
                  <span className="text-xs font-serif truncate">{doc.title}</span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDocument(doc.id);
                  }}
                  className="p-1 text-editorial-dark/50 hover:text-red-700 transition"
                  title="Archive document"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Quick Offline Toners */}
        <div className="border-t border-editorial-dark/25 pt-4 flex flex-col gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider">Offline Preset Toners:</span>
          <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
            <button
              onClick={() => applyOfflineTone('professional')}
              className="py-2 px-2 rounded-none border border-editorial-dark/25 bg-editorial-bg hover:bg-editorial-cream text-editorial-dark transition text-left flex items-center gap-1.5 cursor-pointer"
            >
              💼 Executive
            </button>
            <button
              onClick={() => applyOfflineTone('casual')}
              className="py-2 px-2 rounded-none border border-editorial-dark/25 bg-editorial-bg hover:bg-editorial-cream text-editorial-dark transition text-left flex items-center gap-1.5 cursor-pointer"
            >
              😎 Friendly
            </button>
            <button
              onClick={() => applyOfflineTone('condensed')}
              className="py-2 px-2 rounded-none border border-editorial-dark/25 bg-editorial-bg hover:bg-editorial-cream text-editorial-dark transition text-left flex items-center gap-1.5 cursor-pointer"
            >
              📝 Bullets
            </button>
            <button
              onClick={() => applyOfflineTone('sales')}
              className="py-2 px-2 rounded-none border border-editorial-dark/25 bg-editorial-bg hover:bg-editorial-cream text-editorial-dark transition text-left flex items-center gap-1.5 cursor-pointer"
            >
              🔥 CRO Sales
            </button>
          </div>
        </div>

      </div>

      {/* 2. Middle Editor Area: Dynamic Markdown sheet (Col-span-6) */}
      <div className="xl:col-span-6 flex flex-col gap-4 text-editorial-dark">
        
        {/* Editing Core sheet */}
        <div className="bg-editorial-cream border border-editorial-dark rounded-none overflow-hidden flex flex-col">
          
          <div className="border-b border-editorial-dark/25 px-4 py-2.5 bg-editorial-cream/55 flex items-center justify-between">
            <input
              type="text"
              value={activeDoc.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="font-serif font-bold text-base text-editorial-dark bg-transparent focus:outline-none focus:border-b focus:border-editorial-accent py-0.5"
              placeholder="Title..."
            />
            <div className="flex items-center gap-2 text-[10px] font-mono text-editorial-dark/60">
              <span>{activeStats.chars} chars</span>
              <span>•</span>
              <span>{activeStats.words} words</span>
              <span>•</span>
              <span className="text-editorial-accent font-bold">{activeStats.readingTime} min read</span>
            </div>
          </div>

          <textarea
            value={activeDoc.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onSelect={handleTextAreaSelect}
            className="w-full min-h-[340px] md:min-h-[420px] p-5 text-sm font-sans text-editorial-dark bg-transparent focus:outline-none resize-none leading-relaxed"
            placeholder="Type your copy here (Supports Markdown formatting lines like # Heading 1, ## Heading 2, * bullet point...)"
          />

          <div className="bg-editorial-bg border-t border-editorial-dark/25 p-3 flex justify-between items-center text-[10px] font-mono">
            {selectedText ? (
              <span className="text-editorial-accent font-bold">Selected text: {selectedText.length} characters (Copilot Active Selection)</span>
            ) : (
              <span className="opacity-70">Highlight any substring or phrase to execute targeted edits on that word block.</span>
            )}

            <button
              onClick={handleDownloadFile}
              className="px-3 py-1 bg-editorial-dark text-editorial-bg hover:bg-editorial-accent hover:text-white font-bold border border-editorial-dark rounded-none flex items-center gap-1 cursor-pointer transition text-[9px] uppercase tracking-wider"
            >
              <Download className="h-3 w-3" /> Save Markdown
            </button>
          </div>

        </div>

      </div>

      {/* 3. Right Property Panel: Gemini Content Copilot (Col-span-3) */}
      <div className="xl:col-span-3 flex flex-col gap-4 text-editorial-dark">
        
        {/* Online AI Copilot section */}
        <div className="border border-editorial-dark bg-editorial-cream p-5 rounded-none flex flex-col gap-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-editorial-dark/25 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-editorial-dark flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-editorial-accent animate-pulse" /> Gemini AI Draft Assistant
            </span>
            <span className="text-[10px] font-mono text-editorial-bg bg-editorial-dark px-2 py-0.5 tracking-wider uppercase">Online</span>
          </div>

          {/* Quick AI buttons */}
          <div className="grid grid-cols-3 gap-1.5 text-[9px] font-sans font-bold uppercase tracking-wider">
            <button
              onClick={() => handleGeminiTextCopilot('rewrite')}
              disabled={isAiLoading}
              className="py-1.5 px-1 text-center rounded-none border border-editorial-dark bg-editorial-bg hover:bg-editorial-dark hover:text-editorial-bg disabled:opacity-40 text-editorial-dark transition hover:cursor-pointer"
            >
              Rewrite
            </button>
            <button
              onClick={() => handleGeminiTextCopilot('expand')}
              disabled={isAiLoading}
              className="py-1.5 px-1 text-center rounded-none border border-editorial-dark bg-editorial-bg hover:bg-editorial-dark hover:text-editorial-bg disabled:opacity-40 text-editorial-dark transition hover:cursor-pointer"
            >
              Expand
            </button>
            <button
              onClick={() => handleGeminiTextCopilot('summarize')}
              disabled={isAiLoading}
              className="py-1.5 px-1 text-center rounded-none border border-editorial-dark bg-editorial-bg hover:bg-editorial-dark hover:text-editorial-bg disabled:opacity-40 text-editorial-dark transition hover:cursor-pointer"
            >
              Brief
            </button>
          </div>

          {/* Prompt override custom text */}
          <div className="flex flex-col gap-1.5 mt-2 text-xs">
            <span className="text-[10px] font-bold uppercase text-editorial-dark/60">Custom Copilot Command:</span>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full h-16 text-xs px-2.5 py-1.5 border border-editorial-dark bg-editorial-bg text-editorial-dark rounded-none focus:border-editorial-accent focus:outline-none resize-none"
              placeholder="Tell Gemini exactly what to format..."
            />

            <button
              onClick={() => handleGeminiTextCopilot('general')}
              disabled={isAiLoading}
              className="w-full py-2 bg-editorial-dark hover:bg-editorial-accent disabled:opacity-50 text-editorial-bg font-bold uppercase tracking-wider text-[10px] rounded-none flex items-center justify-center gap-1 transition cursor-pointer"
            >
              {isAiLoading ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin text-editorial-bg" />
                  <span>Processing Copilot...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" />
                  <span>Run Copilot Command</span>
                </>
              )}
            </button>
          </div>

          {/* AI Resulting block area */}
          {aiResult && (
            <div className="mt-3 bg-editorial-bg border border-editorial-dark p-3 h-52 overflow-y-auto rounded-none text-editorial-dark leading-relaxed scrollbar-thin animate-fade-in">
              <div className="text-[10px] font-bold text-editorial-accent mb-1 leading-none font-mono uppercase">Proposed Output:</div>
              <p className="whitespace-pre-wrap mb-3 text-xs">{aiResult}</p>
              
              <button
                onClick={integrateAiResult}
                className="w-full py-1.5 bg-editorial-dark hover:bg-editorial-accent text-editorial-bg font-bold text-[10px] uppercase tracking-wider rounded-none flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <Check className="h-3 w-3" /> Integrate Draft Output
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
