import React, { useState, useEffect } from "react";
import { NoteName, GeneratedImage } from "../types";
import { Sparkles, Image as ImageIcon, Download, Share2, Compass, Loader2 } from "lucide-react";

interface VisualComposerProps {
  rootNote: NoteName;
  name: string;
  type: "scale" | "chord";
}

const STYLE_PRESETS = [
  { name: "Celestial Synthwave", prompt: "highly detailed neon synthwave, cosmic nebulae, star constellations, glowing geometric lines, futuristic dreamscape, dark space background, vibrant pink and cyan neon" },
  { name: "Classical Watercolor", prompt: "elegant abstract watercolor painting, light wash, subtle musical notes flowing like wind, gold foil textures, creamy paper background, muted earthy tones" },
  { name: "Psychedelic Ambient", prompt: "psychedelic oil-marbling art, swirling iridescent color gradients, fluid dynamics, organic liquid textures, dreamlike abstract, rich purple and gold" },
  { name: "Cyberpunk Tech", prompt: "industrial cyberpunk circuit-board layout, digital audio waveforms, glowing fiber optic lines, dark chrome metal texture, teal and amber indicators" }
];

export const VisualComposer: React.FC<VisualComposerProps> = ({
  rootNote,
  name,
  type
}) => {
  const [artPrompt, setArtPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(STYLE_PRESETS[0].name);
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "4:3">("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [activeImage, setActiveImage] = useState<GeneratedImage | null>(null);
  const [loadingText, setLoadingText] = useState("Initializing canvases...");

  useEffect(() => {
    // Load image history from localStorage
    const saved = localStorage.getItem("music_art_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
        if (parsed.length > 0) {
          setActiveImage(parsed[0]);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveToHistory = (newImg: GeneratedImage) => {
    const updated = [newImg, ...history].slice(0, 8); // limit to 8
    setHistory(updated);
    setActiveImage(newImg);
    localStorage.setItem("music_art_history", JSON.stringify(updated));
  };

  const generateDefaultPrompt = () => {
    const preset = STYLE_PRESETS.find((s) => s.name === selectedStyle);
    const styleDescription = preset ? preset.prompt : "abstract modern art";
    return `An abstract representation of the emotional and musical vibe of the ${rootNote} ${name} ${type}. Style: ${styleDescription}. Incorporate visual elements of soundwaves, elegant geometry, and deep musical mood.`;
  };

  // Fun loading screen cycling texts
  useEffect(() => {
    if (!isGenerating) return;
    const texts = [
      "Synthesizing visual frequencies...",
      "Converting soundwaves to pigment...",
      "Tuning pixel oscillators...",
      "Mapping chord notes to color vectors...",
      "Generating AI canvas layers...",
      "Composing final high-resolution details..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 2500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    const finalPrompt = artPrompt.trim() || generateDefaultPrompt();

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          size: imageSize,
          aspectRatio: aspectRatio
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: "Failed to connect to image generation endpoint" }));
        throw new Error(errData.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error("No image URL returned from server");
      }

      const newImg: GeneratedImage = {
        url: data.url,
        prompt: finalPrompt,
        size: imageSize,
        timestamp: new Date().toLocaleTimeString(),
        mood: `${rootNote} ${name} ${selectedStyle}`
      };

      saveToHistory(newImg);
    } catch (e: any) {
      setError(e.message || "Something went wrong during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl" id="visual-composer-section">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
          <ImageIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-100 text-lg">Music-to-Art Album Creator</h3>
          <p className="text-xs text-slate-400">Visualize the emotional color of scales & chords using High-Quality Gemini Image Generation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls Column */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-950/50 p-4 border border-slate-800/80 rounded-xl flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Select Artistic Style</h4>
            <div className="grid grid-cols-2 gap-2">
              {STYLE_PRESETS.map((style) => (
                <button
                  key={style.name}
                  onClick={() => setSelectedStyle(style.name)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg text-left border transition ${
                    selectedStyle === style.name
                      ? "bg-pink-500/10 text-pink-300 border-pink-500/50"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950/50 p-4 border border-slate-800/80 rounded-xl flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Configure Output</h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Size Select (1K, 2K, 4K) */}
              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1.5">Resolution (affordance)</label>
                <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
                  {(["1K", "2K", "4K"] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setImageSize(sz)}
                      className={`flex-1 py-1 text-xs font-bold rounded transition ${
                        imageSize === sz
                          ? "bg-pink-500 text-white"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1.5">Aspect Ratio</label>
                <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
                  {(["1:1", "16:9", "4:3"] as const).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`flex-1 py-1 text-[11px] font-bold rounded transition ${
                        aspectRatio === ratio
                          ? "bg-pink-500 text-white"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              3. Customize prompt (Optional)
            </label>
            <textarea
              placeholder={`Leave blank to auto-generate from scale/chord: "An abstract representation of ${rootNote} ${name}..."`}
              value={artPrompt}
              onChange={(e) => setArtPrompt(e.target.value)}
              className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-xs placeholder:text-slate-600 outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 transition resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-pink-500/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {loadingText}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate {imageSize} Music Artwork
              </>
            )}
          </button>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-medium">
              Error: {error}
            </div>
          )}
        </div>

        {/* Display Canvas Column */}
        <div className="flex flex-col items-center justify-center bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 min-h-[350px]">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <div className="relative flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
                <Sparkles className="absolute w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-slate-200 animate-pulse">{loadingText}</p>
              <p className="text-xs text-slate-500">Generating premium {imageSize} resolution render...</p>
            </div>
          ) : activeImage ? (
            <div className="w-full flex flex-col gap-4">
              {/* Vinyl / Cover frame */}
              <div className="relative group overflow-hidden border border-slate-800 rounded-xl shadow-2xl mx-auto max-w-sm aspect-square bg-slate-900 w-full">
                <img
                  src={activeImage.url}
                  alt={activeImage.prompt}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-between p-4">
                  <span className="self-end bg-pink-500 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    {activeImage.size} Resolving
                  </span>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-200 font-mono font-medium truncate max-w-[200px]">
                      {activeImage.mood || "Custom composition"}
                    </span>
                    <a
                      href={activeImage.url}
                      download={`music-theory-art-${imageSize}.png`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-lg transition"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Display prompt details */}
              <div className="bg-slate-950 p-3.5 border border-slate-800 rounded-xl">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Prompt used</span>
                <p className="text-[11px] text-slate-300 italic line-clamp-2 leading-relaxed">
                  "{activeImage.prompt}"
                </p>
              </div>

              {/* History Ring */}
              {history.length > 1 && (
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Previous Artworks</span>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
                    {history.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(img)}
                        className={`relative w-12 h-12 rounded-lg border overflow-hidden flex-shrink-0 transition-all ${
                          activeImage.url === img.url
                            ? "border-pink-500 scale-105"
                            : "border-slate-800 hover:border-slate-600"
                        }`}
                      >
                        <img src={img.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Thumbnail" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 flex flex-col items-center gap-3">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
                <ImageIcon className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-300">No artwork created yet</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">Select a style and trigger the visual engine to compose your scale's visual aura!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
