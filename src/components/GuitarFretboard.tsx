import React, { useState } from "react";
import { NoteName } from "../types";
import { CHROMATIC_NOTES, getSharpNote, audioEngine } from "./AudioEngine";
import { Eye, Settings } from "lucide-react";

interface GuitarFretboardProps {
  activeNotes: NoteName[];
  rootNote: NoteName;
  type: "scale" | "chord";
}

type TuningName = "Standard (E A D G B E)" | "Drop D (D A D G B E)" | "DADGAD" | "Open G (D G D G B D)";

interface Tuning {
  name: TuningName;
  notes: { note: NoteName; octave: number }[]; // 6 strings from high (string 1) to low (string 6)
}

const TUNINGS: Tuning[] = [
  {
    name: "Standard (E A D G B E)",
    notes: [
      { note: "E", octave: 4 }, // String 1 (High E)
      { note: "B", octave: 3 }, // String 2
      { note: "G", octave: 3 }, // String 3
      { note: "D", octave: 3 }, // String 4
      { note: "A", octave: 2 }, // String 5
      { note: "E", octave: 2 }  // String 6 (Low E)
    ]
  },
  {
    name: "Drop D (D A D G B E)",
    notes: [
      { note: "E", octave: 4 },
      { note: "B", octave: 3 },
      { note: "G", octave: 3 },
      { note: "D", octave: 3 },
      { note: "A", octave: 2 },
      { note: "D", octave: 2 }
    ]
  },
  {
    name: "DADGAD",
    notes: [
      { note: "D", octave: 4 },
      { note: "A", octave: 3 },
      { note: "G", octave: 3 },
      { note: "D", octave: 3 },
      { note: "A", octave: 2 },
      { note: "D", octave: 2 }
    ]
  },
  {
    name: "Open G (D G D G B D)",
    notes: [
      { note: "D", octave: 4 },
      { note: "B", octave: 3 },
      { note: "G", octave: 3 },
      { note: "D", octave: 3 },
      { note: "G", octave: 2 },
      { note: "D", octave: 2 }
    ]
  }
];

export const GuitarFretboard: React.FC<GuitarFretboardProps> = ({
  activeNotes,
  rootNote,
  type
}) => {
  const [selectedTuning, setSelectedTuning] = useState<Tuning>(TUNINGS[0]);
  const [showNotes, setShowNotes] = useState<"names" | "intervals" | "none">("names");

  const numFrets = 15; // frets 0 to 14

  // Standard fretboard dot markers (3, 5, 7, 9, 12)
  const isFretMarker = (fret: number): boolean => {
    return [3, 5, 7, 9, 12].includes(fret);
  };

  const getNoteOnFret = (openNote: NoteName, openOctave: number, fret: number): { note: NoteName; octave: number } => {
    const sharpOpen = getSharpNote(openNote);
    const openIndex = CHROMATIC_NOTES.indexOf(sharpOpen);
    const totalSemitones = openIndex + fret;
    const noteIndex = totalSemitones % 12;
    const octavesAdded = Math.floor(totalSemitones / 12);
    return {
      note: CHROMATIC_NOTES[noteIndex],
      octave: openOctave + octavesAdded
    };
  };

  const getIntervalName = (note: NoteName): string => {
    const sharpRoot = getSharpNote(rootNote);
    const sharpNote = getSharpNote(note);
    const rootIndex = CHROMATIC_NOTES.indexOf(sharpRoot);
    const noteIndex = CHROMATIC_NOTES.indexOf(sharpNote);
    const semitones = (noteIndex - rootIndex + 12) % 12;

    const intervalsMap: Record<number, string> = {
      0: "R",
      1: "b2",
      2: "2",
      3: "b3",
      4: "3",
      5: "4",
      6: "#4",
      7: "5",
      8: "b6",
      9: "6",
      10: "b7",
      11: "7"
    };
    return intervalsMap[semitones] || "";
  };

  const handlePlayFret = (note: NoteName, octave: number) => {
    audioEngine.playNote(note, octave, 0.8);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl" id="guitar-section">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-lg">Interactive Guitar Fretboard</h3>
            <p className="text-xs text-slate-400">Click a fret to play a note. Highlighted notes match the {rootNote} {type}.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {/* Tuning selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedTuning.name}
              onChange={(e) => {
                const found = TUNINGS.find((t) => t.name === e.target.value);
                if (found) setSelectedTuning(found);
              }}
              className="bg-transparent text-slate-300 font-medium text-xs border-none outline-none cursor-pointer"
            >
              {TUNINGS.map((t) => (
                <option key={t.name} value={t.name} className="bg-slate-950 text-slate-300">
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Label selector */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setShowNotes("names")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                showNotes === "names"
                  ? "bg-rose-500 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Names
            </button>
            <button
              onClick={() => setShowNotes("intervals")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                showNotes === "intervals"
                  ? "bg-rose-500 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Intervals
            </button>
            <button
              onClick={() => setShowNotes("none")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                showNotes === "none"
                  ? "bg-rose-500 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Fretboard wrapper */}
      <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
        <div className="min-w-[800px] relative p-1">
          {/* Fretboard Wood Base */}
          <div className="relative bg-gradient-to-r from-slate-950 via-zinc-900 to-slate-950 border-t border-b border-zinc-800 h-64 rounded-lg shadow-inner flex flex-col justify-between py-1">
            {/* Frets markers (vertical lines) */}
            {Array.from({ length: numFrets }).map((_, f) => (
              <div
                key={f}
                style={{
                  left: `${(f / numFrets) * 100}%`,
                  height: "100%"
                }}
                className={`absolute top-0 w-1 ${
                  f === 0 ? "bg-amber-100/40 w-2.5 shadow-md" : "bg-zinc-700/60"
                }`}
              >
                {/* Fret dot markers (only displayed in the middle spaces) */}
                {isFretMarker(f) && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col gap-14 items-center opacity-30">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    {f === 12 && <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />}
                  </div>
                )}
                {/* Fret Numbers on bottom */}
                <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 font-mono text-[10px] text-slate-500 font-bold">
                  {f === 0 ? "Nut" : f}
                </div>
              </div>
            ))}

            {/* 6 Strings */}
            {selectedTuning.notes.map((stringInfo, sIndex) => {
              // String thickness (thicker at the bottom, Low E)
              const thickness = 1 + (5 - sIndex) * 0.5;
              return (
                <div key={sIndex} className="relative w-full h-8 flex items-center">
                  {/* The string wire */}
                  <div
                    style={{ height: `${thickness}px` }}
                    className="absolute left-0 w-full bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 shadow shadow-black/80 pointer-events-none"
                  />

                  {/* Note positions along this string */}
                  {Array.from({ length: numFrets }).map((_, fIndex) => {
                    const fretNote = getNoteOnFret(stringInfo.note, stringInfo.octave, fIndex);
                    const isSharp = getSharpNote(fretNote.note);
                    const active = activeNotes.some((n) => getSharpNote(n) === isSharp);
                    const isRoot = isSharp === getSharpNote(rootNote);

                    // Position in the middle of the fret space
                    const fretWidth = 100 / numFrets;
                    const leftPosition = fIndex * fretWidth + fretWidth / 2;

                    return (
                      <button
                        key={fIndex}
                        onClick={() => handlePlayFret(fretNote.note, fretNote.octave)}
                        style={{
                          left: `${leftPosition}%`,
                          transform: "translateX(-50%)"
                        }}
                        className={`absolute z-10 w-6 h-6 rounded-full flex items-center justify-center font-mono text-[9px] font-bold transition shadow-md ${
                          active
                            ? isRoot
                              ? "bg-amber-500 hover:bg-amber-600 text-slate-950 border-2 border-amber-300 scale-110"
                              : "bg-rose-500 hover:bg-rose-600 text-white border-2 border-rose-300"
                            : showNotes !== "none"
                            ? "bg-slate-900/60 hover:bg-slate-800 text-slate-500 hover:text-slate-300 border border-slate-700/30 text-[8px]"
                            : "bg-transparent hover:bg-slate-500/20 w-4 h-4 text-transparent hover:text-slate-300"
                        }`}
                        id={`guitar-string-${sIndex}-fret-${fIndex}`}
                      >
                        {showNotes === "names"
                          ? fretNote.note
                          : showNotes === "intervals"
                          ? getIntervalName(fretNote.note)
                          : active ? fretNote.note : ""}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
