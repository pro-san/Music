import React from "react";
import { NoteName } from "../types";
import { getSharpNote } from "./AudioEngine";
import { Compass } from "lucide-react";

interface CircleOfFifthsProps {
  rootNote: NoteName;
  onSelectRoot: (note: NoteName) => void;
  activeNotes: NoteName[];
}

interface CircleSegment {
  major: NoteName;
  minor: NoteName;
  angle: number; // degrees
}

// Circle of fifths starting from C (top, 0 degrees)
const FIFTHS_SCALE: CircleSegment[] = [
  { major: "C", minor: "A", angle: -90 },
  { major: "G", minor: "E", angle: -60 },
  { major: "D", minor: "B", angle: -30 },
  { major: "A", minor: "F#", angle: 0 },
  { major: "E", minor: "C#", angle: 30 },
  { major: "B", minor: "G#", angle: 60 },
  { major: "F#", minor: "D#", angle: 90 },
  { major: "Db", minor: "Bb", angle: 120 },
  { major: "Ab", minor: "F", angle: 150 },
  { major: "Eb", minor: "C", angle: 180 },
  { major: "Bb", minor: "G", angle: 210 },
  { major: "F", minor: "D", angle: 240 }
];

export const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({
  rootNote,
  onSelectRoot,
  activeNotes
}) => {
  const size = 320;
  const center = size / 2;
  const rMajor = 110;
  const rMinor = 75;
  const rTextMajor = 130;
  const rTextMinor = 92;

  const isRootMajor = (note: NoteName): boolean => {
    return getSharpNote(note) === getSharpNote(rootNote);
  };

  const isNoteInScale = (note: NoteName): boolean => {
    return activeNotes.some((n) => getSharpNote(n) === getSharpNote(note));
  };

  // SVG trigonometry helper
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  const drawSegmentPath = (rIn: number, rOut: number, startAngle: number, endAngle: number) => {
    const startIn = polarToCartesian(center, center, rIn, startAngle);
    const endIn = polarToCartesian(center, center, rIn, endAngle);
    const startOut = polarToCartesian(center, center, rOut, startAngle);
    const endOut = polarToCartesian(center, center, rOut, endAngle);

    const arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

    return `
      M ${startOut.x} ${startOut.y}
      A ${rOut} ${rOut} 0 ${arcSweep} 1 ${endOut.x} ${endOut.y}
      L ${endIn.x} ${endIn.y}
      A ${rIn} ${rIn} 0 ${arcSweep} 0 ${startIn.x} ${startIn.y}
      Z
    `;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center" id="circle-section">
      <div className="w-full flex items-center gap-2 mb-4 self-start">
        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-100 text-lg">Circle of Fifths</h3>
          <p className="text-xs text-slate-400">Click a key to select it. Highlights show key relationships.</p>
        </div>
      </div>

      <div className="relative flex items-center justify-center bg-slate-950/40 p-4 rounded-xl border border-slate-800/50 w-full max-w-sm">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width="100%"
          height="100%"
          className="max-w-[280px] drop-shadow-2xl"
        >
          {/* Outer circle guidelines */}
          <circle cx={center} cy={center} r={145} fill="none" className="stroke-slate-800" strokeWidth="1.5" />
          <circle cx={center} cy={center} r={110} fill="none" className="stroke-slate-800/80" strokeWidth="1" />
          <circle cx={center} cy={center} r={75} fill="none" className="stroke-slate-800/50" strokeWidth="1" />
          <circle cx={center} cy={center} r={40} fill="none" className="stroke-slate-800/20" strokeWidth="1" />

          {/* 12 wedge segments */}
          {FIFTHS_SCALE.map((seg, i) => {
            // angle span of 30 degrees (-15 to +15 around the center angle)
            const centerAngle = (i * 30);
            const startAngle = centerAngle - 15;
            const endAngle = centerAngle + 15;

            const isMajorActive = isNoteInScale(seg.major);
            const isMinorActive = isNoteInScale(seg.minor);

            const isMajorRoot = isRootMajor(seg.major);

            // Calculate colors based on active state
            let majorFill = "fill-transparent";
            if (isMajorRoot) {
              majorFill = "fill-amber-500/20";
            } else if (isMajorActive) {
              majorFill = "fill-emerald-500/10";
            }

            let minorFill = "fill-transparent";
            if (isMinorActive) {
              minorFill = "fill-teal-500/10";
            }

            return (
              <g key={i} className="group">
                {/* Major wedge */}
                <path
                  d={drawSegmentPath(110, 145, startAngle, endAngle)}
                  className={`${majorFill} stroke-slate-800/50 hover:fill-slate-800/30 transition cursor-pointer`}
                  onClick={() => onSelectRoot(seg.major)}
                />

                {/* Minor wedge */}
                <path
                  d={drawSegmentPath(75, 110, startAngle, endAngle)}
                  className={`${minorFill} stroke-slate-800/30 hover:fill-slate-800/20 transition cursor-pointer`}
                  onClick={() => onSelectRoot(seg.minor)}
                />

                {/* Major key text */}
                {(() => {
                  const pos = polarToCartesian(center, center, rTextMajor, centerAngle);
                  return (
                    <text
                      x={pos.x}
                      y={pos.y}
                      onClick={() => onSelectRoot(seg.major)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`font-sans text-xs font-bold transition-all cursor-pointer select-none ${
                        isMajorRoot
                          ? "fill-amber-400 font-extrabold text-sm scale-110"
                          : isMajorActive
                          ? "fill-emerald-400"
                          : "fill-slate-400 hover:fill-slate-200"
                      }`}
                    >
                      {seg.major}
                    </text>
                  );
                })()}

                {/* Minor key text */}
                {(() => {
                  const pos = polarToCartesian(center, center, rTextMinor, centerAngle);
                  return (
                    <text
                      x={pos.x}
                      y={pos.y}
                      onClick={() => onSelectRoot(seg.minor)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`font-sans text-[10px] font-medium transition-all cursor-pointer select-none ${
                        isMinorActive
                          ? "fill-teal-400"
                          : "fill-slate-500 hover:fill-slate-300"
                      }`}
                    >
                      {seg.minor}m
                    </text>
                  );
                })()}
              </g>
            );
          })}

          {/* Center visual accent */}
          <circle
            cx={center}
            cy={center}
            r={40}
            className="fill-slate-900 stroke-slate-800/50"
            strokeWidth="1.5"
          />
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-amber-400 font-mono text-[10px] font-bold tracking-widest uppercase"
          >
            {rootNote}
          </text>
        </svg>
      </div>

      {/* Quick relationship key */}
      <div className="flex gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-amber-500/20 border border-amber-500/50 rounded-sm" />
          <span className="text-slate-400">Root Key</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-sm" />
          <span className="text-slate-400">Scale Major</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-teal-500/10 border border-teal-500/30 rounded-sm" />
          <span className="text-slate-400">Scale Minor</span>
        </div>
      </div>
    </div>
  );
};
