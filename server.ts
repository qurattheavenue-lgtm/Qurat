import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initializer for Gemini client to prevent startup issues
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (aiClient) return aiClient;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in your settings. Please configure it in your Secrets menu.");
  }
  
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
  return aiClient;
}

// ==================== API ENDPOINTS ====================

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    currentTime: new Date().toISOString(),
    hasApiKey: !!process.env.GEMINI_API_KEY 
  });
});

// 1. AI Image Explainer: Describes image or suggests edits based on uploaded payload
app.post("/api/gemini/image-explain", async (req, res) => {
  try {
    const { imageBase64, mimeType, prompt } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "No image payload supplied." });
    }

    const ai = getGeminiClient();
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/png",
        data: cleanBase64,
      },
    };
    
    const textPart = {
      text: prompt || "Analyze this image and describe its core visual elements, layout, style, and suggest 3 creative editing transitions or filters to enhance it.",
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
    });

    res.json({ result: response.text });
  } catch (err: any) {
    console.error("Gemini Image Explainer Error:", err);
    res.status(500).json({ error: err.message || "Failed to process image with Gemini." });
  }
});

// 2. AI Video Storyboard & Script Generator
app.post("/api/gemini/video-script", async (req, res) => {
  try {
    const { topic, duration, sceneCount } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "No video concept topic provided." });
    }

    const ai = getGeminiClient();
    const systemPrompt = `You are a high-impact advertising and media scriptwriter. Generate a scene-by-scene video storyboard. Return your response as a valid JSON object. Do not include markdown code block syntax around the JSON, respond purely with the raw JSON text content.`;
    
    const userPrompt = `Create a storyboard for a video about "${topic}". The target length is around ${duration || 15} seconds spread over ${sceneCount || 3} dynamic slides.
    Structure the response with following JSON schema:
    {
      "title": "A short engaging video title",
      "scenes": [
        {
          "sceneNumber": 1,
          "suggestionBg": "Descriptive aesthetic prompt for a background image (e.g. 'Neon lit cybercafe, deep blues and glowing cyan grid')",
          "textOverlay": "Strong short text on screen (max 10 words)",
          "slideDuration": 5,
          "suggestedTransition": "fade / zoom / slide",
          "creativeDirection": "Direct advice for the movement or pan"
        }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    res.json({ script: JSON.parse(response.text || "{}") });
  } catch (err: any) {
    console.error("Gemini Video Script Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate video script with Gemini." });
  }
});

// 3. AI Text Copilot (Correction, expansion, tone helper)
app.post("/api/gemini/text-copilot", async (req, res) => {
  try {
    const { text, action, tone, customPrompt } = req.body;
    if (!text && !customPrompt) {
      return res.status(400).json({ error: "No query content supplied." });
    }

    const ai = getGeminiClient();
    let prompt = "";
    
    if (action === "rewrite") {
      prompt = `Rewrite the following text in a very distinctive, high-vibe "${tone || "professional"}" tone:\n\n"${text}"`;
    } else if (action === "expand") {
      prompt = `Flesh out and expand the following draft. Add rich descriptions, structures, and professional hierarchy while staying natural:\n\n"${text}"`;
    } else if (action === "summarize") {
      prompt = `Condense the following text into 3 clear, highly scannable, impact-driven bullet points:\n\n"${text}"`;
    } else {
      prompt = customPrompt ? `${customPrompt}\nReference Text: "${text || ""}"` : `Improve this writing:\n\n"${text}"`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ result: response.text });
  } catch (err: any) {
    console.error("Gemini Text Copilot Error:", err);
    res.status(500).json({ error: err.message || "Failed to process text command with Gemini." });
  }
});

// 4. AI Document Layout Generator
app.post("/api/gemini/layout-generate", async (req, res) => {
  try {
    const { brandDescription, layoutType } = req.body;
    if (!brandDescription) {
      return res.status(400).json({ error: "Provide a brand description for the layout." });
    }

    const ai = getGeminiClient();
    const systemPrompt = `You are a web layout designer. Return a configuration for building a publishing template. Output MUST be valid raw JSON only, no markdown markers.`;

    const userPrompt = `Create an layout blueprint configuration for a "${layoutType || "brochure"}" regarding this brand concept: "${brandDescription}".
    Structure your response matching this exact JSON schema:
    {
      "backgroundStyle": "Tailwind color class or gradient (e.g. 'bg-gradient-to-tr from-slate-900 via-slate-950 to-indigo-950')",
      "blocks": [
        {
          "type": "header / subheader / paragraph / button / shape",
          "x": 0 to 100 positioning x percent,
          "y": 0 to 100 positioning y percent,
          "w": block width percent (e.g. 80),
          "h": estimated height pixel height (e.g. 100),
          "content": "Specific placeholder text aligned to marketing goals of the brand",
          "align": "left / center / right",
          "style": {
            "color": "Tailwind text color or custom hex",
            "backgroundColor": "Tailwind bg color or custom hex (transparent if unneeded)",
            "borderRadius": "rounded-none / rounded-lg / rounded-full",
            "borderColor": "border-slate-800 or similar",
            "borderWidth": "border-0 or border-2",
            "fontSize": "text-2xl / text-base / text-sm",
            "fontWeight": "font-bold / font-medium / font-normal",
            "padding": "p-2 / p-4 / p-6",
            "shadow": "shadow-sm / shadow-lg / shadow-none"
          }
        }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    res.json({ layout: JSON.parse(response.text || "{}") });
  } catch (err: any) {
    console.error("Gemini Layout Design Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate visual layout with Gemini." });
  }
});

// 5. AI Campaign Copywrite and Slogans
app.post("/api/gemini/campaign-copy", async (req, res) => {
  try {
    const { brandName, productDescription, primaryTarget, customKeywords } = req.body;
    if (!brandName || !productDescription) {
      return res.status(400).json({ error: "Brand details are required to spin copy." });
    }

    const ai = getGeminiClient();
    const systemPrompt = `You are an expert copywriter on Madison Avenue. Create highly engaging, Conversion-Rate-Optimized (CRO) social media and search advertisements. Return raw JSON without any markdown code backticks.`;

    const userPrompt = `Write creative display ads for a company named "${brandName}" making "${productDescription}". Target audience is "${primaryTarget || "general consumers"}". Additional keywords/guidelines: "${customKeywords || "none"}".
    You must output a JSON array of 4 unique ad campaigns, targeting these platforms: Instagram/Facebook feed, Google Search text display, LinkedIn professional slide, Tik Tok short dynamic text.
    Return matching this schema:
    [
      {
        "platform": "facebook / instagram / googleSearch / linkedin / tiktok",
        "headline": "Punchy capital-driven headline or hook line (max 60 chars)",
        "bodyText": "Persuasive ad copy detailing a call to value with relevant emojis. Max 2 short paragraphs.",
        "imageTheme": "Vibe prompt describing a graphic style (e.g. 'Clean layout with bold editorial serif text, warm retro backlighting')",
        "callToAction": "Shop Now / Sign Up / Learn More / Download"
      }
    ]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    res.json({ ads: JSON.parse(response.text || "[]") });
  } catch (err: any) {
    console.error("Gemini Campaign Generator Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate ad copy with Gemini." });
  }
});

// ==================== FULL-STACK BOOT & SERVING ====================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Creative Suite server successfully running on port http://0.0.0.0:${PORT}`);
  });
}

startServer();
