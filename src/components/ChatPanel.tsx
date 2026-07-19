import React, { useState, useRef, useEffect } from "react";
import { NoteName, ChatMessage } from "../types";
import { Send, Music, Sparkles, User, BrainCircuit, MessageSquare, ShieldAlert, Zap, Award } from "lucide-react";

interface ChatPanelProps {
  onSelectMusic: (type: "scale" | "chord", root: NoteName, name: string) => void;
}

type RoleType = "Maestro" | "Composer" | "JamBuddy";

const SYSTEM_ROLES: Record<RoleType, { title: string; subtitle: string; desc: string; icon: string }> = {
  Maestro: {
    title: "Theory Maestro",
    subtitle: "Classic Music Professor",
    desc: "Rigorous, educational, breaks down intervals, semitones, Roman numeral analysis, and historic context.",
    icon: "🎓"
  },
  Composer: {
    title: "Composer Coach",
    subtitle: "Songwriting Mentor",
    desc: "Focuses on emotional textures, modulation, voice leading, and creative ideas for cinematic/modern compositions.",
    icon: "✨"
  },
  JamBuddy: {
    title: "Jam Buddy",
    subtitle: "Casual Bandmate",
    desc: "Provides quick backing tracks ideas, easy fretboard shortcuts, bluesy jams, and practical guitar/piano tricks.",
    icon: "🎸"
  }
};

const SUGGESTIONS = [
  "Explain C Mixolydian and show its notes",
  "How do I play an F# Minor 9 chord?",
  "Suggest a chord progression in D Minor",
  "Explain the difference between Dorian and Aeolian"
];

export const ChatPanel: React.FC<ChatPanelProps> = ({ onSelectMusic }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [role, setRole] = useState<RoleType>("Maestro");
  const [modelMode, setModelMode] = useState<"fast" | "balanced" | "pro">("balanced");
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial welcome message from the selected role
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "model",
          text: getWelcomeMessage(role),
          timestamp: new Date().toLocaleTimeString(),
          modelUsed: getModelName(modelMode)
        }
      ]);
    }
  }, [role]);

  function getWelcomeMessage(r: RoleType): string {
    switch (r) {
      case "Maestro":
        return "Greetings, student of the musical arts! I am your Theory Maestro. I can guide you through the intricacies of scales, chords, modal geometry, and harmonic relationships. What shall we analyze today? (e.g. ask me to 'Show me the C Dorian scale' to view it!)";
      case "Composer":
        return "Hey there! I'm your Songwriting Coach. Let's paint with sound. Tell me what emotional landscape you are trying to capture, and I'll suggest scales, complex chords, or modulations to inspire your next piece.";
      case "JamBuddy":
        return "Yo! Ready to jam? I'm your bandmate. Ask me for some sweet chord shapes, quick scales to solo over a track, or handy fretboard hacks. Let's make some music!";
    }
  }

  function getModelName(mode: "fast" | "balanced" | "pro"): string {
    switch (mode) {
      case "fast":
        return "gemini-3.1-flash-lite";
      case "balanced":
        return "gemini-3.5-flash";
      case "pro":
        return "gemini-3.1-pro-preview";
    }
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsSending(true);

    // Placeholder pending model response
    const tempModelId = Math.random().toString();
    const modelMsgPlaceholder: ChatMessage = {
      id: tempModelId,
      role: "model",
      text: "",
      timestamp: new Date().toLocaleTimeString(),
      isPending: true,
      modelUsed: getModelName(modelMode)
    };
    setMessages((prev) => [...prev, modelMsgPlaceholder]);

    try {
      // Build conversation history (only text prompts for multi-turn)
      const chatHistory = messages
        .filter((m) => m.id !== "welcome" && !m.isPending)
        .map((m) => ({
          role: m.role === "user" ? ("user" as const) : ("model" as const),
          text: m.text
        }));

      // Append user's new message
      chatHistory.push({ role: "user", text: text });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: chatHistory,
          roleType: role,
          modelMode: modelMode
        })
      });

      if (!response.ok) {
        throw new Error("Failed to connect to AI server");
      }

      const data = await response.json();

      // Update message placeholder with real content
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === tempModelId) {
            return {
              ...m,
              text: data.text || "I was unable to formulate a response.",
              isPending: false,
              command: data.command
            };
          }
          return m;
        })
      );

      // Execute music scale/chord switch command if returned!
      if (data.command) {
        onSelectMusic(data.command.type, data.command.root, data.command.name);
      }
    } catch (e: any) {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === tempModelId) {
            return {
              ...m,
              text: "Apologies, the connection to the music model was interrupted. Please ensure secrets are configured.",
              isPending: false
            };
          }
          return m;
        })
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-[650px]" id="chat-section">
      {/* Header controls */}
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-lg">AI Music Assistant</h3>
              <p className="text-xs text-slate-400">Multi-turn musical assistant with specific AI coaching roles.</p>
            </div>
          </div>

          {/* Model toggle */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setModelMode("fast")}
              title="Fast Mode: gemini-3.1-flash-lite"
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition flex items-center gap-1 ${
                modelMode === "fast" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Zap className="w-3 h-3" />
              Fast
            </button>
            <button
              onClick={() => setModelMode("balanced")}
              title="Balanced Mode: gemini-3.5-flash"
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition flex items-center gap-1 ${
                modelMode === "balanced" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BrainCircuit className="w-3 h-3" />
              Balanced
            </button>
            <button
              onClick={() => setModelMode("pro")}
              title="Pro Mode: gemini-3.1-pro-preview"
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition flex items-center gap-1 ${
                modelMode === "pro" ? "bg-purple-500 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Award className="w-3 h-3" />
              Pro
            </button>
          </div>
        </div>

        {/* Role Config buttons */}
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(SYSTEM_ROLES) as RoleType[]).map((rKey) => {
            const active = role === rKey;
            const rInfo = SYSTEM_ROLES[rKey];
            return (
              <button
                key={rKey}
                onClick={() => {
                  if (isSending) return;
                  setRole(rKey);
                  setMessages([]); // clear to reload welcome
                }}
                className={`p-2 rounded-xl text-left border transition-all ${
                  active
                    ? "bg-indigo-500/10 border-indigo-500 text-indigo-200"
                    : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span>{rInfo.icon}</span>
                  <span>{rInfo.title}</span>
                </div>
                <div className="text-[9px] text-slate-500 font-medium truncate mt-0.5">{rInfo.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-md flex flex-col gap-1 ${
                  isUser
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none"
                }`}
              >
                {/* Meta header */}
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 border-b border-slate-800/40 pb-1.5 mb-1.5">
                  <span className="flex items-center gap-1">
                    {isUser ? <User className="w-3 h-3 text-indigo-300" /> : <Sparkles className="w-3 h-3 text-pink-400" />}
                    {isUser ? "You" : SYSTEM_ROLES[role].title}
                  </span>
                  <span>{m.timestamp}</span>
                </div>

                {/* Text Content */}
                {m.isPending ? (
                  <div className="flex items-center gap-2 py-1 text-xs text-slate-400">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="ml-1 text-[10px]">Tuning frequencies...</span>
                  </div>
                ) : (
                  <div className="text-xs leading-relaxed break-words whitespace-pre-wrap">
                    {m.text}
                  </div>
                )}

                {/* Command Feedback */}
                {!isUser && m.command && (
                  <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] text-emerald-300">
                      <Music className="w-3.5 h-3.5" />
                      <span>Loaded: <b>{m.command.root} {m.command.name}</b></span>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase">
                      Visualized
                    </span>
                  </div>
                )}

                {/* Model tag */}
                {!isUser && m.modelUsed && (
                  <span className="text-[8px] font-mono text-slate-600 uppercase tracking-wider mt-1.5 self-end">
                    Powered by {m.modelUsed}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion tags */}
      {messages.length <= 1 && (
        <div className="flex flex-col gap-1.5 mb-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Try asking:</span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSendMessage(s)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 rounded-lg text-[10px] font-medium transition text-left"
              >
                "{s}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={`Ask the ${SYSTEM_ROLES[role].title}...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage(inputText);
          }}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-xs placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition"
          id="chat-input"
        />
        <button
          onClick={() => handleSendMessage(inputText)}
          disabled={!inputText.trim() || isSending}
          className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl transition shadow-md"
          id="chat-send-button"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
