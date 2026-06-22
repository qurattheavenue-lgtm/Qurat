import React, { useState } from 'react';
import { 
  Layout, Download, Sparkles, Plus, Trash2, 
  RefreshCw, Sliders, Eye, BookOpen, Palette, Layers, Check 
} from 'lucide-react';
import { PublishingProject, LayoutBlock } from '../types';

interface PublishingGridProps {
  isOfflineMode: boolean;
  addNotification: (noti: { title: string; message: string; type: 'success' | 'warning' | 'error' | 'info' }) => void;
}

const LAYOUT_THEMES = [
  { id: 'dark-cyber', name: 'Carbon Cyberpunk Glow', bg: 'bg-gradient-to-tr from-slate-900 via-slate-950 to-indigo-950 text-[#F1F5F9]' },
  { id: 'warm-pearl', name: 'Pearl Warm Minimalist', bg: 'bg-[#FAF9F6] text-[#1E293B]' },
  { id: 'vintage-cream', name: 'Vintage Cream Editorial', bg: 'bg-gradient-to-br from-amber-50 to-orange-100 text-[#292524]' }
];

export default function PublishingGrid({ isOfflineMode, addNotification }: PublishingGridProps) {
  // Main Project layout state
  const [project, setProject] = useState<PublishingProject>({
    id: 'pub-main',
    name: 'Company Brochure Leaflet',
    layoutType: 'bento',
    backgroundStyle: LAYOUT_THEMES[0].bg,
    width: 600,
    height: 800,
    blocks: [
      {
        id: 'block-1',
        type: 'header',
        x: 10, y: 10, w: 80, h: 80,
        content: 'RECONSTRUCT MORNING COFFEE',
        align: 'center',
        style: {
          color: '#F59E0B',
          backgroundColor: '#1E293B/50',
          borderRadius: 'rounded-lg',
          borderColor: '#1E293B',
          borderWidth: 'border-0',
          fontSize: 'text-2xl',
          fontWeight: 'font-bold',
          padding: 'p-4',
          shadow: 'shadow-lg'
        }
      },
      {
        id: 'block-2',
        type: 'paragraph',
        x: 10, y: 25, w: 38, h: 160,
        content: 'Every bean is sourced through zero-waste organic partnerships, safeguarding global biodiversity.',
        align: 'left',
        style: {
          color: '#E2E8F0',
          backgroundColor: '#0F172A',
          borderRadius: 'rounded-xl',
          borderColor: '#1E293B border',
          borderWidth: 'border-2',
          fontSize: 'text-sm',
          fontWeight: 'font-normal',
          padding: 'p-4',
          shadow: 'shadow-sm'
        }
      },
      {
        id: 'block-3',
        type: 'paragraph',
        x: 52, y: 25, w: 38, h: 160,
        content: 'Delivered directly to your door at optimal roasting temperature so peak aromas never dissipate.',
        align: 'left',
        style: {
          color: '#E2E8F0',
          backgroundColor: '#0F172A',
          borderRadius: 'rounded-xl',
          borderColor: '#1E293B border',
          borderWidth: 'border-2',
          fontSize: 'text-sm',
          fontWeight: 'font-normal',
          padding: 'p-4',
          shadow: 'shadow-sm'
        }
      },
      {
        id: 'block-4',
        type: 'button',
        x: 30, y: 55, w: 40, h: 50,
        content: 'GET YOUR SAMPLER BAG',
        align: 'center',
        style: {
          color: '#000000',
          backgroundColor: '#F59E0B',
          borderRadius: 'rounded-full',
          borderColor: '#D97706',
          borderWidth: 'border-0',
          fontSize: 'text-sm',
          fontWeight: 'font-bold',
          padding: 'p-2',
          shadow: 'shadow-md'
        }
      }
    ],
    updatedAt: Date.now()
  });

  // Selected Block State for precise coordinates slider modifications
  const [selectedBlockId, setSelectedBlockId] = useState<string>('block-1');
  const activeBlock = project.blocks.find(b => b.id === selectedBlockId) || project.blocks[0];

  // Block builder inputs
  const [newBlockType, setNewBlockType] = useState<'header' | 'paragraph' | 'button'>('paragraph');
  const [newBlockContent, setNewBlockContent] = useState<string>('Placeholder Details Block');

  // Gemini layout prompt
  const [brandInput, setBrandInput] = useState<string>('Sustainable Bamboo charcoal toothbrushes with recyclable custom handles.');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Re-arrange layout coordinates block completely offline using preset rules
  const applyOfflineLayoutPreset = (preset: 'bento' | 'brochure' | 'flyer') => {
    let arrangedBlocks: LayoutBlock[] = [];

    if (preset === 'bento') {
      arrangedBlocks = [
        {
          id: 'bento-h',
          type: 'header',
          x: 5, y: 5, w: 90, h: 80,
          content: 'BENTO ARCHITECTURE',
          align: 'center',
          style: {
            color: '#38BDF8', backgroundColor: '#0F172A', borderRadius: 'rounded-xl',
            borderColor: '#1E293B', borderWidth: 'border-2', fontSize: 'text-2xl', fontWeight: 'font-bold', padding: 'p-4', shadow: 'shadow-lg'
          }
        },
        {
          id: 'bento-p1',
          type: 'paragraph',
          x: 5, y: 20, w: 43, h: 180,
          content: 'Segment 1 Grid: Modular features placed into custom styled layout cells.',
          align: 'left',
          style: {
            color: '#E2E8F0', backgroundColor: '#0F172A', borderRadius: 'rounded-xl',
            borderColor: '#1E293B', borderWidth: 'border', fontSize: 'text-xs', fontWeight: 'font-normal', padding: 'p-4', shadow: 'shadow-sm'
          }
        },
        {
          id: 'bento-p2',
          type: 'paragraph',
          x: 52, y: 20, w: 43, h: 180,
          content: 'Segment 2 Grid: Fluid templates that adapt cleanly inside physical frames.',
          align: 'left',
          style: {
            color: '#E2E8F0', backgroundColor: '#0F172A', borderRadius: 'rounded-xl',
            borderColor: '#1E293B', borderWidth: 'border', fontSize: 'text-xs', fontWeight: 'font-normal', padding: 'p-4', shadow: 'shadow-sm'
          }
        },
        {
          id: 'bento-btn',
          type: 'button',
          x: 25, y: 50, w: 50, h: 50,
          content: 'INSPECT PORTFOLIO',
          align: 'center',
          style: {
            color: '#FFFFFF', backgroundColor: '#0284C7', borderRadius: 'rounded-lg',
            borderColor: '#0284C7', borderWidth: 'border-0', fontSize: 'text-xs', fontWeight: 'font-bold', padding: 'p-2.5', shadow: 'shadow-md'
          }
        }
      ];
    } else if (preset === 'brochure') {
      // Splits visually into Left section, Center fold, Right section
      arrangedBlocks = [
        {
          id: 'brochure-l',
          type: 'paragraph',
          x: 5, y: 10, w: 26, h: 300,
          content: 'LEFT INNER FOLD\n\nDetailing organizational credentials and legacy impact metrics.',
          align: 'left',
          style: {
            color: '#E2E8F0', backgroundColor: '#1E293B/40', borderRadius: 'rounded-md',
            borderColor: '#1E293B', borderWidth: 'border', fontSize: 'text-xs', fontWeight: 'font-normal', padding: 'p-3', shadow: 'shadow-sm'
          }
        },
        {
          id: 'brochure-c',
          type: 'header',
          x: 35, y: 15, w: 30, h: 100,
          content: 'MAIN COVER',
          align: 'center',
          style: {
            color: '#F59E0B', backgroundColor: '#1E293B/20', borderRadius: 'rounded-none',
            borderColor: '#1E293B', borderWidth: 'border-0', fontSize: 'text-xl', fontWeight: 'font-bold', padding: 'p-2', shadow: 'shadow-none'
          }
        },
        {
          id: 'brochure-r',
          type: 'paragraph',
          x: 69, y: 10, w: 26, h: 300,
          content: 'RIGHT FOLD\n\nConnect with our reps today. Join the community circular loop.',
          align: 'right',
          style: {
            color: '#E2E8F0', backgroundColor: '#1E293B/40', borderRadius: 'rounded-md',
            borderColor: '#1E293B', borderWidth: 'border', fontSize: 'text-xs', fontWeight: 'font-normal', padding: 'p-3', shadow: 'shadow-sm'
          }
        }
      ];
    } else if (preset === 'flyer') {
      arrangedBlocks = [
        {
          id: 'flyer-h',
          type: 'header',
          x: 10, y: 5, w: 80, h: 100,
          content: 'GRAND FESTIVAL SPOTLIGHT',
          align: 'center',
          style: {
            color: '#10B981', backgroundColor: 'transparent', borderRadius: 'rounded-none',
            borderColor: 'transparent', borderWidth: 'border-0', fontSize: 'text-2xl', fontWeight: 'font-bold', padding: 'p-2', shadow: 'shadow-none'
          }
        },
        {
          id: 'flyer-p',
          type: 'paragraph',
          x: 15, y: 22, w: 70, h: 140,
          content: 'Saddle up for spectacular networking, organic visual presentations, and live ad-script reviews.',
          align: 'center',
          style: {
            color: '#94A3B8', backgroundColor: 'transparent', borderRadius: 'rounded-none',
            borderColor: 'transparent', borderWidth: 'border-0', fontSize: 'text-sm', fontWeight: 'font-normal', padding: 'p-2', shadow: 'shadow-none'
          }
        },
        {
          id: 'flyer-btn',
          type: 'button',
          x: 35, y: 48, w: 30, h: 50,
          content: 'BOOK TICKETS NOW',
          align: 'center',
          style: {
            color: '#000000', backgroundColor: '#10B981', borderRadius: 'rounded-full',
            borderColor: '#059669', borderWidth: 'border-0', fontSize: 'text-xs', fontWeight: 'font-bold', padding: 'p-2', shadow: 'shadow-md'
          }
        }
      ];
    }

    setProject(prev => ({
      ...prev,
      layoutType: preset,
      blocks: arrangedBlocks,
      updatedAt: Date.now()
    }));
    setSelectedBlockId(arrangedBlocks[0]?.id || '');
    addNotification({
      title: 'Structural Preset Swapped',
      message: `Re-arranged coordinates using ${preset} blueprints.`,
      type: 'info'
    });
  };

  // Add block to visual canvas
  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const isHead = newBlockType === 'header';
    const isBtn = newBlockType === 'button';

    const addedBlock: LayoutBlock = {
      id: `block-${Date.now()}`,
      type: newBlockType,
      x: 20,
      y: 40,
      w: 60,
      h: isHead ? 60 : isBtn ? 50 : 120,
      content: newBlockContent,
      align: 'center',
      style: {
        color: isBtn ? '#000000' : '#E2E8F0',
        backgroundColor: isBtn ? '#F59E0B' : '#0F172A',
        borderRadius: 'rounded-lg',
        borderColor: '#1E293B',
        borderWidth: 'border-0',
        fontSize: isHead ? 'text-xl' : 'text-xs',
        fontWeight: isHead || isBtn ? 'font-bold' : 'font-normal',
        padding: 'p-3',
        shadow: 'shadow-sm'
      }
    };

    setProject(p => ({
      ...p,
      blocks: [...p.blocks, addedBlock],
      updatedAt: Date.now()
    }));
    setSelectedBlockId(addedBlock.id);
    setNewBlockContent('New Block Value');
    addNotification({
      title: 'Grid Node Composed',
      message: `Assembled visual block: ${newBlockType}`,
      type: 'success'
    });
  };

  // Delete Block
  const deleteBlock = (id: string) => {
    if (project.blocks.length <= 1) {
      addNotification({
        title: 'Delete Rejected',
        message: 'Must have at least one visual block to preserve structure.',
        type: 'warning'
      });
      return;
    }
    setProject(p => ({
      ...p,
      blocks: p.blocks.filter(b => b.id !== id),
      updatedAt: Date.now()
    }));
    setSelectedBlockId(project.blocks.find(b => b.id !== id)?.id || '');
  };

  // Export full raw standalone HTML page complete with coordinate matrices offline!
  const handleExportRawHTML = () => {
    let blockElementsHTML = '';
    
    project.blocks.forEach(b => {
      const textAlign = b.align || 'center';
      const styles = `
        position: absolute;
        left: ${b.x}%;
        top: ${b.y}%;
        width: ${b.w}%;
        color: ${b.style.color};
        background-color: ${b.style.backgroundColor};
        padding: 12px;
        border-radius: 8px;
        font-family: sans-serif;
        text-align: ${textAlign};
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      `;
      blockElementsHTML += `
      <div style="${styles}">
        ${b.content}
      </div>`;
    });

    const fullHTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${project.name} - Published View</title>
  <style>
    body {
      background-color: #030712;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .visual-canvas {
      width: 600px;
      height: 800px;
      position: relative;
      background: rgb(11, 15, 25);
      border-radius: 12px;
      border: 1px solid #1e293b;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div class="visual-canvas">
    ${blockElementsHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}-standalone.html`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotification({
      title: 'HTML Export Successful',
      message: 'Downloaded standalone visual frame complete with coordinate wrappers.',
      type: 'success'
    });
  };

  // Online feature: Call server-side Gemini to write template variables
  const handleGeminiLayoutBuilder = async () => {
    if (isOfflineMode) {
      addNotification({
        title: 'Network Simulation Block',
        message: 'Aesthetic layout generation is restricted inside the Offline connection Sandbox.',
        type: 'warning'
      });
      return;
    }

    setIsAiLoading(true);
    try {
      const response = await fetch('/api/gemini/layout-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandDescription: brandInput,
          layoutType: project.layoutType
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Aesthetic layout endpoint error");

      if (data.layout && data.layout.blocks && data.layout.blocks.length > 0) {
        // Map elements back to clean layout blocks
        const generatedBlocks: LayoutBlock[] = data.layout.blocks.map((block: any, idx: number) => ({
          id: `ai-block-${idx}-${Date.now()}`,
          type: block.type,
          x: block.x || 10,
          y: block.y || (15 + idx * 20),
          w: block.w || 80,
          h: block.h || 100,
          content: block.content,
          align: block.align || 'center',
          style: block.style || {
            color: '#FFFFFF',
            backgroundColor: '#1E293B',
            borderRadius: 'rounded-lg',
            borderColor: '#1E293B',
            borderWidth: 'border-0',
            fontSize: 'text-xs',
            fontWeight: 'font-normal',
            padding: 'p-3',
            shadow: 'shadow-sm'
          }
        }));

        setProject(prev => ({
          ...prev,
          blocks: generatedBlocks,
          updatedAt: Date.now()
        }));

        setSelectedBlockId(generatedBlocks[0]?.id || '');
        addNotification({
          title: 'AI Blueprint Rendered',
          message: `Inscribed ${generatedBlocks.length} custom marketing blocks on grid.`,
          type: 'success'
        });
      }
    } catch (err: any) {
      console.error(err);
      addNotification({
        title: 'Aesthetic Blueprint Error',
        message: err.message || 'Key configuration details mismatch.',
        type: 'error'
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-editorial-dark" id="publishing-grid-workspace">
      
      {/* 1. Left controls panel (Xl col-span-3) */}
      <div className="xl:col-span-3 flex flex-col gap-3 border border-editorial-dark bg-editorial-cream p-5 rounded-none">
        <div className="flex items-center justify-between border-b border-editorial-dark/25 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-editorial-dark flex items-center gap-2">
            <Layers className="h-4 w-4 text-editorial-accent" /> Layout Presets
          </h3>
          <span className="text-[10px] font-mono text-editorial-bg bg-editorial-dark px-2 py-0.5 tracking-wider uppercase">Offline OK</span>
        </div>

        {/* Dynamic Structural Switch buttons presetters */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-editorial-dark/60">Re-arrange Structural Blueprints:</span>
          <div className="grid grid-cols-1 gap-2 text-xs font-mono">
            <button
              onClick={() => applyOfflineLayoutPreset('bento')}
              className={`py-2 px-3 rounded-none border text-left flex items-center gap-2 transition cursor-pointer ${
                project.layoutType === 'bento' 
                  ? 'bg-editorial-dark text-editorial-bg border-editorial-dark shadow-sm' 
                  : 'bg-editorial-bg text-editorial-dark border-editorial-dark/30 hover:border-editorial-dark'
              }`}
            >
              <Layout className="h-4 w-4 shrink-0 text-editorial-accent" /> Modern Apple Bento Grid
            </button>
            <button
              onClick={() => applyOfflineLayoutPreset('brochure')}
              className={`py-2 px-3 rounded-none border text-left flex items-center gap-2 transition cursor-pointer ${
                project.layoutType === 'brochure' 
                  ? 'bg-editorial-dark text-editorial-bg border-editorial-dark shadow-sm' 
                  : 'bg-editorial-bg text-editorial-dark border-editorial-dark/30 hover:border-editorial-dark'
              }`}
            >
              <BookOpen className="h-4 w-4 shrink-0 text-editorial-accent" /> Folder Pamphlet Layout
            </button>
            <button
              onClick={() => applyOfflineLayoutPreset('flyer')}
              className={`py-2 px-3 rounded-none border text-left flex items-center gap-2 transition cursor-pointer ${
                project.layoutType === 'flyer' 
                  ? 'bg-editorial-dark text-editorial-bg border-editorial-dark shadow-sm' 
                  : 'bg-editorial-bg text-editorial-dark border-editorial-dark/30 hover:border-editorial-dark'
              }`}
            >
              <Palette className="h-4 w-4 shrink-0 text-editorial-accent" /> Spotlight Marketing Flyer
            </button>
          </div>
        </div>

        {/* Block creation tools */}
        <div className="border-t border-editorial-dark/25 pt-4 flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider">Assemble Custom Block:</span>
          
          <form onSubmit={handleAddBlock} className="flex flex-col gap-2.5 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-editorial-dark/60">Content Value:</span>
              <input
                type="text"
                value={newBlockContent}
                onChange={(e) => setNewBlockContent(e.target.value)}
                placeholder="Content text..."
                className="px-3 py-2 border border-editorial-dark bg-editorial-bg text-editorial-dark rounded-none focus:border-editorial-accent focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-editorial-dark/60">Block Component Category:</span>
              <div className="grid grid-cols-3 gap-1 grid-flow-row text-[10px] font-sans font-bold uppercase tracking-wider">
                {['header', 'paragraph', 'button'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewBlockType(type as any)}
                    className={`py-1.5 rounded-none text-center border ${
                      newBlockType === type ? 'bg-editorial-dark text-editorial-bg border-editorial-dark' : 'bg-editorial-bg text-editorial-dark/50 border-editorial-dark/30'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-1.5 py-2 bg-editorial-dark hover:bg-editorial-accent text-editorial-bg font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <Plus className="h-3 w-3" /> Insert Block Overlay
            </button>
          </form>
        </div>

      </div>

      {/* 2. Middle Visual Publisher Board (Xl col-span-6) */}
      <div className="xl:col-span-6 flex flex-col gap-4 text-editorial-dark">
        
        {/* Absolute visual page layer canvas */}
        <div className="relative h-[480px] bg-editorial-cream rounded-none border border-editorial-dark flex items-center justify-center p-4 overflow-hidden">
          
          {/* Published Virtual Page (600x800 coordinate proportions scaled) */}
          <div 
            className={`relative w-full max-w-[420px] aspect-[3/4] rounded-none shadow-md border border-editorial-dark/40 overflow-hidden ${project.backgroundStyle}`}
          >
            {project.blocks.map(block => {
              const isActive = selectedBlockId === block.id;
              const textAlign = block.align || 'center';
              
              return (
                <div
                  key={block.id}
                  onClick={() => setSelectedBlockId(block.id)}
                  className={`cursor-pointer transition-all ${block.style.padding} ${block.style.borderRadius} ${block.style.borderWidth} ${block.style.fontSize} ${block.style.fontWeight} ${block.style.shadow} ${
                    isActive 
                      ? 'ring-2 ring-editorial-accent bg-editorial-bg scale-102 z-30' 
                      : 'hover:ring-1 hover:ring-editorial-dark z-10'
                  }`}
                  style={{
                    position: 'absolute',
                    left: `${block.x}%`,
                    top: `${block.y}%`,
                    width: `${block.w}%`,
                    color: block.style.color,
                    backgroundColor: block.style.backgroundColor.includes('/') ? undefined : block.style.backgroundColor,
                    textAlign: textAlign as any
                  }}
                >
                  {block.content}
                  
                  {/* Selector corner badge anchor */}
                  {isActive && (
                    <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-none bg-editorial-accent text-white text-[8px] font-mono font-bold flex items-center justify-center shadow">
                      ★
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="absolute top-3 left-3 bg-editorial-dark text-editorial-bg px-2 py-1 text-[9px] font-mono">
            Virtual coordinate scope: 600 x 800 (Percent Layout)
          </div>
        </div>

        {/* Global actions */}
        <div className="bg-editorial-cream border border-editorial-dark p-4 rounded-none flex items-center justify-between gap-4">
          <input
            type="text"
            value={project.name}
            onChange={(e) => setProject(p => ({ ...p, name: e.target.value }))}
            className="px-3 py-1.5 border border-editorial-dark bg-editorial-bg text-editorial-dark rounded-none text-xs font-serif focus:outline-none"
            placeholder="Layout Title..."
          />

          <button
            onClick={handleExportRawHTML}
            className="px-4 py-2 text-xs font-bold bg-editorial-dark text-editorial-bg hover:bg-editorial-accent hover:text-white border border-editorial-dark rounded-none flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> Export CSS-Grid HTML
          </button>
        </div>

      </div>

      {/* 3. Right Property Grid: Precise Block sliders (Col-span-3) */}
      <div className="xl:col-span-3 flex flex-col gap-5 text-editorial-dark">
        
        {/* Slider Node Fine-Tuner */}
        {activeBlock && (
          <div className="border border-editorial-dark bg-editorial-cream p-5 rounded-none flex flex-col gap-3.5">
            <div className="flex items-center justify-between border-b border-editorial-dark/25 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-editorial-dark flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-editorial-accent" /> Fine-tuner
              </span>
              <button
                onClick={() => deleteBlock(activeBlock.id)}
                className="p-1 text-editorial-dark/50 hover:text-red-700 transition"
                title="Remove block node"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 select-none text-[10px] font-mono text-editorial-dark">
              <div className="flex flex-col gap-1">
                <span className="font-bold uppercase text-[9px] tracking-wider text-editorial-dark/60">Block Inner Content:</span>
                <textarea
                  value={activeBlock.content}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProject(prev => ({
                      ...prev,
                      blocks: prev.blocks.map(b => b.id === activeBlock.id ? { ...b, content: val } : b)
                    }));
                  }}
                  className="w-full h-12 text-xs px-2 py-1 border border-editorial-dark bg-editorial-bg text-editorial-dark rounded-none focus:outline-none resize-none"
                />
              </div>

              {/* Slider coordinate X */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="font-bold uppercase text-[9px] tracking-wider text-editorial-dark/60">Margin-Left Offset X</span>
                  <span className="text-editorial-dark font-bold font-mono">{activeBlock.x}%</span>
                </div>
                <input 
                  type="range" min="0" max="95" value={activeBlock.x}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setProject(prev => ({
                      ...prev,
                      blocks: prev.blocks.map(b => b.id === activeBlock.id ? { ...b, x: val } : b)
                    }));
                  }}
                  className="w-full h-1 bg-editorial-dark/30 rounded-none slider-thumb accent-editorial-accent"
                />
              </div>

              {/* Slider coordinate Y */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="font-bold uppercase text-[9px] tracking-wider text-editorial-dark/60">Section-Height Offset Y</span>
                  <span className="text-editorial-dark font-bold font-mono">{activeBlock.y}%</span>
                </div>
                <input 
                  type="range" min="0" max="95" value={activeBlock.y}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setProject(prev => ({
                      ...prev,
                      blocks: prev.blocks.map(b => b.id === activeBlock.id ? { ...b, y: val } : b)
                    }));
                  }}
                  className="w-full h-1 bg-editorial-dark/30 rounded-none slider-thumb accent-editorial-accent"
                />
              </div>

              {/* Slider width W */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="font-bold uppercase text-[9px] tracking-wider text-editorial-dark/60">Relative Width Box</span>
                  <span className="text-editorial-dark font-bold font-mono">{activeBlock.w}%</span>
                </div>
                <input 
                  type="range" min="10" max="100" value={activeBlock.w}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setProject(prev => ({
                      ...prev,
                      blocks: prev.blocks.map(b => b.id === activeBlock.id ? { ...b, w: val } : b)
                    }));
                  }}
                  className="w-full h-1 bg-editorial-dark/30 rounded-none slider-thumb accent-editorial-accent"
                />
              </div>

              {/* Align, Color and visual details styling selectors */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-sans font-bold uppercase mt-1">
                <div className="flex flex-col gap-1">
                  <span className="text-editorial-dark/60">Align text:</span>
                  <select
                    value={activeBlock.align || 'center'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProject(p => ({
                        ...p,
                        blocks: p.blocks.map(b => b.id === activeBlock.id ? { ...b, align: val as any } : b)
                      }));
                    }}
                    className="px-1.5 py-1 bg-editorial-bg border border-editorial-dark text-editorial-dark focus:outline-none rounded-none"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-editorial-dark/60">Color ID:</span>
                  <div className="flex items-center gap-1 bg-editorial-bg border border-editorial-dark rounded-none px-1.5 py-0.5">
                    <input 
                      type="color" value={activeBlock.style.color}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProject(prev => ({
                          ...prev,
                          blocks: prev.blocks.map(b => b.id === activeBlock.id ? { ...b, style: { ...b.style, color: val } } : b)
                        }));
                      }}
                      className="h-4 w-4 bg-transparent border-0 cursor-pointer"
                    />
                    <span className="text-[9px] text-editorial-dark font-mono font-normal">{activeBlock.style.color.substring(0, 5)}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Gemini AI Layout Designer */}
        <div className="border border-editorial-dark bg-editorial-cream p-5 rounded-none flex flex-col gap-3 shadow-none text-xs">
          <div className="flex items-center justify-between border-b border-editorial-dark/25 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-editorial-dark flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-editorial-accent animate-pulse" /> Gemini Smart Layouts
            </span>
            <span className="text-[10px] font-mono text-editorial-bg bg-editorial-dark px-2 py-0.5 tracking-wider uppercase">Online</span>
          </div>

          <textarea
            value={brandInput}
            onChange={(e) => setBrandInput(e.target.value)}
            className="w-full h-16 text-xs px-2.5 py-2 border border-editorial-dark bg-editorial-bg text-editorial-dark rounded-none focus:border-editorial-accent focus:outline-none resize-none"
            placeholder="Brand profile statement..."
          />

          <button
            onClick={handleGeminiLayoutBuilder}
            disabled={isAiLoading}
            className="w-full py-2 bg-editorial-dark hover:bg-editorial-accent disabled:opacity-50 text-editorial-bg font-bold uppercase tracking-wider text-xs rounded-none flex items-center justify-center gap-1 transition cursor-pointer"
          >
            {isAiLoading ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin text-editorial-bg" />
                <span>Generating Blueprint...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Build Brand Blueprint</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
