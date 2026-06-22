export type AppTab = 'image' | 'video' | 'text' | 'publish' | 'campaign';

export interface AppNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
}

// 1. Image Editor Types
export interface ImageProject {
  id: string;
  name: string;
  imageUrl: string | null;
  drawings: string | null; // serialized SVG paths or image data URL of brush layers
  filters: {
    brightness: number;  // 50 - 150
    contrast: number;    // 50 - 150
    grayscale: number;   // 0 - 100
    sepia: number;       // 0 - 100
    invert: number;      // 0 - 100
    blur: number;        // 0 - 20
    saturate: number;    // 50 - 200
  };
  texts: ImageTextOverlay[];
  updatedAt: number;
}

export interface ImageTextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  font: string;
}

// 2. Video Builder Types
export interface VideoProject {
  id: string;
  name: string;
  slides: VideoSlide[];
  audioTrack: {
    name: string;
    url: string; // preset loop name or custom uploaded file data
    isPlaying: boolean;
  } | null;
  updatedAt: number;
}

export interface VideoSlide {
  id: string;
  bgImageUrl: string | null; // uploaded or preset aesthetic gradient/image
  bgColor: string; // fallback matching visual layout
  textOverlay: string;
  textPosition: 'top' | 'center' | 'bottom';
  duration: number; // in seconds (1 - 10)
  transitionEffect: 'none' | 'fade' | 'slide' | 'zoom' | 'blur';
  panZoomEffect: 'none' | 'zoom-in' | 'pan-left' | 'pan-right';
}

// 3. Rich Text Editing Types
export interface TextDocument {
  id: string;
  title: string;
  content: string; // markdown or raw format
  createdAt: number;
  updatedAt: number;
}

// 4. Publishing & Layout Grid Types
export interface PublishingProject {
  id: string;
  name: string;
  blocks: LayoutBlock[];
  layoutType: 'bento' | 'brochure' | 'flyer' | 'editorial';
  backgroundStyle: string; // bg color or gradient classes
  width: number; // virtual coordinate max width (e.g., 800)
  height: number; // virtual coordinate max height (e.g., 1000)
  updatedAt: number;
}

export interface LayoutBlock {
  id: string;
  type: 'header' | 'subheader' | 'paragraph' | 'image' | 'button' | 'shape';
  x: number; // percent or pixel coordinate
  y: number;
  w: number; // width percentage (10 - 100)
  h: number; // estimated height
  content: string; // text, SVG route, or custom image payload
  align?: 'left' | 'center' | 'right';
  style: {
    color: string;
    backgroundColor: string;
    borderRadius: string;
    borderColor: string;
    borderWidth: string;
    fontSize: string;
    fontWeight: string;
    padding: string;
    shadow: string;
  };
}

// 5. Advertising Campaign Types
export interface CampaignBrief {
  brandName: string;
  productDescription: string;
  primaryTarget: string;
  primaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  adPlatforms: {
    facebook: boolean;
    instagram: boolean;
    googleSearch: boolean;
    linkedin: boolean;
    tiktok: boolean;
  };
  customKeywords: string;
}

export interface GeneratedAd {
  id: string;
  platform: 'facebook' | 'instagram' | 'googleSearch' | 'linkedin' | 'tiktok';
  headline: string;
  bodyText: string;
  imageTheme: string;
  callToAction: string;
}
