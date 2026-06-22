import React, { useState } from 'react';
import { 
  Megaphone, Download, Sparkles, RefreshCw, Check, 
  Share2, Globe, Heart, MessageCircle, Bookmark, Search, MoreHorizontal, MessageSquare, Briefcase, ChevronRight 
} from 'lucide-react';
import { CampaignBrief, GeneratedAd } from '../types';

interface CampaignHubProps {
  isOfflineMode: boolean;
  addNotification: (noti: { title: string; message: string; type: 'success' | 'warning' | 'error' | 'info' }) => void;
}

const DEFAULT_BRIEF: CampaignBrief = {
  brandName: 'Organic Aurora',
  productDescription: 'Slow-roasted biodynamic coffee beans packed in compostable plant-fiber pouches.',
  primaryTarget: 'Environmentally-conscious coffee enthusiasts',
  primaryColor: '#6366F1',
  accentColor: '#F59E0B',
  logoUrl: null,
  adPlatforms: {
    facebook: true,
    instagram: true,
    googleSearch: true,
    linkedin: true,
    tiktok: false
  },
  customKeywords: 'Peak roasting aroma, zero landfill waste, daily micro roasting'
};

const INITIAL_ADS: GeneratedAd[] = [
  {
    id: 'ad-mock-1',
    platform: 'instagram',
    headline: 'Awake Passion. Save Forests.',
    bodyText: 'We micro-roast biodynamic beans in small batches and ship them direct to your door. Our plant-fiber packaging completely decomposes within 90 days. Every sip supports forest conservation initiatives around the globe. ☕🍃',
    imageTheme: 'Warm macro shot of roasting coffee beans reflecting soft sunlight inside rustic barn',
    callToAction: 'Shop Sustainable Brews'
  },
  {
    id: 'ad-mock-2',
    platform: 'googleSearch',
    headline: 'Aurora Organic Roasters | Fresh Biodynamic Coffee Bags',
    bodyText: 'Certified organic coffee delivered. Compostable, zero land-fill waste packaging. Save 15% with subscription. Peak roasting aroma guaranteed.',
    imageTheme: 'Minimalist product search showcase card',
    callToAction: 'Learn More'
  }
];

// Offline Slogan Vocabulary Banks to spin taglines offline
const OFFLINE_HOOKS = [
  "Awaken Your Inner Drive.",
  "Engineered For Peak Performance.",
  "Simple, Sustainable, Uncompromising.",
  "Disrupting The Way You Experience Freshness.",
  "Loved By Experts. Built For Everyone."
];
const OFFLINE_BODIES = [
  "crafted with certified pristine coordinates. Experience absolute value with compostable packaging modules designed to make life easier.",
  "brought directly to your desk completely hassle free. Take advantage of our autumn sampler discounts today with zero liability.",
  "engineered to optimize daily performance while supporting a green, zero-landfill circular economy format. Start today."
];
const OFFLINE_CTAS = [
  "Shop Now",
  "Sign Up Today",
  "Learn More",
  "Claim Sampler Bag"
];

export default function CampaignHub({ isOfflineMode, addNotification }: CampaignHubProps) {
  // Campaign Profile Brief state
  const [brief, setBrief] = useState<CampaignBrief>(DEFAULT_BRIEF);
  const [ads, setAds] = useState<GeneratedAd[]>(INITIAL_ADS);
  const [activeAdId, setActiveAdId] = useState<string>(INITIAL_ADS[0].id);

  // Gemini loading states
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Active visualized ad mock object pointer
  const activeAd = ads.find(a => a.id === activeAdId) || ads[0];

  // 100% Offline Slogan Spinner logic
  const handleOfflineSloganSpin = () => {
    const Brand = brief.brandName || 'Your Brand';
    const Product = brief.productDescription || 'Product';

    // Mix and match dynamic templates using brief inputs
    const platforms: GeneratedAd['platform'][] = ['instagram', 'facebook', 'googleSearch', 'linkedin'];
    const generated: GeneratedAd[] = platforms.map((plat, idx) => {
      const hook = OFFLINE_HOOKS[(idx + Brand.length) % OFFLINE_HOOKS.length];
      const body = OFFLINE_BODIES[(idx + Product.length) % OFFLINE_BODIES.length];
      const cta = OFFLINE_CTAS[(idx + idx) % OFFLINE_CTAS.length];

      let headline = `${Brand} | ${hook}`;
      if (plat === 'instagram' || plat === 'tiktok') {
        headline = `${hook}`;
      } else if (plat === 'googleSearch') {
        headline = `${Brand} - Best ${Product.split(' ')[0]} Store`;
      }

      return {
        id: `offline-ad-${plat}-${Date.now()}`,
        platform: plat,
        headline,
        bodyText: `${Brand} is ${Product} ${body}`,
        imageTheme: 'Aesthetic raw marketing template with bold modern typography highlights',
        callToAction: cta
      };
    });

    setAds(generated);
    setActiveAdId(generated[0].id);
    addNotification({
      title: 'Taglines Spun Offline',
      message: 'Synthesized 4 unique ad mockups using native vocabulary banks!',
      type: 'success'
    });
  };

  // Online feature: Call server-side Gemini to generate marketing texts
  const handleGeminiCampaignCopy = async () => {
    if (isOfflineMode) {
      addNotification({
        title: 'Network Simulation Block',
        message: 'Online Campaign copywriting is blocked in simulated offline mode.',
        type: 'warning'
      });
      return;
    }

    setIsAiLoading(true);
    try {
      const response = await fetch('/api/gemini/campaign-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: brief.brandName,
          productDescription: brief.productDescription,
          primaryTarget: brief.primaryTarget,
          customKeywords: brief.customKeywords
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ad campaign copy endpoint error");

      if (data.ads && data.ads.length > 0) {
        const generated: GeneratedAd[] = data.ads.map((ad: any, idx: number) => ({
          id: `ai-ad-${idx}-${Date.now()}`,
          platform: ad.platform,
          headline: ad.headline,
          bodyText: ad.bodyText,
          imageTheme: ad.imageTheme,
          callToAction: ad.callToAction
        }));

        setAds(generated);
        setActiveAdId(generated[0].id);

        addNotification({
          title: 'Ad Campaigns Crafted!',
          message: `Retrieved ${generated.length} CRO optimized ad campaigns from Gemini.`,
          type: 'success'
        });
      }
    } catch (err: any) {
      console.error(err);
      addNotification({
        title: 'AI Copy Gen Error',
        message: err.message || 'Error processing AI campaign copy writers.',
        type: 'error'
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Export current campaign mock text offline
  const handleExportMockText = () => {
    const textData = `========= CAMPAIGN AD BRIEF INTEL =========
Brand Identity: ${brief.brandName}
Product Matrix: ${brief.productDescription}
Segment Audience: ${brief.primaryTarget}

------- ACTIVE AD MOCKUP (${activeAd.platform.toUpperCase()}) -------
Headline: ${activeAd.headline}
Ad Copy text: ${activeAd.bodyText}
Suggested visual direction: ${activeAd.imageTheme}
Call To Action: [ ${activeAd.callToAction} ]`;

    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${brief.brandName.replace(/\s+/g, '-').toLowerCase()}-ad-brief.txt`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotification({
      title: 'Campaign Brief Shared',
      message: 'Exported advertising briefing sheet locally.',
      type: 'success'
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-editorial-dark" id="campaign-hub-workspace">
      
      {/* 1. Left controls panel (Xl col-span-4) - Ad Brand Settings */}
      <div className="xl:col-span-4 flex flex-col gap-4 border border-editorial-dark bg-editorial-cream p-5 rounded-none">
        <div className="flex items-center justify-between border-b border-editorial-dark/25 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-editorial-dark flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-editorial-accent" /> Ad Brand brief profile
          </h3>
          <span className="text-[10px] font-mono text-editorial-bg bg-editorial-dark px-2 py-0.5 tracking-wider uppercase">Offline OK</span>
        </div>

        <div className="flex flex-col gap-3 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-editorial-dark/60">Brand Designation Name:</span>
            <input
              type="text"
              value={brief.brandName}
              onChange={(e) => setBrief({ ...brief, brandName: e.target.value })}
              className="px-3 py-2 border border-editorial-dark bg-editorial-bg text-editorial-dark rounded-none focus:border-editorial-accent focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-editorial-dark/60">Value Pitch Description:</span>
            <textarea
              value={brief.productDescription}
              onChange={(e) => setBrief({ ...brief, productDescription: e.target.value })}
              className="w-full h-16 text-xs px-2.5 py-2 border border-editorial-dark bg-editorial-bg text-editorial-dark rounded-none focus:border-editorial-accent focus:outline-none resize-none"
              placeholder="What makes your item spectacular?"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-editorial-dark/60">Primary Demographic Target:</span>
            <input
              type="text"
              value={brief.primaryTarget}
              onChange={(e) => setBrief({ ...brief, primaryTarget: e.target.value })}
              className="px-3 py-2 border border-editorial-dark bg-editorial-bg text-editorial-dark rounded-none focus:border-editorial-accent focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-editorial-dark/60">Keywords/Guidance:</span>
            <input
              type="text"
              value={brief.customKeywords}
              onChange={(e) => setBrief({ ...brief, customKeywords: e.target.value })}
              placeholder="Aroma preservation, Autumn discount..."
              className="px-3 py-2 border border-editorial-dark bg-editorial-bg text-editorial-dark rounded-none focus:border-editorial-accent focus:outline-none"
            />
          </div>

          {/* Slogan Spin actions */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={handleOfflineSloganSpin}
              className="py-2 bg-editorial-bg text-editorial-dark hover:bg-editorial-dark hover:text-editorial-bg font-bold uppercase tracking-wider text-[10px] border border-editorial-dark rounded-none flex items-center justify-center gap-1 transition text-center cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 text-editorial-accent" /> Spin taglines
            </button>

            <button
              onClick={handleGeminiCampaignCopy}
              disabled={isAiLoading}
              className="py-2 bg-editorial-dark text-editorial-bg hover:bg-editorial-accent hover:text-white disabled:opacity-50 text-xs font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {isAiLoading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Structuring CRO...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-editorial-bg" />
                  <span>Ask Gemini AI</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* 2. Middle Visual Mockup Area: Phone and UI Frames (Col-span-5) */}
      <div className="xl:col-span-5 flex flex-col gap-4 text-editorial-dark">
        
        {/* Dynamic Mockup Card visualizer wrapper */}
        <div className="bg-editorial-cream border border-editorial-dark rounded-none p-6 min-h-[420px] flex items-center justify-center relative">
          
          {/* Mockup Card: INSTAGRAM PHONE FRAME */}
          {activeAd.platform === 'instagram' && (
            <div className="w-[300px] border border-slate-800 bg-black rounded-3xl overflow-hidden shadow-2xl relative animate-fade-in">
              <div className="bg-black/80 border-b border-zinc-900 py-3.5 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-0.5">
                    <div className="h-full w-full bg-black rounded-full flex items-center justify-center text-[10px] font-extrabold text-white">IG</div>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-white flex items-center gap-1">
                      {brief.brandName || 'Sponsor'} <Check className="h-2.5 w-2.5 text-sky-400 fill-sky-400 shrink-0" />
                    </h4>
                    <span className="text-[8px] text-zinc-400 leading-none block">Sponsored ad frame</span>
                  </div>
                </div>
                <MoreHorizontal className="h-4 w-4 text-zinc-500" />
              </div>

              {/* Simulated visual image poster */}
              <div className="h-[220px] relative bg-gradient-to-tr from-indigo-950 via-slate-900 to-amber-950/40 flex items-center justify-center text-center p-6">
                <p className="text-white text-base font-bold select-none drop-shadow-md">{activeAd.headline}</p>
                <span className="absolute bottom-3 left-3 text-[8px] font-mono text-indigo-400 uppercase tracking-widest">{activeAd.imageTheme.substring(0, 40)}...</span>
              </div>

              {/* Call to action panel bar */}
              <div className="border-y border-zinc-900 py-2.5 px-4 bg-zinc-950 flex justify-between select-none items-center text-xs">
                <span className="text-[#3b82f6] font-bold hover:underline cursor-pointer">{activeAd.callToAction}</span>
                <ChevronRight className="h-3 w-3 text-zinc-400" />
              </div>

              {/* Engagement icons */}
              <div className="p-3.5 flex flex-col gap-1.5 select-none text-[11px]">
                <div className="flex justify-between text-zinc-400">
                  <div className="flex gap-3">
                    <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                    <MessageCircle className="h-4 w-4" />
                    <Share2 className="h-4 w-4" />
                  </div>
                  <Bookmark className="h-4 w-4" />
                </div>
                
                <span className="text-white font-bold mt-1 text-[10px]">1,420 likes</span>
                
                <p className="text-zinc-300 leading-relaxed text-[10px] mt-0.5 font-sans">
                  <strong className="text-white font-bold mr-1">{brief.brandName || 'Sponsor'}</strong>
                  {activeAd.bodyText}
                </p>
              </div>
            </div>
          )}

          {/* Mockup Card: FACEBOOK TIMELINE POST */}
          {activeAd.platform === 'facebook' && (
            <div className="w-[320px] rounded-lg border border-slate-800 bg-[#18191a] text-zinc-200 p-4 shadow-2xl relative animate-fade-in select-none">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-[12px] font-extrabold shadow1">F</div>
                <div>
                  <h4 className="text-xs font-bold flex items-center gap-1 text-white">
                    {brief.brandName} <span className="text-[#385898] font-bold shrink-0">✔</span>
                  </h4>
                  <span className="text-[9px] text-[#b0b3b8] flex items-center gap-1">Sponsored • <Globe className="h-2.5 w-2.5" /></span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-300 leading-relaxed mb-3">{activeAd.bodyText}</p>

              {/* Graphic container */}
              <div className="border border-zinc-850 h-[180px] bg-[#242526] rounded flex flex-col overflow-hidden">
                <div className="flex-1 bg-gradient-to-br from-teal-950 to-slate-900 flex items-center justify-center p-3 text-center">
                  <span className="text-sm font-extrabold text-teal-300">{activeAd.headline}</span>
                </div>
                <div className="bg-[#242526] p-2.5 border-t border-zinc-850 flex justify-between items-center text-xs select-none">
                  <div className="overflow-hidden">
                    <span className="text-[9px] text-[#b0b3b8] block uppercase">COMPLEMENTARY THEME</span>
                    <span className="text-[11px] font-bold text-white truncate">{brief.brandName} Promotional Offer</span>
                  </div>
                  <button className="bg-[#3a3b3c] hover:bg-[#4e4f50] text-zinc-100 font-bold px-3 py-1.5 rounded text-[10px]">
                    {activeAd.callToAction}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mockup Card: LINKEDIN PROFESSIONAL SLIDE */}
          {activeAd.platform === 'linkedin' && (
            <div className="w-[320px] rounded-lg border border-[#1E293B] bg-[#0E1322] text-zinc-200 p-4 shadow-2xl relative animate-fade-in select-none">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-[#0072b1] flex items-center justify-center text-white text-[11px] font-bold">in</div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1">
                      {brief.brandName} <span className="text-blue-500 text-[10px] font-bold">1st</span>
                    </h4>
                    <span className="text-[9px] text-slate-500">Corporate Strategy & Organic Solutions</span>
                  </div>
                </div>
                <Briefcase className="h-4 w-4 text-[#0072b1]" />
              </div>

              <p className="text-[11px] text-zinc-300 leading-relaxed mb-3">{activeAd.bodyText}</p>

              {/* Enterprise visual card banner */}
              <div className="h-[150px] rounded bg-gradient-to-tr from-slate-900 to-indigo-950 p-4 flex flex-col justify-between border border-slate-800">
                <span className="text-[9px] text-indigo-400 font-bold tracking-widest uppercase">{brief.brandName} EXECUTIVE SUMMARY</span>
                <p className="text-white text-xs font-bold text-center leading-snug my-auto">{activeAd.headline}</p>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Campaign Direction: CRO Optimized</span>
                  <span className="text-[#0072b1] font-bold hover:underline">{activeAd.callToAction} →</span>
                </div>
              </div>
            </div>
          )}

          {/* Mockup Card: GOOGLE SEARCH SPONSORED TEXT AD */}
          {activeAd.platform === 'googleSearch' && (
            <div className="w-[340px] rounded-xl border border-[#1E293B] bg-slate-900/30 text-zinc-200 p-5 shadow-2xl relative animate-fade-in">
              <div className="flex items-center gap-1.5 mb-2 text-[10px] font-mono text-slate-500 border-b border-[#1E293B]/60 pb-1.5">
                <Search className="h-3 w-3" />
                <span>Google Search Engine Ad Mockup</span>
              </div>

              <div className="flex flex-col gap-1 select-none">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  https://www.google.com/search/ads?sponsored=true
                </span>
                
                <h4 className="text-xs font-bold text-[#8ab4f8] hover:underline cursor-help">
                  Ad · {activeAd.headline}
                </h4>

                <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                  <strong>Sustainable Choice:</strong> {activeAd.bodyText} Learn more by visiting our official launch channel: <u>{activeAd.callToAction}</u>.
                </p>
                
                <div className="flex gap-2.5 text-[9px] font-mono text-amber-400/80 mt-2">
                  <span>★ Highly Rated (4.9)</span>
                  <span>• Organic Audited</span>
                  <span>• Free Delivery</span>
                </div>
              </div>
            </div>
          )}

          <div className="absolute top-3 left-3 bg-editorial-dark text-editorial-bg px-2 py-0.5 text-[8px] font-mono">
            Render Platform: {activeAd.platform.toUpperCase()}
          </div>
        </div>

        {/* Share / Export Mockup bar */}
        <div className="bg-editorial-cream border border-editorial-dark p-4 rounded-none flex items-center justify-between gap-4">
          <span className="text-[11px] text-editorial-dark/60 font-mono">Mock Frame render perfectly. Ready to launch?</span>
          
          <button
            onClick={handleExportMockText}
            className="px-4 py-2 text-xs font-bold bg-editorial-dark text-editorial-bg hover:bg-editorial-accent hover:text-white rounded-none flex items-center gap-1.5 border border-editorial-dark transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> Save Campaign Brief (.TXT)
          </button>
        </div>

      </div>

      {/* 3. Right Property Grid: Ads Platform Switchers (Col-span-3) */}
      <div className="xl:col-span-3 flex flex-col gap-4 text-editorial-dark">
        
        {/* Ads Platform list */}
        <div className="border border-editorial-dark bg-editorial-cream p-5 rounded-none flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-editorial-dark">Generated Ad mockups:</span>
          
          <div className="flex flex-col gap-2">
            {ads.map(ad => {
              const isSelected = ad.id === activeAdId;
              return (
                <button
                  key={ad.id}
                  onClick={() => setActiveAdId(ad.id)}
                  className={`py-2.5 px-3 border text-left text-xs capitalize flex justify-between items-center transition cursor-pointer rounded-none ${
                    isSelected 
                      ? 'bg-editorial-dark text-editorial-bg border-editorial-dark' 
                      : 'bg-editorial-bg text-editorial-dark/60 border-editorial-dark/30 hover:border-editorial-dark'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Megaphone className={`h-3.5 w-3.5 ${isSelected ? 'text-editorial-accent' : 'text-editorial-dark/60'}`} />
                    <strong className="font-bold uppercase tracking-wider text-[11px]">{ad.platform} preview</strong>
                  </div>
                  {isSelected && <span className="h-1.5 w-1.5 bg-editorial-accent rounded-full" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Mock Details */}
        <div className="border border-editorial-dark bg-editorial-cream p-5 rounded-none text-xs flex flex-col gap-3">
          <span className="font-bold uppercase tracking-wider text-editorial-dark text-xs">Active Mock Properties:</span>
          
          <div className="flex flex-col gap-1 text-[11px]">
            <span className="font-bold uppercase tracking-wider text-[9px] text-editorial-dark/60">CTA Label:</span>
            <span className="text-editorial-dark font-sans">{activeAd.callToAction}</span>
          </div>
          <div className="flex flex-col gap-1 text-[11px]">
            <span className="font-bold uppercase tracking-wider text-[9px] text-editorial-dark/60">Suggested Visual Theme:</span>
            <span className="text-editorial-dark font-serif leading-relaxed text-[11px] italic">{activeAd.imageTheme}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
