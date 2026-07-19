import React from "react";
import { NoteName } from "../types";
import { CHROMATIC_NOTES, getSharpNote, audioEngine } from "./AudioEngine";
import { Play, Music } from "lucide-react";

interface PianoKeyboardProps {
  activeNotes: NoteName[];
  rootNote: NoteName;
  type: "scale" | "chord";
}

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  activeNotes,
  rootNote,
  type
}) => {
  // We want to render from C4 to C6 (2 octaves + 1 white key)
  const whiteKeys: { note: NoteName; octave: number; id: string }[] = [
    { note: "C", octave: 4, id: "C4" },
    { note: "D", octave: 4, id: "D4" },
    { note: "E", octave: 4, id: "E4" },
    { note: "F", octave: 4, id: "F4" },
    { note: "G", octave: 4, id: "G4" },
    { note: "A", octave: 4, id: "A4" },
    { note: "B", octave: 4, id: "B4" },
    { note: "C", octave: 5, id: "C5" },
    { note: "D", octave: 5, id: "D5" },
    { note: "E", octave: 5, id: "E5" },
    { note: "F", octave: 5, id: "F5" },
    { note: "G", octave: 5, id: "G5" },
    { note: "A", octave: 5, id: "A5" },
    { note: "B", octave: 5, id: "B5" },
    { note: "C", octave: 6, id: "C6" }
  ];

  const blackKeys: { note: NoteName; octave: number; leftOffsetPercent: number; id: string }[] = [
    // Octave 4
    { note: "C#", octave: 4, leftOffsetPercent: 100 / 15 * 0.72, id: "C#4" },
    { note: "D#", octave: 4, leftOffsetPercent: 100 / 15 * 1.76, id: "D#4" },
    { note: "F#", octave: 4, leftOffsetPercent: 100 / 15 * 3.72, id: "F#4" },
    { note: "G#", octave: 4, leftOffsetPercent: 100 / 15 * 4.74, id: "G#4" },
    { note: "A#", octave: 4, leftOffsetPercent: 100 / 15 * 5.76, id: "A#4" },
    // Octave 5
    { note: "C#", octave: 5, leftOffsetPercent: 100 / 15 * 7.72, id: "C#5" },
    { note: "D#", octave: 5, leftOffsetPercent: 100 / 15 * 8.76, id: "D#5" },
    { note: "F#", octave: 5, leftOffsetPercent: 100 / 15 * 10.72, id: "F#5" },
    { note: "G#", octave: 5, leftOffsetPercent: 100 / 15 * 11.74, id: "G#5" },
    { note: "A#", octave: 5, leftOffsetPercent: 100 / 15 * 12.76, id: "A#5" }
  ];

  // Helper to check if a note is active
  const isNoteActive = (note: NoteName): boolean => {
    const sharpNote = getSharpNote(note);
    return activeNotes.some((n) => getSharpNote(n) === sharpNote);
  };

  const isNoteRoot = (note: NoteName): boolean => {
    return getSharpNote(note) === getSharpNote(rootNote);
  };

  const handlePlayKey = (note: NoteName, octave: number) => {
    audioEngine.playNote(note, octave, 0.8);
  };

  const playFullSound = () => {
    if (type === "scale") {
      audioEngine.playArpeggio(activeNotes, 4, 0.25);
    } else {
      audioEngine.playChord(activeNotes, 4, 1.5);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl" id="piano-section">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-lg">Interactive Piano Keyboard</h3>
            <p className="text-xs text-slate-400">Click keys to play. Active notes of {rootNote} {type} are highlighted.</p>
          </div>
        </div>
        <button
          onClick={playFullSound}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-medium transition shadow-md hover:shadow-indigo-500/10 active:scale-95"
          id="play-sound-button"
        >
          <Play className="w-4 h-4 fill-current" />
          Play {type === "scale" ? "Scale" : "Chord"}
        </button>
      </div>

      <div className="relative h-48 w-full border border-slate-950 rounded-xl overflow-hidden bg-slate-950">
        {/* White Keys */}
        <div className="flex h-full w-full">
          {whiteKeys.map((k, index) => {
            const active = isNoteActive(k.note);
            const isRoot = isNoteRoot(k.note);
            return (
              <button
                key={k.id}
                onClick={() => handlePlayKey(k.note, k.octave)}
                style={{ width: `${100 / 15}%` }}
                className={`relative h-full border-r border-slate-950 text-center transition-all flex flex-col justify-end pb-3 outline-none group ${
                  active
                    ? isRoot
                      ? "bg-amber-100 text-amber-950 border-b-8 border-amber-500 shadow-inner"
                      : "bg-indigo-100 text-indigo-950 border-b-8 border-indigo-500 shadow-inner"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-500"
                } ${index === 0 ? "rounded-l-xl" : ""} ${index === 14 ? "rounded-r-xl border-r-0" : ""}`}
                id={`piano-key-white-${k.id}`}
              >
                {/* Active indicator dot */}
                {active && (
                  <span
                    className={`absolute top-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${
                      isRoot ? "bg-amber-500" : "bg-indigo-500"
                    }`}
                  />
                )}
                <span className="font-mono text-xs font-bold block leading-none">
                  {k.note}
                  <span className="text-[9px] opacity-60 font-normal">{k.octave}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Black Keys */}
        {blackKeys.map((k) => {
          const active = isNoteActive(k.note);
          const isRoot = isNoteRoot(k.note);
          return (
            <button
              key={k.id}
              onClick={() => handlePlayKey(k.note, k.octave)}
              style={{
                left: `${k.leftOffsetPercent}%`,
                width: `${100 / 15 * 0.65}%`,
                height: "60%"
              }}
              className={`absolute top-0 transition-all z-10 rounded-b border-b-[4px] outline-none ${
                active
                  ? isRoot
                    ? "bg-amber-600 border-amber-800 text-amber-50"
                    : "bg-indigo-600 border-indigo-800 text-indigo-50"
                  : "bg-slate-800 hover:bg-slate-700 border-slate-900 text-slate-400"
              } shadow-lg flex flex-col justify-end pb-2 items-center`}
              id={`piano-key-black-${k.id}`}
            >
              {active && (
                <span
                  className={`w-1.5 h-1.5 rounded-full mb-2 ${
                    isRoot ? "bg-amber-300 animate-pulse" : "bg-indigo-300"
                  }`}
                />
              )}
              <span className="font-mono text-[9px] font-bold block tracking-tighter">
                {k.note}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
