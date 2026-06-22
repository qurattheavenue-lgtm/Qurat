import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, Plus, Play, Pause, Trash2, Settings, 
  Music, Download, Sparkles, RefreshCw, Clock, 
  Eye, Layers, Check, ChevronRight, FileVideo, Upload 
} from 'lucide-react';
import { VideoProject, VideoSlide } from '../types';

interface VideoEditorProps {
  isOfflineMode: boolean;
  addNotification: (noti: { title: string; message: string; type: 'success' | 'warning' | 'error' | 'info' }) => void;
}

const STOCK_AUDIO_PRESETS = [
  { id: 'synthwave', name: 'Synthwave Neon Highs', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'lofi', name: 'Aesthetic Lofi Lounge', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 'cinematic', name: 'Cinematic Advert Orchestral', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' }
];

const PRESET_SCENE_BACKGROUNDS = [
  "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", // Blue Ocean
  "linear-gradient(135deg, #311042 0%, #6366f1 100%)", // Midnight Violet
  "linear-gradient(135deg, #1f2937 0%, #111827 100%)", // Slate Tech
  "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)", // Hot Sunset
  "linear-gradient(135deg, #065f46 0%, #059669 100%)", // Mint Grass
];

export default function VideoEditor({ isOfflineMode, addNotification }: VideoEditorProps) {
  // Main Project timeline state
  const [project, setProject] = useState<VideoProject>({
    id: 'vid-main',
    name: 'Untitled Promotional Campaign',
    slides: [
      {
        id: 'slide-1',
        bgImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60',
        bgColor: PRESET_SCENE_BACKGROUNDS[1],
        textOverlay: 'Unleash Your Full Modern Brand',
        textPosition: 'center',
        duration: 4,
        transitionEffect: 'fade',
        panZoomEffect: 'zoom-in'
      },
      {
        id: 'slide-2',
        bgImageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=600&auto=format&fit=crop&q=60',
        bgColor: PRESET_SCENE_BACKGROUNDS[2],
        textOverlay: 'Create Creative Ads Instantly',
        textPosition: 'bottom',
        duration: 3,
        transitionEffect: 'slide',
        panZoomEffect: 'pan-left'
      }
    ],
    audioTrack: {
      name: 'Synthwave Neon Highs',
      url: STOCK_AUDIO_PRESETS[0].url,
      isPlaying: false
    },
    updatedAt: Date.now()
  });

  // Player state
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playProgress, setPlayProgress] = useState<number>(0); // 0 to 100

  // Upload/Presetted states
  const [slideBgInput, setSlideBgInput] = useState<string>('');
  const [slideTextInput, setSlideTextInput] = useState<string>('');
  const [slideDurationInput, setSlideDurationInput] = useState<number>(4);
  const [slideTransition, setSlideTransition] = useState<'none' | 'fade' | 'slide' | 'zoom'>('fade');

  // Exporter/Compiler states
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compilePercent, setCompilePercent] = useState<number>(0);

  // Gemini states
  const [topicPrompt, setTopicPrompt] = useState<string>('Innovative AI organic coffee bags with delivery, focusing on health and sustainability.');
  const [isGeminiLoading, setIsGeminiLoading] = useState<boolean>(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewTimer = useRef<NodeJS.Timeout | null>(null);
  const compileCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Synchronize audio tracks
  const handleAudioTrackToggle = () => {
    if (!audioRef.current) return;
    
    if (project.audioTrack?.isPlaying) {
      audioRef.current.pause();
      setProject(p => ({
        ...p,
        audioTrack: p.audioTrack ? { ...p.audioTrack, isPlaying: false } : null
      }));
    } else {
      audioRef.current.play().catch(() => {});
      setProject(p => ({
        ...p,
        audioTrack: p.audioTrack ? { ...p.audioTrack, isPlaying: true } : null
      }));
      addNotification({
        title: 'Audio Initialized',
        message: 'Streaming background score through browser pipeline.',
        type: 'info'
      });
    }
  };

  const changeAudioTrack = (trackId: string) => {
    const selected = STOCK_AUDIO_PRESETS.find(t => t.id === trackId);
    if (!selected || !audioRef.current) return;

    audioRef.current.src = selected.url;
    if (project.audioTrack?.isPlaying) {
      audioRef.current.play().catch(() => {});
    }

    setProject(p => ({
      ...p,
      audioTrack: {
        name: selected.name,
        url: selected.url,
        isPlaying: !!p.audioTrack?.isPlaying
      }
    }));

    addNotification({
      title: 'Sound Theme Swap',
      message: `Configured audio track to: "${selected.name}"`,
      type: 'info'
    });
  };

  // Automated Timeline slideshow player logic
  useEffect(() => {
    if (!isPlaying) {
      if (previewTimer.current) clearInterval(previewTimer.current);
      return;
    }

    const intervalMs = 100;
    const activeSlide = project.slides[activeSlideIdx];
    if (!activeSlide) {
      setIsPlaying(false);
      return;
    }

    let elapsed = 0;
    const totalMs = activeSlide.duration * 1000;

    const playTimer = setInterval(() => {
      elapsed += intervalMs;
      const progress = (elapsed / totalMs) * 100;
      setPlayProgress(progress);

      if (elapsed >= totalMs) {
        clearInterval(playTimer);
        // Go to next slide or wrap back
        if (activeSlideIdx < project.slides.length - 1) {
          setActiveSlideIdx(activeSlideIdx + 1);
          setPlayProgress(0);
        } else {
          setActiveSlideIdx(0);
          setPlayProgress(0);
          setIsPlaying(false);
          if (audioRef.current && project.audioTrack?.isPlaying) {
            audioRef.current.currentTime = 0;
          }
          addNotification({
            title: 'Timeline Finished',
            message: 'Reached terminal frame of ad layout.',
            type: 'info'
          });
        }
      }
    }, intervalMs);

    previewTimer.current = playTimer;
    return () => {
      clearInterval(playTimer);
    };
  }, [isPlaying, activeSlideIdx, project.slides]);

  // Render slides to interactive Canvas player
  useEffect(() => {
    const canvas = playerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed internal display scale
    canvas.width = 640;
    canvas.height = 360;

    const activeSlide = project.slides[activeSlideIdx];
    if (!activeSlide) return;

    // Draw Background
    if (activeSlide.bgImageUrl) {
      const img = new Image();
      img.src = activeSlide.bgImageUrl;
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Clear canvas
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Apply Ken Burns Pan/Zoom movement simulation on canvas based on playback progress
        ctx.save();
        let scale = 1.0;
        let transX = 0;
        let transY = 0;

        if (activeSlide.panZoomEffect === 'zoom-in') {
          scale = 1.0 + (playProgress / 100) * 0.15;
          // Center zoom
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.scale(scale, scale);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);
        } else if (activeSlide.panZoomEffect === 'pan-left') {
          transX = -((playProgress / 100) * 40);
          ctx.translate(transX, 0);
        } else if (activeSlide.panZoomEffect === 'pan-right') {
          transX = (playProgress / 100) * 40;
          ctx.translate(transX, 0);
        }

        // Draw background fit center
        const aspect = img.width / img.height;
        const targetAspect = canvas.width / canvas.height;
        let drawW, drawH, drawX, drawY;

        if (aspect > targetAspect) {
          drawW = canvas.width;
          drawH = canvas.width / aspect;
          drawX = 0;
          drawY = (canvas.height - drawH) / 2;
        } else {
          drawH = canvas.height;
          drawW = canvas.height * aspect;
          drawX = (canvas.width - drawW) / 2;
          drawY = 0;
        }

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();

        // Layer transition effect fade
        if (activeSlide.transitionEffect === 'fade' && playProgress < 20) {
          ctx.fillStyle = `rgba(15, 23, 42, ${1 - (playProgress / 20)})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw Text overlay on top of background
        drawOverlayText(ctx, canvas, activeSlide);
      };

      // In case image load fails, draw color gradient background
      img.onerror = () => {
        drawFallbackGradient(ctx, canvas, activeSlide);
        drawOverlayText(ctx, canvas, activeSlide);
      };
    } else {
      drawFallbackGradient(ctx, canvas, activeSlide);
      drawOverlayText(ctx, canvas, activeSlide);
    }

  }, [activeSlideIdx, project.slides, playProgress]);

  const drawFallbackGradient = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, slide: VideoSlide) => {
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#311042');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const drawOverlayText = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, slide: VideoSlide) => {
    if (!slide.textOverlay) return;

    ctx.font = 'bold 30px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    let textY = canvas.height / 2;
    if (slide.textPosition === 'top') textY = 60;
    if (slide.textPosition === 'bottom') textY = canvas.height - 60;

    ctx.fillText(slide.textOverlay, canvas.width / 2 + 2, textY + 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(slide.textOverlay, canvas.width / 2, textY);
  };

  // Add Slide to workspace
  const handleAddNewSlide = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Pick preset colorful abstract backdrop if none uploaded
    const presetBgs = [
      'https://images.unsplash.com/photo-1557683316-973673baf926?w=600&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=60'
    ];
    const randomizedBg = presetBgs[Math.floor(Math.random() * presetBgs.length)];

    const createdSlide: VideoSlide = {
      id: `slide-${Date.now()}`,
      bgImageUrl: slideBgInput || randomizedBg,
      bgColor: PRESET_SCENE_BACKGROUNDS[2],
      textOverlay: slideTextInput || 'Promote Core Value Hook Here',
      textPosition: 'center',
      duration: slideDurationInput,
      transitionEffect: slideTransition,
      panZoomEffect: 'none'
    };

    setProject(p => ({
      ...p,
      slides: [...p.slides, createdSlide],
      updatedAt: Date.now()
    }));

    setSlideBgInput('');
    setSlideTextInput('');
    addNotification({
      title: 'Slide Added',
      message: 'Created slide inside promotional storyboard.',
      type: 'success'
    });
  };

  // Delete slide
  const deleteSlide = (id: string) => {
    if (project.slides.length <= 1) {
      addNotification({
        title: 'Delete Rejected',
        message: 'Must have at least one slide to play standard presentation.',
        type: 'warning'
      });
      return;
    }

    setProject(p => {
      const remaining = p.slides.filter(s => s.id !== id);
      return {
        ...p,
        slides: remaining,
        updatedAt: Date.now()
      };
    });
    setActiveSlideIdx(0);
    setPlayProgress(0);
  };

  // File Upload Slide frame background
  const handleSlidePhotoUploaded = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSlideBgInput(reader.result);
        addNotification({
          title: 'Frame Graphic Loaded',
          message: 'Saved graphic stream to slide backdrop input.',
          type: 'info'
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // 100% Offline Canvas media export to WebM!
  // Sequences slide canvas frames in a compilation loop, capturing data streams dynamically
  const handleExportVideoMedia = () => {
    const compCanvas = compileCanvasRef.current;
    if (!compCanvas) {
      addNotification({
        title: 'Compiler Loading',
        message: 'Underlying compilation pipeline is setting up.',
        type: 'warning'
      });
      return;
    }

    setIsCompiling(true);
    setCompilePercent(10);
    setIsPlaying(false);

    const ctx = compCanvas.getContext('2d');
    if (!ctx) return;

    compCanvas.width = 640;
    compCanvas.height = 360;

    // Capture canvas frame stream at 30 FPS
    const canvasStream = compCanvas.captureStream(30);
    let mediaRecorder: MediaRecorder;
    try {
      mediaRecorder = new MediaRecorder(canvasStream, { mimeType: 'video/webm;codecs=vp9' });
    } catch {
      // Fallback for older browsers
      mediaRecorder = new MediaRecorder(canvasStream);
    }

    const recordedChunks: Blob[] = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data?.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    // When compile is completed
    mediaRecorder.onstop = () => {
      setCompilePercent(95);
      const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(videoBlob);

      const downloadLink = document.createElement('a');
      downloadLink.download = `${project.name}-render-clip.webm`;
      downloadLink.href = videoUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setIsCompiling(false);
      setCompilePercent(0);
      addNotification({
        title: 'Video Composed',
        message: 'Successfully rendered WebM slideshow file offline!',
        type: 'success'
      });
    };

    // Begin standard recording
    mediaRecorder.start();

    // Loop through slides frame-by-frame and render them onto the compiler canvas
    let currentSlideIndex = 0;
    let progressStep = 0;
    const framesPerSlide = 15; // virtual speed scaler for compiling
    const totalSlides = project.slides.length;

    const renderLoop = setInterval(() => {
      const slide = project.slides[currentSlideIndex];
      if (!slide) {
        clearInterval(renderLoop);
        mediaRecorder.stop();
        return;
      }

      // Draw background of current frame onto compile canvas
      if (slide.bgImageUrl) {
        const frameImg = new Image();
        frameImg.src = slide.bgImageUrl;
        frameImg.crossOrigin = 'anonymous';

        // Draw and write overlay text inside render ticks
        const drawOnCanvas = () => {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, compCanvas.width, compCanvas.height);
          ctx.drawImage(frameImg, 0, 0, compCanvas.width, compCanvas.height);
          drawOverlayText(ctx, compCanvas, slide);

          // Advance step
          progressStep++;
          const calcPercent = Math.round(((currentSlideIndex * framesPerSlide + progressStep) / (totalSlides * framesPerSlide)) * 80) + 10;
          setCompilePercent(calcPercent);

          if (progressStep >= framesPerSlide) {
            progressStep = 0;
            currentSlideIndex++;
          }
        };

        frameImg.onload = drawOnCanvas;
        frameImg.onerror = () => {
          drawFallbackGradient(ctx, compCanvas, slide);
          drawOverlayText(ctx, compCanvas, slide);
          
          progressStep++;
          if (progressStep >= framesPerSlide) {
            progressStep = 0;
            currentSlideIndex++;
          }
        };

      } else {
        drawFallbackGradient(ctx, compCanvas, slide);
        drawOverlayText(ctx, compCanvas, slide);
        
        progressStep++;
        if (progressStep >= framesPerSlide) {
          progressStep = 0;
          currentSlideIndex++;
        }
      }

    }, 150); // compile frame speed index
  };

  // Online Feature: Call server-side Gemini to generate comprehensive storyboard
  const handleGeminiCampaignScript = async () => {
    if (isOfflineMode) {
      addNotification({
        title: 'Network Simulation Block',
        message: 'Simulated Offline mode restricts server script querying.',
        type: 'warning'
      });
      return;
    }

    setIsGeminiLoading(true);
    try {
      const response = await fetch('/api/gemini/video-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicPrompt,
          duration: 15,
          sceneCount: 3
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Storyboard script error");

      if (data.script && data.script.scenes && data.script.scenes.length > 0) {
        // Map scenes back to standard Project Slides
        const convertedSlides: VideoSlide[] = data.script.scenes.map((scene: any, idx: number) => ({
          id: `ai-slide-${idx}-${Date.now()}`,
          bgImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60', // standard high-visual stock
          bgColor: PRESET_SCENE_BACKGROUNDS[idx % PRESET_SCENE_BACKGROUNDS.length],
          textOverlay: scene.textOverlay,
          textPosition: 'center',
          duration: scene.slideDuration || 4,
          transitionEffect: 'fade',
          panZoomEffect: 'zoom-in'
        }));

        setProject(p => ({
          ...p,
          name: data.script.title || 'Gemini Storyboard Campaign',
          slides: convertedSlides,
          updatedAt: Date.now()
        }));

        setActiveSlideIdx(0);
        setPlayProgress(0);

        addNotification({
          title: 'Storyboard Synchronized!',
          message: `Injected ${convertedSlides.length} AI structured slides into timeline.`,
          type: 'success'
        });
      }
    } catch (err: any) {
      console.error(err);
      addNotification({
        title: 'Storyboard Error',
        message: err.message || 'Error processing AI campaign scripts.',
        type: 'error'
      });
    } finally {
      setIsGeminiLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="video-workspace-container">
      
      {/* 1. Left Control Panel: Storyboard Creator (Col-span-3) */}
      <div className="xl:col-span-3 flex flex-col gap-4 border border-editorial-dark bg-editorial-cream p-5 rounded-none">
        <div className="flex items-center justify-between border-b border-editorial-dark/25 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-editorial-dark flex items-center gap-2">
            <Layers className="h-4 w-4 text-editorial-accent" /> Frame Timeline Composer
          </h3>
          <span className="text-[10px] font-mono text-editorial-bg bg-editorial-dark px-2 py-0.5 tracking-wider uppercase">Offline OK</span>
        </div>

        {/* Existing Audio background mixer */}
        <div className="flex flex-col gap-2 bg-editorial-bg p-3 rounded-none border border-editorial-dark">
          <span className="text-xs font-bold uppercase tracking-wider text-editorial-dark flex items-center gap-1">
            <Music className="h-3.5 w-3.5 text-editorial-accent" /> Audio Lounge Score
          </span>
          <audio ref={audioRef} loop src={STOCK_AUDIO_PRESETS[0].url} className="hidden" />
          
          <div className="flex flex-col gap-1.5 mt-2">
            <select
              value={STOCK_AUDIO_PRESETS.find(t => t.name === project.audioTrack?.name)?.id || 'synthwave'}
              onChange={(e) => changeAudioTrack(e.target.value)}
              className="w-full text-xs px-2 py-1.5 border border-editorial-dark bg-editorial-cream text-editorial-dark focus:border-editorial-accent focus:outline-none rounded-none font-mono"
            >
              {STOCK_AUDIO_PRESETS.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            <button
              onClick={handleAudioTrackToggle}
              className={`w-full py-1.5 text-xs font-bold uppercase tracking-wider rounded-none transition flex items-center justify-center gap-1 cursor-pointer ${
                project.audioTrack?.isPlaying 
                   ? 'bg-editorial-dark text-editorial-bg border border-editorial-dark' 
                   : 'bg-editorial-bg text-editorial-dark border border-editorial-dark hover:bg-editorial-cream'
              }`}
            >
              {project.audioTrack?.isPlaying ? (
                <>
                  <Pause className="h-3 w-3" /> Stop Lounge Track Preview
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" /> Play Lounge Track Preview
                </>
              )}
            </button>
          </div>
        </div>

        {/* Add slide inputs */}
        <form onSubmit={handleAddNewSlide} className="flex flex-col gap-3 text-xs border-t border-editorial-dark/25 pt-4 text-editorial-dark animate-fade-in">
          <span className="text-xs font-bold uppercase tracking-wider">Add Next Slide Frame:</span>
          
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-editorial-dark/60">Headline Tagline:</span>
            <input 
              type="text" 
              value={slideTextInput}
              onChange={(e) => setSlideTextInput(e.target.value)}
              placeholder="e.g. 50% Off Autumn Sale"
              className="px-3 py-2 border border-editorial-dark bg-editorial-bg text-editorial-dark focus:border-editorial-accent focus:outline-none rounded-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-editorial-dark/60">Slide Duration:</span>
            <div className="flex items-center gap-2">
              <input 
                type="number" min="1" max="10" value={slideDurationInput}
                onChange={(e) => setSlideDurationInput(parseInt(e.target.value) || 4)}
                className="w-16 px-2 py-1.5 border border-editorial-dark bg-editorial-bg text-editorial-dark rounded-none focus:border-editorial-accent focus:outline-none"
              />
              <span className="text-[10px] text-editorial-dark/60 font-mono">1s to 10s max</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-editorial-dark/60">Custom Frame Image Stream:</span>
            <label className="border border-dashed border-editorial-dark bg-editorial-bg hover:bg-editorial-dark/5 transition rounded-none py-2.5 px-3 flex items-center justify-center gap-1.5 cursor-pointer text-editorial-dark/70">
              <Upload className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase">Select photo stream</span>
              <input 
                type="file" accept="image/*" className="hidden" 
                onChange={handleSlidePhotoUploaded} 
              />
            </label>
            {slideBgInput && (
              <span className="text-[9px] text-emerald-800 font-mono flex items-center gap-1 mt-0.5 font-bold">
                <Check className="h-2.5 w-2.5" /> Stream Loaded
              </span>
            )}
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2 bg-editorial-dark hover:bg-editorial-accent text-editorial-bg font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add Frame To Timeline
          </button>
        </form>

      </div>

      {/* 2. Middle Stage Area: Player & Timeline Preview (Col-span-6) */}
      <div className="xl:col-span-6 flex flex-col gap-4">
        
        {/* Real-time slider Player stage */}
        <div className="relative min-h-[300px] md:min-h-[380px] bg-editorial-cream rounded-none border border-editorial-dark overflow-hidden flex flex-col items-center justify-center p-4">
          <canvas 
            ref={playerCanvasRef} 
            className="max-h-[320px] max-w-full rounded-none shadow-md bg-black border border-editorial-dark"
          />

          {/* Absolute slide trackers */}
          <div className="absolute top-3 right-3 bg-editorial-dark border border-editorial-dark px-3 py-1 text-[10px] font-mono text-editorial-bg">
            Slide {activeSlideIdx + 1} of {project.slides.length}
          </div>
        </div>

        {/* Timeline Player track toolbar */}
        <div className="bg-editorial-cream border border-editorial-dark p-4 rounded-none flex flex-col gap-3 text-editorial-dark">
          
          {/* Progress Timeline Scrubber */}
          <div className="flex flex-col gap-1">
            <div className="h-1.5 w-full bg-editorial-bg rounded-none overflow-hidden relative border border-editorial-dark/40">
              <div 
                style={{ width: `${playProgress}%` }}
                className="h-full bg-editorial-accent transition-all duration-100 ease-linear"
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-editorial-dark/60 mt-1">
              <span>0:00</span>
              <span className="text-editorial-dark font-sans font-bold">Active Scene Progress: {Math.round(playProgress)}%</span>
              <span>{project.slides[activeSlideIdx]?.duration || 4}:00s</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
            
            {/* Player Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (activeSlideIdx > 0) {
                    setActiveSlideIdx(activeSlideIdx - 1);
                    setPlayProgress(0);
                  }
                }}
                disabled={activeSlideIdx === 0}
                className="p-1 px-2.5 rounded-none border border-editorial-dark text-[11px] uppercase tracking-wider font-bold bg-editorial-bg text-editorial-dark disabled:opacity-40 hover:bg-editorial-dark hover:text-editorial-bg transition cursor-pointer"
              >
                Previous Frame
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`py-1.5 px-4 rounded-none font-bold text-xs flex items-center gap-1.5 border border-editorial-dark cursor-pointer transition ${
                  isPlaying ? 'bg-editorial-accent text-white border-editorial-accent' : 'bg-editorial-dark text-editorial-bg hover:bg-editorial-accent hover:text-white'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-3.5 w-3.5" /> Pause preview
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" /> Play Storyboard
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (activeSlideIdx < project.slides.length - 1) {
                    setActiveSlideIdx(activeSlideIdx + 1);
                    setPlayProgress(0);
                  }
                }}
                disabled={activeSlideIdx === project.slides.length - 1}
                className="p-1 px-2.5 rounded-none border border-editorial-dark text-[11px] uppercase tracking-wider font-bold bg-editorial-bg text-editorial-dark disabled:opacity-40 hover:bg-editorial-dark hover:text-editorial-bg transition cursor-pointer"
              >
                Next Frame
              </button>
            </div>

            {/* Downloader compiling trigger */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportVideoMedia}
                disabled={isCompiling}
                className="px-4 py-2 text-xs font-bold bg-editorial-dark text-editorial-bg border border-editorial-dark rounded-none flex items-center gap-1.5 transition disabled:opacity-50 hover:bg-editorial-accent hover:text-white hover:cursor-pointer"
              >
                {isCompiling ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Compiling ({compilePercent}%)</span>
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" /> Compile Video WebM
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

        {/* Compile target hidden canvas */}
        <canvas ref={compileCanvasRef} className="hidden" />

        {/* Visual sequence frames bento grid */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-editorial-dark/70 block font-bold uppercase tracking-wider">Timeline frames sequence:</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {project.slides.map((slide, idx) => (
              <div
                key={slide.id}
                onClick={() => {
                  setActiveSlideIdx(idx);
                  setPlayProgress(0);
                }}
                className={`flex flex-col border rounded-none p-2.5 transition relative cursor-pointer ${
                  activeSlideIdx === idx 
                    ? 'border-editorial-dark bg-editorial-cream shadow-sm ring-1 ring-editorial-accent/20 font-bold' 
                    : 'border-editorial-dark/30 bg-editorial-bg text-editorial-dark/80 hover:border-editorial-dark hover:bg-editorial-cream'
                }`}
              >
                <div className="h-16 rounded-none overflow-hidden relative bg-slate-900 border border-editorial-dark mb-1.5">
                  {slide.bgImageUrl ? (
                    <img src={slide.bgImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div style={{ background: PRESET_SCENE_BACKGROUNDS[idx % PRESET_SCENE_BACKGROUNDS.length] }} className="w-full h-full" />
                  )}
                  <span className="absolute bottom-1 right-1 bg-editorial-dark text-editorial-bg px-1 py-0.5 rounded-none text-[8px] font-mono">
                    {slide.duration}s
                  </span>
                </div>
                <div className="text-[10px] font-mono opacity-80 line-clamp-1">{slide.textOverlay || 'No headline text'}</div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSlide(slide.id);
                  }}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-100 hover:bg-red-600 text-red-900 hover:text-white border border-red-900 flex items-center justify-center transition shadow-sm cursor-help"
                  title="Remove frame"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Right Property Panel: Gemini Content Scripts (Col-span-3) */}
      <div className="xl:col-span-3 flex flex-col gap-5 border border-editorial-dark bg-editorial-cream p-5 rounded-none text-xs text-editorial-dark">
        <div className="flex items-center justify-between border-b border-editorial-dark/25 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-editorial-dark flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-editorial-accent animate-pulse" /> Gemini Storyboarder
          </span>
          <span className="text-[10px] font-mono text-editorial-bg bg-editorial-dark px-2 py-0.5 tracking-wider uppercase">Online</span>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="leading-normal text-editorial-dark/75">Input your promotion concept. Gemini will compose a highly engaging ad storyboard and inject structured scenes into the timeline below:</span>
          
          <textarea
            value={topicPrompt}
            onChange={(e) => setTopicPrompt(e.target.value)}
            className="w-full h-20 px-2.5 py-2 text-xs border border-editorial-dark bg-editorial-bg text-editorial-dark rounded-none focus:border-editorial-accent focus:outline-none resize-none"
            placeholder="Describe product, offer details, target theme..."
          />

          <button
            onClick={handleGeminiCampaignScript}
            disabled={isGeminiLoading}
            className="w-full py-2 bg-editorial-dark hover:bg-editorial-accent text-editorial-bg disabled:opacity-50 font-bold uppercase tracking-wider text-xs rounded-none flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            {isGeminiLoading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Generating Script boards...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Script & Synergize Timeline</span>
              </>
            )}
          </button>
        </div>

        {/* Aesthetic guidelines footer */}
        <div className="border-t border-editorial-dark/25 pt-4 text-[10px] text-editorial-dark/75 leading-normal flex flex-col gap-2 font-sans font-normal">
          <div className="flex items-start gap-1">
            <Settings className="h-3 w-3 mt-0.5 text-editorial-accent shrink-0" />
            <span><strong>Offline Note:</strong> Custom sound playback, timeline scene deletion, and high-fidelity video WebM exports compile securely without any server assistance!</span>
          </div>
          <div className="flex items-start gap-1">
            <Check className="h-3 w-3 mt-0.5 text-emerald-800 shrink-0" />
            <span>Click on any timeline frame sequence block to quick-route preview sliders directly to that frame.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
