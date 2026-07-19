import { NoteName } from "../types";

// Chromatic index of notes
export const CHROMATIC_NOTES: NoteName[] = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
];

// Flat conversions
export const FLAT_TO_SHARP: Record<string, NoteName> = {
  "Db": "C#",
  "Eb": "D#",
  "Gb": "F#",
  "Ab": "G#",
  "Bb": "A#"
};

export function getSharpNote(note: NoteName): NoteName {
  return FLAT_TO_SHARP[note] || note;
}

export function getMidiNumber(note: NoteName, octave: number): number {
  const sharpNote = getSharpNote(note);
  const index = CHROMATIC_NOTES.indexOf(sharpNote);
  if (index === -1) return 60; // Default C4
  return 12 * (octave + 1) + index;
}

export function getFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private activeOscillators: { [key: number]: { osc: OscillatorNode; gain: GainNode } } = {};

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public playNote(note: NoteName, octave: number = 4, duration: number = 1.0) {
    this.initCtx();
    if (!this.ctx) return;

    const midi = getMidiNumber(note, octave);
    const freq = getFrequency(midi);

    // Create oscillator and gain node
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "triangle"; // Nice warm sound
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Warm filter envelope
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + duration);

    // ADSR Envelope
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05); // quick attack
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration); // decay/release

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  public playChord(notes: NoteName[], baseOctave: number = 4, duration: number = 1.5) {
    this.initCtx();
    if (!this.ctx) return;

    // Distribute notes over octave
    let lastMidi = -1;
    notes.forEach((note) => {
      let octave = baseOctave;
      let midi = getMidiNumber(note, octave);
      // Ensure notes go up in pitch
      while (midi <= lastMidi) {
        octave++;
        midi = getMidiNumber(note, octave);
      }
      lastMidi = midi;
      this.playNote(note, octave, duration);
    });
  }

  public playArpeggio(notes: NoteName[], baseOctave: number = 4, noteDuration: number = 0.5) {
    this.initCtx();
    if (!this.ctx) return;

    let lastMidi = -1;
    notes.forEach((note, index) => {
      let octave = baseOctave;
      let midi = getMidiNumber(note, octave);
      while (midi <= lastMidi) {
        octave++;
        midi = getMidiNumber(note, octave);
      }
      lastMidi = midi;

      setTimeout(() => {
        this.playNote(note, octave, 0.8);
      }, index * noteDuration * 1000);
    });
  }
}

export const audioEngine = new AudioEngine();
