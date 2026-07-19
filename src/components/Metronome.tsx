import React, { useState, useEffect, useRef } from "react";
import { Play, Square, Volume2, Timer, Plus, Minus } from "lucide-react";

export const Metronome: React.FC = () => {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const beatsPerMeasure = 4;

  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalIdRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef(0);
  const beatRef = useRef(0);

  // Initialize Audio Context lazily
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
  };

  // Play a single tick sound
  const playTick = (time: number, isFirstBeat: boolean) => {
    if (!audioContextRef.current) return;

    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();

    osc.connect(gain);
    gain.connect(audioContextRef.current.destination);

    // High pitch woodblock / click
    osc.frequency.setValueAtTime(isFirstBeat ? 1000 : 600, time);
    
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.start(time);
    osc.stop(time + 0.1);
  };

  // Schedule next beat ticks
  const scheduler = () => {
    if (!audioContextRef.current) return;

    // Schedule any beats that occur before the next timer tick
    while (nextNoteTimeRef.current < audioContextRef.current.currentTime + 0.1) {
      const isFirst = beatRef.current === 0;
      playTick(nextNoteTimeRef.current, isFirst);

      // Track beat index in local React state for UI flash updates
      const scheduledBeat = beatRef.current;
      setTimeout(() => {
        setCurrentBeat(scheduledBeat);
      }, (nextNoteTimeRef.current - audioContextRef.current.currentTime) * 1000);

      // Advance to next beat
      const secondsPerBeat = 60.0 / bpm;
      nextNoteTimeRef.current += secondsPerBeat;
      beatRef.current = (beatRef.current + 1) % beatsPerMeasure;
    }
  };

  // Start / Stop metronome
  const togglePlay = () => {
    initAudioContext();
    if (isPlaying) {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      setIsPlaying(false);
      setCurrentBeat(0);
    } else {
      if (audioContextRef.current) {
        nextNoteTimeRef.current = audioContextRef.current.currentTime + 0.05;
        beatRef.current = 0;
        setCurrentBeat(0);
        // Start scheduler loop running every 25ms
        intervalIdRef.current = window.setInterval(scheduler, 25);
        setIsPlaying(true);
      }
    }
  };

  // Adjust BPM limits
  const changeBpm = (amount: number) => {
    setBpm((prev) => Math.min(240, Math.max(40, prev + amount)));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg" id="metronome-section">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
          <Timer className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-slate-100 text-sm">Practice Metronome</h4>
          <p className="text-xs text-slate-400">Keep standard tempo to practice chords or scales.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Beat indicators */}
        <div className="flex gap-2 justify-center py-1 bg-slate-950/40 rounded-xl border border-slate-800/50 p-2">
          {Array.from({ length: beatsPerMeasure }).map((_, idx) => {
            const isActive = isPlaying && currentBeat === idx;
            return (
              <div
                key={idx}
                className={`h-2.5 flex-1 rounded-full transition-all duration-75 ${
                  isActive
                    ? idx === 0
                      ? "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)] scale-y-110"
                      : "bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.6)] scale-y-110"
                    : "bg-slate-800"
                }`}
              />
            );
          })}
        </div>

        {/* Speed adjustment controls */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => changeBpm(-5)}
            className="p-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition active:scale-95"
            title="Decrease 5 BPM"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="text-center flex-1">
            <span className="block font-mono text-3xl font-black text-slate-100 leading-none">
              {bpm}
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 block">
              Beats Per Minute
            </span>
          </div>

          <button
            onClick={() => changeBpm(5)}
            className="p-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition active:scale-95"
            title="Increase 5 BPM"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive slider */}
        <input
          type="range"
          min="40"
          max="240"
          value={bpm}
          onChange={(e) => setBpm(parseInt(e.target.value))}
          className="w-full accent-indigo-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer border border-slate-800/80"
        />

        {/* Master Start / Stop button */}
        <button
          onClick={togglePlay}
          className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-md ${
            isPlaying
              ? "bg-rose-500 hover:bg-rose-600 text-white"
              : "bg-indigo-500 hover:bg-indigo-600 text-white"
          }`}
          id="toggle-metronome-button"
        >
          {isPlaying ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              Stop Metronome
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Start Metronome
            </>
          )}
        </button>
      </div>
    </div>
  );
};
