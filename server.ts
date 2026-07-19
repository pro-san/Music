import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the GoogleGenAI SDK with environment key and AI Studio telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json({ limit: "10mb" }));

  // Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, roleType, modelMode } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      // Map model mode to appropriate Gemini model
      let selectedModel = "gemini-3.5-flash";
      if (modelMode === "fast") {
        selectedModel = "gemini-3.1-flash-lite";
      } else if (modelMode === "pro") {
        selectedModel = "gemini-3.1-pro-preview";
      }

      // System instruction customized based on chosen role
      let systemInstruction = "";
      if (roleType === "Maestro") {
        systemInstruction = `You are the 'Theory Maestro', a classical and jazz music theory professor.
Your role is to explain scales, chords, intervals, modal theory, Roman numeral analysis, and harmonic contexts with academic precision.
Be encouraging and clear. Always break down complex concepts into digestible terms.`;
      } else if (roleType === "Composer") {
        systemInstruction = `You are the 'Composer Coach', a creative songwriting mentor.
Your role is to offer evocative, creative composition tips, emotional chord textures, film-scoring ideas, voice leading concepts, and modal modulation hacks.
Help the user paint with sound and translate emotions to musical structures.`;
      } else {
        systemInstruction = `You are the 'Jam Buddy', a friendly, casual bandmate.
Your role is to give practical shortcuts for piano and guitar, simple blues licks, easy backing progression patterns, and real-world gigging advice.
Keep your tone casual, warm, and highly supportive.`;
      }

      // Append general structural instructions to drive the client visualization board
      systemInstruction += `

CRITICAL INSTRUCTION FOR MUSIC VISUALIZATION:
If the user asks to look up, visualize, or analyze a specific chord or scale (e.g. "What is C Dorian?", "Show me Gmaj9 chord", "Explain A harmonic minor"), you MUST append a special control command at the very end of your response so the app can update its interactive visualization board.
The command must strictly follow this exact single-line string format without spaces in the tag:
CMD_SELECT:{"type":"scale"|"chord","root":"ROOT_NOTE","name":"SCALE_OR_CHORD_NAME","notes":["N1","N2",...]}

Guidelines for the select command:
1. "type" must be either "scale" or "chord"
2. "root" must be a valid note name (e.g. "C", "F#", "Bb")
3. "name" is the formal name of the scale/chord (e.g. "Dorian", "Major 7th", "Harmonic Minor")
4. "notes" must be an array of all notes in the scale/chord in ascending order starting from the root note (e.g. ["C", "D", "Eb", "F", "G", "A", "Bb"] for C Dorian). Ensure flat notes use 'Db', 'Eb', 'Gb', 'Ab', 'Bb' and sharp notes use sharp names correctly.
`;

      // Build chat content using @google/genai SDK
      // Convert history list into contents structures
      const contents = history.map((item: any) => ({
        role: item.role === "user" ? "user" : "model",
        parts: [{ text: item.text }]
      }));

      // Call Gemini API
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7
        }
      });

      const fullText = response.text || "";

      // Parse output to check for CMD_SELECT: command
      let cleanText = fullText;
      let commandPayload = null;

      const cmdMatch = fullText.match(/CMD_SELECT:({\s*".*?"\s*:\s*.*?\s*})/);
      if (cmdMatch && cmdMatch[1]) {
        try {
          commandPayload = JSON.parse(cmdMatch[1]);
          // Strip the command line from the final text so the user sees a pristine chat message
          cleanText = fullText.replace(/CMD_SELECT:{\s*".*?"\s*:\s*.*?\s*}/, "").trim();
        } catch (e) {
          console.error("Failed to parse command payload:", e);
        }
      }

      res.json({
        text: cleanText,
        command: commandPayload
      });
    } catch (error: any) {
      console.error("Error in /api/chat:", error);
      res.status(500).json({ error: error.message || "Failed to query Gemini model." });
    }
  });

  // Image Generation Endpoint (using gemini-3-pro-image-preview with 1K/2K/4K resolution)
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, size, aspectRatio } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
      }

      const validSizes = ["1K", "2K", "4K"];
      const finalSize = validSizes.includes(size) ? size : "1K";

      const validAspects = ["1:1", "16:9", "4:3"];
      const finalAspect = validAspects.includes(aspectRatio) ? aspectRatio : "1:1";

      // Try generating using user requested gemini-3-pro-image-preview
      // Fallback cleanly to gemini-3.1-flash-image if unavailable
      let imgBase64 = "";
      try {
        const imageResponse = await ai.models.generateContent({
          model: "gemini-3-pro-image-preview",
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            imageConfig: {
              aspectRatio: finalAspect,
              imageSize: finalSize
            }
          }
        });

        const parts = imageResponse.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            imgBase64 = part.inlineData.data;
            break;
          }
        }
      } catch (innerError) {
        console.warn("gemini-3-pro-image-preview failed, attempting gemini-3.1-flash-image fallback...", innerError);
        const backupResponse = await ai.models.generateContent({
          model: "gemini-3.1-flash-image",
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            imageConfig: {
              aspectRatio: finalAspect,
              imageSize: finalSize
            }
          }
        });

        const backupParts = backupResponse.candidates?.[0]?.content?.parts || [];
        for (const part of backupParts) {
          if (part.inlineData?.data) {
            imgBase64 = part.inlineData.data;
            break;
          }
        }
      }

      if (!imgBase64) {
        throw new Error("Could not extract any binary image data from Gemini.");
      }

      res.json({
        url: `data:image/png;base64,${imgBase64}`
      });
    } catch (error: any) {
      console.error("Error in /api/generate-image:", error);
      res.status(500).json({ error: error.message || "Failed to generate visual art." });
    }
  });

  // Vite dev server vs Production static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
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
    console.log(`Express full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
