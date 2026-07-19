import { useState, useEffect } from "react";
import { NoteName, MusicState } from "./types";
import { CHROMATIC_NOTES, audioEngine } from "./components/AudioEngine";
import { PianoKeyboard } from "./components/PianoKeyboard";
import { GuitarFretboard } from "./components/GuitarFretboard";
import { CircleOfFifths } from "./components/CircleOfFifths";
import { StaffNotation } from "./components/StaffNotation";
import { VisualComposer } from "./components/VisualComposer";
import { ChatPanel } from "./components/ChatPanel";
import { Metronome } from "./components/Metronome";
import { computeMusicState, SCALES, CHORDS } from "./lib/musicEngine";
import { Music, Play, Volume2, Sparkles, BookOpen, Layers } from "lucide-react";

const SHARP_CHROMATIC: NoteName[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_CHROMATIC: NoteName[] = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const transposeRoot = (currentRoot: NoteName, direction: "up" | "down"): NoteName => {
  const flats = ["Db", "Eb", "Gb", "Ab", "Bb"];
  const isFlat = flats.includes(currentRoot);
  const scale = isFlat ? FLAT_CHROMATIC : SHARP_CHROMATIC;
  
  let index = scale.indexOf(currentRoot);
  if (index === -1) {
    const otherScale = isFlat ? SHARP_CHROMATIC : FLAT_CHROMATIC;
    index = otherScale.indexOf(currentRoot);
    if (index === -1) {
      return currentRoot;
    }
  }
  
  const offset = direction === "up" ? 1 : -1;
  const newIndex = (index + offset + 12) % 12;
  return scale[newIndex];
};

export default function App() {
  const [root, setRoot] = useState<NoteName>("C");
  const [type, setType] = useState<"scale" | "chord">("scale");
  const [scaleName, setScaleName] = useState(SCALES[0].name);
  const [chordName, setChordName] = useState(CHORDS[0].name);
  const [pillDisplayMode, setPillDisplayMode] = useState<"notes" | "intervals">("notes");

  const handleTranspose = (direction: "up" | "down") => {
    setRoot((current) => transposeRoot(current, direction));
  };

  // Derive music state
  const [musicState, setMusicState] = useState<MusicState>(
    computeMusicState("scale", "C", SCALES[0].name)
  );

  // Update music state when selections change
  useEffect(() => {
    const activeName = type === "scale" ? scaleName : chordName;
    const newState = computeMusicState(type, root, activeName);
    setMusicState(newState);
  }, [root, type, scaleName, chordName]);

  // Handle updates coming directly from the Gemini Chatbot!
  const handleSelectMusicFromChat = (newType: "scale" | "chord", newRoot: NoteName, newName: string) => {
    setType(newType);
    setRoot(newRoot);
    if (newType === "scale") {
      // Find matching scale or use exact
      const matched = SCALES.find((s) => s.name.toLowerCase().includes(newName.toLowerCase()));
      setScaleName(matched ? matched.name : newName);
    } else {
      const matched = CHORDS.find((c) => c.name.toLowerCase().includes(newName.toLowerCase()) || c.abbreviation.toLowerCase() === newName.toLowerCase());
      setChordName(matched ? matched.name : newName);
    }
  };

  const playSound = () => {
    if (musicState.type === "scale") {
      audioEngine.playArpeggio(musicState.notes, 4, 0.25);
    } else {
      audioEngine.playChord(musicState.notes, 4, 1.2);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="app-root">
      {/* Visual Navigation Header */}
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 py-4 px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Music className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Music Theory Scale & Chord Visualizer
            </h1>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
              <span>Interactive playground & educational laboratory</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span className="text-indigo-400 flex items-center gap-0.5 font-semibold">
                <Sparkles className="w-3 h-3" /> Gemini AI Augmented
              </span>
            </p>
          </div>
        </div>

        {/* Rapid manual selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Root Note select & Transpose */}
          <div className="flex flex-col gap-1 flex-1 sm:flex-initial">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-1">Root</span>
            <div className="flex items-center gap-1.5">
              <select
                value={root}
                onChange={(e) => setRoot(e.target.value as NoteName)}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-indigo-500 transition cursor-pointer min-w-[70px]"
                id="select-root-note"
              >
                {CHROMATIC_NOTES.map((note) => (
                  <option key={note} value={note}>
                    {note}
                  </option>
                ))}
              </select>
              <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
                <button
                  onClick={() => handleTranspose("down")}
                  className="px-2 py-1 bg-slate-950/80 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition text-[10px] font-bold active:scale-95"
                  title="Transpose Down (-1/2 step)"
                  id="btn-transpose-down"
                >
                  -½
                </button>
                <button
                  onClick={() => handleTranspose("up")}
                  className="px-2 py-1 bg-slate-950/80 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition text-[10px] font-bold active:scale-95"
                  title="Transpose Up (+1/2 step)"
                  id="btn-transpose-up"
                >
                  +½
                </button>
              </div>
            </div>
          </div>

          {/* Type selection: Scale vs Chord */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-1">Type</span>
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setType("scale")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  type === "scale" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
                id="type-scale-button"
              >
                Scale
              </button>
              <button
                onClick={() => setType("chord")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  type === "chord" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
                id="type-chord-button"
              >
                Chord
              </button>
            </div>
          </div>

          {/* Subtype Definition selection */}
          <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-1">
              {type === "scale" ? "Scale Definition" : "Chord Definition"}
            </span>
            {type === "scale" ? (
              <select
                value={scaleName}
                onChange={(e) => setScaleName(e.target.value)}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-indigo-500 transition cursor-pointer"
                id="select-scale"
              >
                {SCALES.map((scale) => (
                  <option key={scale.name} value={scale.name}>
                    {scale.name}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={chordName}
                onChange={(e) => setChordName(e.target.value)}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-indigo-500 transition cursor-pointer"
                id="select-chord"
              >
                {CHORDS.map((chord) => (
                  <option key={chord.name} value={chord.name}>
                    {chord.name} ({chord.abbreviation})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Master trigger play audio */}
          <div className="flex flex-col gap-1 pt-4 self-stretch justify-end">
            <button
              onClick={playSound}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md active:scale-95"
              id="master-play-audio-button"
            >
              <Volume2 className="w-4 h-4" />
              Hear Sound
            </button>
          </div>
        </div>
      </header>

      {/* Main Bento Grid layout */}
      <main className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        {/* LEFT COLUMN: Visual interactive widgets (8/12 widths) */}
        <section className="xl:col-span-8 flex flex-col gap-6" id="widgets-container">
          {/* Active summary card */}
          <div className="bg-gradient-to-r from-indigo-950/30 via-slate-900 to-slate-900 border border-indigo-500/15 rounded-2xl p-5 shadow-lg flex flex-col lg:flex-row gap-5 justify-between items-start lg:items-center">
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-indigo-400 uppercase">
                  Active Selection
                </span>
                <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2 mt-1 leading-none">
                  {musicState.root} {musicState.name}
                </h2>
                <p className="text-xs text-slate-400 mt-2 max-w-xl italic leading-relaxed">
                  "{musicState.description || "Interactive acoustic visual representation"}"
                </p>
              </div>

              {/* Setting Toggle for Note Pills */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">Note Pills:</span>
                <div className="flex bg-slate-950 border border-slate-800/80 rounded-lg p-0.5">
                  <button
                    onClick={() => setPillDisplayMode("notes")}
                    className={`px-2 py-1 text-[9px] font-bold rounded-md transition ${
                      pillDisplayMode === "notes"
                        ? "bg-indigo-500 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                    id="toggle-pills-notes"
                  >
                    Note Names
                  </button>
                  <button
                    onClick={() => setPillDisplayMode("intervals")}
                    className={`px-2 py-1 text-[9px] font-bold rounded-md transition ${
                      pillDisplayMode === "intervals"
                        ? "bg-indigo-500 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                    id="toggle-pills-intervals"
                  >
                    Interval Degrees
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {musicState.notes.map((note, idx) => (
                <div
                  key={note + idx}
                  onClick={() => audioEngine.playNote(note, 4, 1.0)}
                  className={`px-3.5 py-1.5 rounded-xl border font-mono text-xs font-bold flex flex-col items-center cursor-pointer transition active:scale-90 hover:-translate-y-0.5 ${
                    note === musicState.root
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                      : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                  id={`note-pill-${note}-${idx}`}
                >
                  <span>{pillDisplayMode === "notes" ? note : musicState.intervals[idx]}</span>
                  <span className="text-[9px] text-slate-500 font-normal mt-0.5">
                    {pillDisplayMode === "notes" ? musicState.intervals[idx] : note}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Piano keyboard */}
          <PianoKeyboard
            activeNotes={musicState.notes}
            rootNote={musicState.root}
            type={musicState.type}
          />

          {/* Interactive Guitar fretboard */}
          <GuitarFretboard
            activeNotes={musicState.notes}
            rootNote={musicState.root}
            type={musicState.type}
          />

          {/* Split row: Circle of Fifths & Treble Staff */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CircleOfFifths
              rootNote={musicState.root}
              activeNotes={musicState.notes}
              onSelectRoot={setRoot}
            />

            <StaffNotation
              activeNotes={musicState.notes}
              rootNote={musicState.root}
              type={musicState.type}
            />
          </div>

          {/* Premium AI Image mood composer */}
          <VisualComposer
            rootNote={musicState.root}
            name={musicState.name}
            type={musicState.type}
          />
        </section>

        {/* RIGHT COLUMN: AI Companion Chat (4/12 widths) */}
        <section className="xl:col-span-4 flex flex-col gap-6" id="chat-container">
          <ChatPanel onSelectMusic={handleSelectMusicFromChat} />

          {/* Practice Metronome */}
          <Metronome />

          {/* Quick instructions / Legend Card */}
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Layers className="w-4 h-4 text-indigo-400" />
              Study & Play Guide
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">1.</span>
                <span>Click **Piano keys** or **Guitar frets** directly to audition individual pitches.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">2.</span>
                <span>Click the **Circle of Fifths** to change the key signature / root note instantly.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">3.</span>
                <span>Use the **Practice Metronome** to maintain a steady tempo while practicing the selected structure.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">4.</span>
                <span>Ask the **AI Music Assistant** to explain complex chord voicing, modes, or scales.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">5.</span>
                <span>Trigger the **Art Generator** to see how modern AI models interpret the color and atmosphere of your key signature.</span>
              </li>
            </ul>
          </div>
        </section>
      </main>

      {/* HumbleFooter */}
      <footer className="border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-500 mt-12 bg-slate-950">
        <p>© 2026 Music Theory Scale & Chord Visualizer. Engineered with full-stack React & Gemini AI.</p>
      </footer>
    </div>
  );
}
