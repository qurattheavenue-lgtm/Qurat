import React, { useRef, useState, useEffect } from 'react';
import { 
  Upload, Download, Paintbrush, Trash2, Type, 
  Sparkles, RefreshCw, Layers, Crop, Check, Image as ImageIcon 
} from 'lucide-react';
import { ImageProject, ImageTextOverlay } from '../types';

interface ImageEditorProps {
  isOfflineMode: boolean;
  addNotification: (noti: { title: string; message: string; type: 'success' | 'warning' | 'error' | 'info' }) => void;
}

const PRESET_BG_OPTIONS = [
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=60", // dynamic gradient
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=60", // retro tech
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60"  // aesthetic abstract
];

export default function ImageEditor({ isOfflineMode, addNotification }: ImageEditorProps) {
  // Main Project State
  const [project, setProject] = useState<ImageProject>({
    id: 'img-main',
    name: 'Untitled Masterpiece',
    imageUrl: PRESET_BG_OPTIONS[0],
    drawings: null,
    filters: {
      brightness: 100,
      contrast: 100,
      grayscale: 0,
      sepia: 0,
      invert: 0,
      blur: 0,
      saturate: 100,
    },
    texts: [],
    updatedAt: Date.now()
  });

  // Editor states
  const [activePreset, setActivePreset] = useState<string>('none');
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [brushColor, setBrushColor] = useState<string>('#f59e0b'); // amber
  const [brushSize, setBrushSize] = useState<number>(6);
  
  // Custom text overlays input
  const [textInput, setTextInput] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [textSize, setTextSize] = useState<number>(24);
  const [textX, setTextX] = useState<number>(50); // percentage-based coords (0 - 100)
  const [textY, setTextY] = useState<number>(50);

  // Gemini AI state
  const [aiPrompt, setAiPrompt] = useState<string>('Critique this visual art and suggest 3 high-impact advertising slogans related to its style.');
  const [aiResult, setAiResult] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Canvas and references
  const imageRef = useRef<HTMLImageElement | null>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Set up drawing canvas layout size to mirror display dimension
  useEffect(() => {
    const canvas = drawingCanvasRef.current;
    if (canvas) {
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = canvas.parentElement?.clientHeight || 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [project.imageUrl]);

  // Apply filters via CSS helper style
  const getFilterStyle = () => {
    return {
      filter: `
        brightness(${project.filters.brightness}%)
        contrast(${project.filters.contrast}%)
        grayscale(${project.filters.grayscale}%)
        sepia(${project.filters.sepia}%)
        invert(${project.filters.invert}%)
        blur(${project.filters.blur}px)
        saturate(${project.filters.saturate}%)
      `
    };
  };

  // Preset Filters (Offline AI Filters)
  const applyPreset = (preset: string) => {
    setActivePreset(preset);
    let updatedFilters = {
      brightness: 100,
      contrast: 100,
      grayscale: 0,
      sepia: 0,
      invert: 0,
      blur: 0,
      saturate: 100
    };

    switch (preset) {
      case 'vintage':
        updatedFilters.sepia = 60;
        updatedFilters.contrast = 110;
        updatedFilters.brightness = 95;
        updatedFilters.saturate = 80;
        break;
      case 'cyberpunk':
        updatedFilters.contrast = 140;
        updatedFilters.brightness = 110;
        updatedFilters.saturate = 180;
        updatedFilters.invert = 5;
        break;
      case 'monochrome':
        updatedFilters.grayscale = 100;
        updatedFilters.contrast = 120;
        break;
      case 'warmth':
        updatedFilters.sepia = 30;
        updatedFilters.saturate = 130;
        updatedFilters.brightness = 105;
        break;
      case 'noir':
        updatedFilters.grayscale = 100;
        updatedFilters.contrast = 150;
        updatedFilters.brightness = 80;
        updatedFilters.blur = 0.5;
        break;
      case 'dream':
        updatedFilters.blur = 2;
        updatedFilters.brightness = 115;
        updatedFilters.saturate = 120;
        break;
      default:
        break;
    }

    setProject(prev => ({
      ...prev,
      filters: updatedFilters,
      updatedAt: Date.now()
    }));
    addNotification({
      title: 'Preset Applied',
      message: `Enacted native filter bundle: "${preset}"`,
      type: 'info'
    });
  };

  // Manage Drawing brushes (Offline Drawing Layer)
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawingMode) return;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearDrawing = () => {
    const canvas = drawingCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    addNotification({
      title: 'Canvas Cleared',
      message: 'Drawing workspace cleared successfully.',
      type: 'info'
    });
  };

  // Add a text layer item (Offline Text Composing)
  const handleAddText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const newLabel: ImageTextOverlay = {
      id: `text-${Date.now()}`,
      text: textInput,
      x: textX,
      y: textY,
      color: textColor,
      size: textSize,
      font: 'sans-serif'
    };

    setProject(prev => ({
      ...prev,
      texts: [...prev.texts, newLabel],
      updatedAt: Date.now()
    }));
    setTextInput('');
    addNotification({
      title: 'Label Composited',
      message: `Printed tag "${textInput}" to virtual image coordinate.`,
      type: 'success'
    });
  };

  const removeTextOverlay = (id: string) => {
    setProject(prev => ({
      ...prev,
      texts: prev.texts.filter(t => t.id !== id),
      updatedAt: Date.now()
    }));
  };

  // Upload Photo trigger
  const handleImageUploaded = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProject(prev => ({
          ...prev,
          name: file.name.split('.')[0] || 'Uploaded Image',
          imageUrl: reader.result as string,
          texts: [], // reset overlays to avoid pixel mismatch
          updatedAt: Date.now()
        }));
        clearDrawing();
        addNotification({
          title: 'Photo Imported',
          message: `Secured client-side stream for: ${file.name}`,
          type: 'success'
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Offline Exporter Logic
  // Compiles original background with standard canvas filters + drawing overlays + text structures
  const handleExportAndDownload = () => {
    const expCanvas = exportCanvasRef.current;
    const bgImg = imageRef.current;
    const drawCanvas = drawingCanvasRef.current;

    if (!expCanvas || !bgImg) {
      addNotification({
        title: 'Export Failed',
        message: 'Underlying render view parameters are loading.',
        type: 'error'
      });
      return;
    }

    const ctx = expCanvas.getContext('2d');
    if (!ctx) return;

    // Use absolute bitmap size of natural graphic background to keep HD ratio
    const width = bgImg.naturalWidth || 800;
    const height = bgImg.naturalHeight || 600;
    expCanvas.width = width;
    expCanvas.height = height;

    // 1. Draw base photo with CSS filters applied via canvas filter context property
    ctx.filter = `
      brightness(${project.filters.brightness}%)
      contrast(${project.filters.contrast}%)
      grayscale(${project.filters.grayscale}%)
      sepia(${project.filters.sepia}%)
      invert(${project.filters.invert}%)
      blur(${project.filters.blur}px)
      saturate(${project.filters.saturate}%)
    `;
    ctx.drawImage(bgImg, 0, 0, width, height);

    // Turn off filters for the overlays (drawings and text)
    ctx.filter = 'none';

    // 2. Overlay brushed lines (scale bounding boxes)
    if (drawCanvas) {
      ctx.drawImage(drawCanvas, 0, 0, width, height);
    }

    // 3. Render coordinate-percent texts
    project.texts.forEach(item => {
      const xPixel = (item.x / 100) * width;
      const yPixel = (item.y / 100) * height;
      
      // Responsive dynamic font sizing
      const scaleFactor = Math.max(width, 800) / 800;
      const computedSize = Math.round(item.size * scaleFactor);

      ctx.font = `bold ${computedSize}px Inter, sans-serif`;
      ctx.fillStyle = item.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Draw subtle drop shadow for eligibility
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillText(item.text, xPixel + 2, yPixel + 2);
      
      ctx.fillStyle = item.color;
      ctx.fillText(item.text, xPixel, yPixel);
    });

    // 4. Download Trigger
    const outputData = expCanvas.toDataURL('image/png');
    const dowLink = document.createElement('a');
    dowLink.download = `${project.name}-omnistudio-edit.png`;
    dowLink.href = outputData;
    document.body.appendChild(dowLink);
    dowLink.click();
    document.body.removeChild(dowLink);

    addNotification({
      title: 'Creative Saved!',
      message: `Assembled and exported offline file: ${project.name}-omnistudio-edit.png`,
      type: 'success'
    });
  };

  // Online Feature: Call server-side Gemini Model to critique image or suggest layout/marketing
  const handleGeminiExplain = async () => {
    if (isOfflineMode) {
      addNotification({
        title: 'Network Simulation Block',
        message: 'Turn off "Offline Sandbox" in top menu to process client base64 data through Gemini AI routers.',
        type: 'warning'
      });
      return;
    }

    setIsAiLoading(true);
    setAiResult('');

    try {
      // Send current state background image payload
      const response = await fetch('/api/gemini/image-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: project.imageUrl,
          mimeType: project.imageUrl?.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png',
          prompt: aiPrompt
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gemini endpoint error");

      setAiResult(data.result);
      addNotification({
        title: 'Gemini Analysis Prepared',
        message: 'Successfully generated smart descriptive critique.',
        type: 'success'
      });
    } catch (err: any) {
      console.error(err);
      setAiResult(`AI Offline Notice: Unable to connect with local server client proxies. Ensure GEMINI_API_KEY is supplied. Error details: ${err.message}`);
      addNotification({
        title: 'Analysis Error',
        message: err.message || 'Key configuration details mismatch.',
        type: 'error'
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="image-editor-container">
      
      {/* 1. Left controls panel (Xl col-span-3) */}
      <div className="xl:col-span-3 flex flex-col gap-5 border border-editorial-dark bg-editorial-cream p-5 rounded-none">
        <div className="flex items-center justify-between border-b border-editorial-dark/25 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-editorial-dark flex items-center gap-2">
            <Layers className="h-4 w-4 text-editorial-accent" /> Layer & File Controls
          </h3>
          <span className="text-[10px] font-mono text-editorial-bg bg-editorial-dark px-2 py-0.5 tracking-wider uppercase">Offline OK</span>
        </div>

        {/* Upload Button */}
        <div>
          <label className="flex flex-col items-center justify-center border border-dashed border-editorial-dark hover:bg-editorial-dark/5 transition bg-editorial-bg rounded-none p-5 cursor-pointer text-center group">
            <Upload className="h-6 w-6 text-editorial-dark/60 group-hover:text-editorial-dark transition mb-2" />
            <span className="text-xs text-editorial-dark font-bold uppercase tracking-wider">Upload Custom Photo</span>
            <span className="text-[10px] text-editorial-dark/60 mt-1">supports PNG, JPG, WEBP</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUploaded} 
            />
          </label>
        </div>

        {/* Templates presetted backgrounds */}
        <div>
          <span className="text-xs text-editorial-dark/70 block mb-2 font-bold uppercase tracking-wider">Or Use Canvas Preset Backgrounds:</span>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_BG_OPTIONS.map((bg, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setProject(prev => ({
                    ...prev,
                    name: `Canvas Preset ${idx + 1}`,
                    imageUrl: bg,
                    updatedAt: Date.now()
                  }));
                  clearDrawing();
                }}
                className={`h-12 rounded-none border overflow-hidden transition-all relative ${
                  project.imageUrl === bg ? 'border-editorial-dark ring-2 ring-editorial-accent/20' : 'border-editorial-dark/30 hover:border-editorial-dark'
                }`}
              >
                <img src={bg} alt="" className="w-full h-full object-cover" />
                <span className="absolute inset-0 bg-black/40 hover:bg-transparent transition flex items-center justify-center text-[9px] font-mono font-bold text-white">Preset {idx + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Style Presets (Offline AI Visual enhancement presets) */}
        <div>
          <span className="text-xs text-editorial-dark/70 block mb-2 font-bold uppercase tracking-wider">Instant Preset Overlays:</span>
          <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
            {['none', 'vintage', 'cyberpunk', 'warmth', 'noir', 'monochrome', 'dream'].map(preset => (
              <button
                key={preset}
                onClick={() => applyPreset(preset)}
                className={`py-1.5 px-2 rounded-none font-bold border text-left flex justify-between items-center transition cursor-pointer lowercase ${
                  activePreset === preset 
                    ? 'bg-editorial-dark text-editorial-bg border-editorial-dark shadow-none font-bold italic' 
                    : 'bg-editorial-bg text-editorial-dark/70 border-editorial-dark/30 hover:text-editorial-dark hover:bg-editorial-cream'
                }`}
              >
                <span>{preset}</span>
                {activePreset === preset && <Check className="h-3 w-3 text-editorial-bg" />}
              </button>
            ))}
          </div>
        </div>

        {/* Drawing Canvas Controls */}
        <div className="border-t border-editorial-dark/25 pt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-editorial-dark flex items-center gap-1.5">
              <Paintbrush className="h-3.5 w-3.5 text-editorial-accent" /> Canvas Draw Layer
            </span>
            <button
              onClick={() => setIsDrawingMode(!isDrawingMode)}
              className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-bold border transition cursor-pointer uppercase ${
                isDrawingMode ? 'bg-editorial-accent text-white border-editorial-accent' : 'bg-editorial-cream text-editorial-dark/75 border-editorial-dark/30 hover:border-editorial-dark'
              }`}
            >
              {isDrawingMode ? 'Active Drawing' : 'Click to Draw'}
            </button>
          </div>

          {isDrawingMode && (
            <div className="bg-editorial-bg p-3 rounded-none flex flex-col gap-2.5 border border-editorial-dark animate-fade-in text-editorial-dark font-sans">
              {/* Brush properties */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase text-editorial-dark/60">Brush Size:</span>
                <input 
                  type="range" 
                  min="2" 
                  max="20" 
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-24 h-1 bg-editorial-cream rounded-none accent-editorial-accent"
                />
                <span className="text-[10px] font-mono font-bold text-editorial-dark">{brushSize}px</span>
              </div>

              {/* Swatch picker */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-editorial-dark/60">Color Swatch:</span>
                <div className="flex gap-1.5">
                  {['#B25E3F', '#3b82f6', '#ef4444', '#10b981', '#ffffff', '#000000'].map(col => (
                    <button
                      key={col}
                      onClick={() => setBrushColor(col)}
                      style={{ backgroundColor: col }}
                      className={`h-4 w-4 rounded-none border transition ${
                        brushColor === col ? 'ring-2 ring-editorial-dark border-editorial-bg' : 'border-editorial-dark/30 hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={clearDrawing}
                className="w-full mt-1.5 py-1 text-[11px] font-bold uppercase border border-red-800 bg-red-50 text-red-900 transition flex items-center justify-center gap-1 hover:cursor-pointer"
              >
                <Trash2 className="h-3 w-3" /> Clear Drawn Paths
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 2. Middle Preview Area (Xl col-span-6) */}
      <div className="xl:col-span-6 flex flex-col gap-4">
        
        {/* Canvas stage frame container */}
        <div className="relative min-h-[360px] md:min-h-[480px] bg-editorial-cream rounded-none border border-editorial-dark overflow-hidden flex items-center justify-center p-4">
          
          <div className="text-center absolute inset-0 flex items-center justify-center text-editorial-dark pointer-events-none font-mono text-[90px] select-none uppercase opacity-[0.03]">
            Canvas
          </div>

          {/* Photo Render View Frame */}
          <div className="relative max-h-[450px] max-w-full select-none" style={{ aspectRatio: '4/3' }}>
            
            {/* 1. Underlying background graphic */}
            {project.imageUrl && (
              <img
                ref={imageRef}
                src={project.imageUrl}
                alt={project.name}
                referrerPolicy="no-referrer"
                style={getFilterStyle()}
                className="object-contain max-h-[420px] rounded shadow-2xl transition-all duration-100"
              />
            )}

            {/* 2. Translucent Canvas Overlay for active brushstrokes */}
            <canvas
              ref={drawingCanvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className={`absolute inset-0 w-full h-full z-10 ${
                isDrawingMode ? 'cursor-cell' : 'pointer-events-none'
              }`}
            />

            {/* 3. Coordinate Percent Text overlays */}
            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
              {project.texts.map(item => (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    color: item.color,
                    fontSize: `${item.size}px`,
                    transform: 'translate(-50%, -50%)',
                    fontFamily: item.font,
                    textShadow: '2px 2px 5px rgba(0,0,0,0.8), -1px -1px 0 rgba(0,0,0,0.5)',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}
                  className="pointer-events-auto group relative select-none cursor-help px-2 py-1 rounded"
                  title="Double click to delete overlay"
                  onDoubleClick={() => {
                    removeTextOverlay(item.id);
                    addNotification({
                      title: 'Label Removed',
                      message: 'Deleted specific visual text layer.',
                      type: 'info'
                    });
                  }}
                >
                  {item.text}
                  <span className="hidden group-hover:block absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] bg-red-600 text-white leading-none px-1 py-0.5 rounded shadow pointer-events-none uppercase">
                    DBL Click To Trash
                  </span>
                </div>
              ))}
            </div>

          </div>

          <div className="absolute top-3 left-3 bg-editorial-dark px-2.5 py-1 text-[10px] font-mono text-editorial-bg border border-editorial-dark">
            {project.name}
          </div>
        </div>

        {/* Action Controls panel */}
        <div className="bg-editorial-cream border border-editorial-dark p-4 rounded-none flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={project.name}
              onChange={(e) => setProject(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Project Title..."
              className="px-3 py-1.5 border border-editorial-dark bg-editorial-bg text-editorial-dark text-xs font-mono focus:border-editorial-accent focus:outline-none rounded-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setProject(prev => ({
                  ...prev,
                  filters: {
                    brightness: 100, contrast: 100, grayscale: 0, sepia: 0, invert: 0, blur: 0, saturate: 100
                  },
                  texts: []
                }));
                clearDrawing();
                setActivePreset('none');
                addNotification({
                  title: 'Aura Reset',
                  message: 'Successfully normalized filters and drawing canvas layers.',
                  type: 'info'
                });
              }}
              className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider border border-editorial-dark text-editorial-dark hover:bg-editorial-dark hover:text-editorial-bg rounded-none flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reset Canvas
            </button>

            <button
              onClick={handleExportAndDownload}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-editorial-dark text-editorial-bg hover:bg-editorial-accent hover:text-white rounded-none flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Export Flat PNG
            </button>
          </div>
        </div>

        {/* Hidden compile canvas */}
        <canvas ref={exportCanvasRef} className="hidden" />

      </div>

      {/* 3. Right properties panel (Xl col-span-3) */}
      <div className="xl:col-span-3 flex flex-col gap-6">

        {/* Slider Adjustment Matrix */}
        <div className="border border-editorial-dark bg-editorial-cream p-5 rounded-none flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-editorial-dark flex items-center gap-1.5 border-b border-editorial-dark/20 pb-2">
            <Crop className="h-4 w-4 text-editorial-accent" /> Color Filters Fine-tuning
          </h3>

          <div className="flex flex-col gap-4 text-xs font-mono text-editorial-dark">
            {/* Brightness */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] text-editorial-dark/60">
                <span>Brightness</span>
                <span className="text-editorial-dark font-bold">{project.filters.brightness}%</span>
              </div>
              <input 
                type="range" min="50" max="150" value={project.filters.brightness}
                onChange={(e) => setProject(p => ({ ...p, filters: { ...p.filters, brightness: parseInt(e.target.value) } }))}
                className="w-full h-1 bg-editorial-bg accent-editorial-accent rounded-none slider-thumb"
              />
            </div>

            {/* Contrast */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] text-editorial-dark/60">
                <span>Contrast</span>
                <span className="text-editorial-dark font-bold">{project.filters.contrast}%</span>
              </div>
              <input 
                type="range" min="50" max="150" value={project.filters.contrast}
                onChange={(e) => setProject(p => ({ ...p, filters: { ...p.filters, contrast: parseInt(e.target.value) } }))}
                className="w-full h-1 bg-editorial-bg accent-editorial-accent rounded-none slider-thumb"
              />
            </div>

            {/* Saturation */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] text-editorial-dark/60">
                <span>Saturation</span>
                <span className="text-editorial-dark font-bold">{project.filters.saturate}%</span>
              </div>
              <input 
                type="range" min="50" max="200" value={project.filters.saturate}
                onChange={(e) => setProject(p => ({ ...p, filters: { ...p.filters, saturate: parseInt(e.target.value) } }))}
                className="w-full h-1 bg-editorial-bg accent-editorial-accent rounded-none slider-thumb"
              />
            </div>

            {/* Blur */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] text-editorial-dark/60">
                <span>Lens Blur</span>
                <span className="text-editorial-dark font-bold">{project.filters.blur}px</span>
              </div>
              <input 
                type="range" min="0" max="10" step="0.5" value={project.filters.blur}
                onChange={(e) => setProject(p => ({ ...p, filters: { ...p.filters, blur: parseFloat(e.target.value) } }))}
                className="w-full h-1 bg-editorial-bg accent-editorial-accent rounded-none slider-thumb"
              />
            </div>

            {/* Grayscale */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] text-editorial-dark/60">
                <span>Grayscale</span>
                <span className="text-editorial-dark font-bold">{project.filters.grayscale}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={project.filters.grayscale}
                onChange={(e) => setProject(p => ({ ...p, filters: { ...p.filters, grayscale: parseInt(e.target.value) } }))}
                className="w-full h-1 bg-editorial-bg accent-editorial-accent rounded-none slider-thumb"
              />
            </div>
          </div>
        </div>

        {/* Text Overlay Section */}
        <div className="border border-editorial-dark bg-editorial-cream p-5 rounded-none flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-editorial-dark flex items-center gap-1.5 border-b border-editorial-dark/20 pb-2">
            <Type className="h-4 w-4 text-editorial-accent" /> Apply Text Inscription
          </h3>

          <form onSubmit={handleAddText} className="flex flex-col gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-editorial-dark/60 font-bold uppercase tracking-wider">Text Caption:</span>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter quote or ad text..."
                className="px-3 py-2 border border-editorial-dark bg-editorial-bg text-editorial-dark focus:border-editorial-accent focus:outline-none rounded-none animate-fade-in"
              />
            </div>

            {/* Slider properties x&y coords */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-editorial-dark">
              <div className="flex flex-col gap-1">
                <span>Pos X ({textX}%)</span>
                <input 
                  type="range" min="5" max="95" value={textX}
                  onChange={(e) => setTextX(parseInt(e.target.value))}
                  className="w-full h-1 bg-editorial-bg accent-editorial-accent rounded-none slider-thumb"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span>Pos Y ({textY}%)</span>
                <input 
                  type="range" min="5" max="95" value={textY}
                  onChange={(e) => setTextY(parseInt(e.target.value))}
                  className="w-full h-1 bg-editorial-bg accent-editorial-accent rounded-none slider-thumb"
                />
              </div>
            </div>

            {/* Font Color & Size */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-editorial-dark">
              <div className="flex flex-col gap-1">
                <span>Point Size:</span>
                <input 
                  type="number" min="10" max="80" value={textSize}
                  onChange={(e) => setTextSize(parseInt(e.target.value) || 24)}
                  className="px-2 py-1 border border-editorial-dark bg-editorial-bg text-editorial-dark rounded-none focus:border-editorial-accent focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span>Color ID:</span>
                <div className="flex items-center gap-1.5 border border-editorial-dark bg-editorial-bg rounded-none px-1">
                  <input 
                    type="color" value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-5 w-5 bg-transparent border-0 cursor-pointer"
                  />
                  <span className="text-[9px]">{textColor}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-editorial-dark hover:bg-editorial-accent border border-editorial-dark text-editorial-bg font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1 mt-1 transition hover:cursor-pointer"
            >
              <Type className="h-3.5 w-3.5" /> Apply Annotation
            </button>
          </form>
        </div>

        {/* Gemini Explainer Prompt (Online Assistant) */}
        <div className="border border-editorial-dark bg-editorial-cream p-5 rounded-none flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-editorial-dark/20 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-editorial-dark flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-editorial-accent animate-pulse" /> Gemini Visual Advisor
            </span>
            <span className="text-[10px] font-mono text-editorial-bg bg-editorial-dark px-2 py-0.5 tracking-wider uppercase">Online</span>
          </div>

          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="w-full h-16 text-xs px-2.5 py-2 border border-editorial-dark bg-editorial-bg text-editorial-dark rounded-none focus:border-editorial-accent focus:outline-none resize-none"
            placeholder="Prompt Gemini AI regarding this background..."
          />

          <button
            onClick={handleGeminiExplain}
            disabled={isAiLoading}
            className="w-full py-2 bg-editorial-dark hover:bg-editorial-accent text-editorial-bg disabled:opacity-50 font-bold uppercase tracking-wider text-xs rounded-none flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            {isAiLoading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Auditing Art Composition...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Analyze Frame with Gemini</span>
              </>
            )}
          </button>

          {aiResult && (
            <div className="mt-2 text-xs bg-editorial-bg border border-editorial-dark p-3 h-44 overflow-y-auto rounded-none text-editorial-dark leading-relaxed scrollbar-thin">
              <div className="font-bold text-editorial-accent mb-1 leading-none font-mono text-[10px] uppercase">Aesthetic Feedback:</div>
              <p className="whitespace-pre-wrap">{aiResult}</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
