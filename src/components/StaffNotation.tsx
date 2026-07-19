import React from "react";
import { NoteName } from "../types";
import { getSharpNote, audioEngine } from "./AudioEngine";
import { ListMusic } from "lucide-react";

interface StaffNotationProps {
  activeNotes: NoteName[];
  rootNote: NoteName;
  type: "scale" | "chord";
}

// Maps note index in octave to base diatonic step (C=0, D=1, E=2, F=3, G=4, A=5, B=6)
const DIATONIC_STEPS: Record<string, number> = {
  "C": 0, "C#": 0, "Db": 0,
  "D": 1, "D#": 1, "Eb": 1,
  "E": 2,
  "F": 3, "F#": 3, "Gb": 3,
  "G": 4, "G#": 4, "Ab": 4,
  "A": 5, "A#": 5, "Bb": 5,
  "B": 6
};

function getPitchStep(note: NoteName, octave: number): number {
  const baseStep = DIATONIC_STEPS[note] ?? 0;
  // Let Middle C (C4) be step 0. There are 7 diatonic steps per octave.
  return (octave - 4) * 7 + baseStep;
}

export const StaffNotation: React.FC<StaffNotationProps> = ({
  activeNotes,
  rootNote,
  type
}) => {
  // Let's generate note objects with their appropriate octave to fit nicely on Treble Clef (C4 to B5 is ideal)
  const notesWithOctaves = activeNotes.map((note, index) => {
    // Base octave is 4. If the note is lower than the root note in MIDI scale, we can put it in octave 5 so they ascend!
    let octave = 4;
    const notesOrder = ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"];

    if (index > 0) {
      // Look at previous note
      const prev = activeNotes[index - 1];
      const prevStep = DIATONIC_STEPS[prev] ?? 0;
      const currStep = DIATONIC_STEPS[note] ?? 0;

      // Simple heuristic to ensure ascending sequence
      if (currStep <= prevStep) {
        octave = 5;
      }
    }

    return { note, octave };
  });

  // Treble Staff parameters
  const staffHeight = 120;
  const lineSpacing = 10;
  const staffTop = 35; // Y position of top line (F5)
  // Lines are at: staffTop (F5), staffTop + 10 (D5), staffTop + 20 (B4), staffTop + 30 (G4), staffTop + 40 (E4)

  // Maps pitch step (Middle C C4 = 0) to Y coordinate
  // Bottom line E4 is step 2.
  // Each step up/down is half a space/line, which is lineSpacing / 2 (5px)
  const getNoteY = (step: number): number => {
    // Middle C (C4) is step 0. It sits on Y = staffTop + 40 + 10 = staffTop + 50
    // E4 is step 2, which sits on Y = staffTop + 40
    return staffTop + 40 - (step - 2) * (lineSpacing / 2);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl" id="staff-section">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
          <ListMusic className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-100 text-lg">Staff Notation</h3>
          <p className="text-xs text-slate-400">Music sheet visualization of {rootNote} {type} (Treble Clef).</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 flex items-center justify-center border border-slate-300">
        <svg
          viewBox="0 0 600 120"
          className="w-full max-w-2xl text-slate-950"
          style={{ height: "auto" }}
        >
          {/* Staff Lines (5 lines) */}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = staffTop + i * lineSpacing;
            return (
              <line
                key={i}
                x1="20"
                y1={y}
                x2="580"
                y2={y}
                stroke="#334155"
                strokeWidth="1.2"
              />
            );
          })}

          {/* Bar lines on ends */}
          <line x1="20" y1={staffTop} x2="20" y2={staffTop + 40} stroke="#334155" strokeWidth="2" />
          <line x1="580" y1={staffTop} x2="580" y2={staffTop + 40} stroke="#334155" strokeWidth="3" />
          <line x1="574" y1={staffTop} x2="574" y2={staffTop + 40} stroke="#334155" strokeWidth="1" />

          {/* Treble Clef SVG Drawing */}
          <g transform="translate(25, 23) scale(0.65)" className="fill-slate-800">
            <path d="M15.2,55.1c-0.6-3.8-1-7.8-1-12c0-9.6,2.2-17.4,6.5-23.3C24,15,28.4,12.3,33.1,12.3c4.1,0,7.3,1.9,9.3,5.6 c1.5,2.7,2.2,6.4,2.2,10.9c0,7.5-1.9,14.6-5.8,21.1c-3.8,6.5-8.8,11.2-15,14c5,4.7,10.1,7.1,15.1,7.1c3.5,0,6.5-1.2,8.8-3.6 c2.3-2.4,3.5-5.6,3.5-9.6c0-4.1-1.2-7.5-3.6-10.2c-2.4-2.7-5.5-4-9.4-4c-2.1,0-4,0.4-5.8,1.3c-1.8,0.8-3.2,2.1-4.2,3.8 c-1,1.7-1.5,3.6-1.5,5.8c0,2.9,1,5.3,2.9,7.1c1.9,1.8,4.2,2.7,6.8,2.7c3,0,5.4-1.2,7.1-3.6c1.2-1.7,1.8-3.8,1.8-6.3 c0-4.3-2.1-7.1-6.4-8.4c1.1-1,1.7-2.3,1.7-3.9c0-1.6-0.6-2.9-1.8-3.9c-1.2-1-2.7-1.5-4.5-1.5c-3.1,0-5.7,1.3-7.8,4 c-2.1,2.7-3.1,6.3-3.1,10.9c0,5.3,1.5,9.7,4.4,13c-3,1.5-5.9,3.5-8.5,5.9C17.3,64.2,15.9,59.8,15.2,55.1z M33.1,14.9 c-3.3,0-6.1,2.2-8.4,6.6c-2.3,4.4-3.4,10.2-3.4,17.4c0,3.3,0.2,6.5,0.7,9.6c3.9-3.7,7-7.9,9.4-12.7c2.4-4.8,3.6-10.1,3.6-15.8 C35,17.4,34.4,15.7,33.1,14.9z M28.7,42.4c-2.1,4.3-4.8,8-8.2,11c0.3-4.4,1.2-8.4,2.7-11.8C24.7,38.1,26.6,39.8,28.7,42.4z M17,44.7c0.2-3.8,0.9-7.2,2.1-10.2c-1,3.3-1.6,6.7-1.8,10.2H17z" />
          </g>

          {/* Render scale/chord notes */}
          {notesWithOctaves.map((n, index) => {
            const step = getPitchStep(n.note, n.octave);
            const y = getNoteY(step);

            // X-spacing: start notes after Clef (at X=80), spaced, e.g. 50px apart
            const x = 90 + index * (480 / Math.max(notesWithOctaves.length, 6));

            const isRoot = getSharpNote(n.note) === getSharpNote(rootNote);
            const isAccidental = n.note.includes("#") || n.note.includes("b");

            return (
              <g key={index} className="group">
                {/* Ledger Lines for Low Notes (Middle C or lower) */}
                {step <= 0 && (
                  <line
                    x1={x - 12}
                    y1={getNoteY(0)}
                    x2={x + 12}
                    y2={getNoteY(0)}
                    stroke="#475569"
                    strokeWidth="1.2"
                  />
                )}
                {/* Ledger line below A3/G3 or above A5/B5 if applicable */}
                {step <= -2 && (
                  <line
                    x1={x - 12}
                    y1={getNoteY(-2)}
                    x2={x + 12}
                    y2={getNoteY(-2)}
                    stroke="#475569"
                    strokeWidth="1.2"
                  />
                )}
                {step >= 12 && (
                  <line
                    x1={x - 12}
                    y1={getNoteY(12)}
                    x2={x + 12}
                    y2={getNoteY(12)}
                    stroke="#475569"
                    strokeWidth="1.2"
                  />
                )}

                {/* Accidental (Sharp/Flat symbol) */}
                {isAccidental && (
                  <text
                    x={x - 14}
                    y={y + 3}
                    className="font-sans text-sm font-bold fill-slate-800"
                    textAnchor="middle"
                  >
                    {n.note.includes("#") ? "♯" : "♭"}
                  </text>
                )}

                {/* Note stem (vertical line, going up if low, going down if high) */}
                {step < 6 ? (
                  <line
                    x1={x + 5.5}
                    y1={y}
                    x2={x + 5.5}
                    y2={y - 25}
                    stroke="#1e293b"
                    strokeWidth="1.5"
                  />
                ) : (
                  <line
                    x1={x - 5.5}
                    y1={y}
                    x2={x - 5.5}
                    y2={y + 25}
                    stroke="#1e293b"
                    strokeWidth="1.5"
                  />
                )}

                {/* Note Head (Oval) */}
                <ellipse
                  cx={x}
                  cy={y}
                  rx="6.5"
                  ry="4.5"
                  transform={`rotate(-20 ${x} ${y})`}
                  className={`${
                    isRoot
                      ? "fill-amber-500 hover:fill-amber-600"
                      : "fill-indigo-600 hover:fill-indigo-700"
                  } transition cursor-pointer`}
                  onClick={() => {
                    // Play note when clicked on sheet
                    const notesMap: Record<number, number> = {
                      0: 4, // C4
                      1: 4, // D4
                      2: 4, // E4
                      3: 4, // F4
                      4: 4, // G4
                      5: 4, // A4
                      6: 4, // B4
                      7: 5, // C5
                      8: 5, // D5
                      9: 5, // E5
                      10: 5, // F5
                      11: 5, // G5
                      12: 5, // A5
                      13: 5, // B5
                      14: 6  // C6
                    };
                    // Use designated octave
                    const oct = n.octave;
                    getSharpNote(n.note);
                    getPitchStep(n.note, oct);
                    activeNotes.indexOf(n.note);
                    const sharp = getSharpNote(n.note);
                    const octaveOffset = n.octave;
                    audioEngine.playNote(n.note, octaveOffset, 0.8);
                  }}
                />

                {/* Note Label above staff */}
                <text
                  x={x}
                  y={y - 12}
                  className="font-mono text-[9px] font-bold fill-slate-500 text-center"
                  textAnchor="middle"
                >
                  {n.note}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
