import { NoteName, ScaleDefinition, ChordDefinition, MusicState } from "../types";
import { CHROMATIC_NOTES } from "../components/AudioEngine";

export const SCALES: ScaleDefinition[] = [
  { name: "Major (Ionian)", intervals: [0, 2, 4, 5, 7, 9, 11], description: "The foundation of Western music. Bright, happy, and highly stable." },
  { name: "Natural Minor (Aeolian)", intervals: [0, 2, 3, 5, 7, 8, 10], description: "Classic dark, emotional, and introspective sound." },
  { name: "Dorian Mode", intervals: [0, 2, 3, 5, 7, 9, 10], description: "Jazz-inflected minor mode. Cool, soulful, and slightly brighter than natural minor." },
  { name: "Phrygian Mode", intervals: [0, 1, 3, 5, 7, 8, 10], description: "Exotic and tense. Frequently used in flamenco, metal, and cinema." },
  { name: "Lydian Mode", intervals: [0, 2, 4, 6, 7, 9, 11], description: "Dreamlike, celestial, and floaty. Known for its raised fourth interval." },
  { name: "Mixolydian Mode", intervals: [0, 2, 4, 5, 7, 9, 10], description: "Bluesy, dominant, and celebratory. Frequently used in rock and funk." },
  { name: "Harmonic Minor", intervals: [0, 2, 3, 5, 7, 8, 11], description: "Classical, gothic, and theatrical sound with a major 7th interval." },
  { name: "Melodic Minor", intervals: [0, 2, 3, 5, 7, 9, 11], description: "Sophisticated jazz sound. Different ascending but here visualized standard." },
  { name: "Pentatonic Major", intervals: [0, 2, 4, 7, 9], description: "Five-note scale. Extremely pleasant, impossible to play a bad note." },
  { name: "Pentatonic Minor", intervals: [0, 3, 5, 7, 10], description: "Rock and blues staple. Hard-hitting and expressive." },
  { name: "Blues Scale", intervals: [0, 3, 5, 6, 7, 10], description: "Adds the 'blue note' (tritone) for that quintessential smoky grit." }
];

export const CHORDS: ChordDefinition[] = [
  { name: "Major Triad", abbreviation: "maj", intervals: [0, 4, 7], description: "Warm, stable, and foundational. 1 - 3 - 5." },
  { name: "Minor Triad", abbreviation: "min", intervals: [0, 3, 7], description: "Sad, serious, and deeply rich. 1 - b3 - 5." },
  { name: "Diminished", abbreviation: "dim", intervals: [0, 3, 6], description: "Tense, unstable, and spooky. 1 - b3 - b5." },
  { name: "Augmented", abbreviation: "aug", intervals: [0, 4, 8], description: "Dreamy, suspended, and mysterious. 1 - 3 - #5." },
  { name: "Major 7th", abbreviation: "maj7", intervals: [0, 4, 7, 11], description: "Lush, dreamy, and nostalgic. Standard in jazz and lo-fi. 1 - 3 - 5 - 7." },
  { name: "Minor 7th", abbreviation: "min7", intervals: [0, 3, 7, 10], description: "Mellow, cool, and sophisticated. 1 - b3 - 5 - b7." },
  { name: "Dominant 7th", abbreviation: "7", intervals: [0, 4, 7, 10], description: "Bluesy, active, and wants to resolve. 1 - 3 - 5 - b7." },
  { name: "Minor 7th Flat 5", abbreviation: "m7b5", intervals: [0, 3, 6, 10], description: "Half-diminished. Haunting and highly functional. 1 - b3 - b5 - b7." },
  { name: "Major 9th", abbreviation: "maj9", intervals: [0, 4, 7, 11, 14], description: "Ultra-lush, beautiful modern jazz flavor. 1 - 3 - 5 - 7 - 9." },
  { name: "Minor 9th", abbreviation: "min9", intervals: [0, 3, 7, 10, 14], description: "Deeply intellectual, warm, and romantic. 1 - b3 - 5 - b7 - 9." },
  { name: "Dominant 9th", abbreviation: "9", intervals: [0, 4, 7, 10, 14], description: "Funk and jazz groove staple. 1 - 3 - 5 - b7 - 9." }
];

// Helper to convert flats to sharps for uniform calculation
export const STANDARDIZE_NOTE: Record<string, NoteName> = {
  "Db": "C#",
  "Eb": "D#",
  "Gb": "F#",
  "Ab": "G#",
  "Bb": "A#"
};

export const DISPLAY_PREFERENCE_FLATS: Record<NoteName, string[]> = {
  "C": ["C", "D", "E", "F", "G", "A", "B"],
  "Db": ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
  "D": ["D", "E", "F#", "G", "A", "B", "C#"],
  "Eb": ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
  "E": ["E", "F#", "G#", "A", "B", "C#", "D#"],
  "F": ["F", "G", "A", "Bb", "C", "D", "E"],
  "F#": ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
  "Gb": ["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F"],
  "G": ["G", "A", "B", "C", "D", "E", "F#"],
  "Ab": ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
  "A": ["A", "B", "C#", "D", "E", "F#", "G#"],
  "Bb": ["Bb", "C", "D", "Eb", "F", "G", "A"],
  "B": ["B", "C#", "D#", "E", "F#", "G#", "A#"],
  "C#": ["C#", "D#", "E#", "F#", "G#", "A#", "B#"],
  "D#": ["D#", "E#", "F##", "G#", "A#", "B#", "C##"],
  "G#": ["G#", "A#", "B#", "C#", "D#", "E#", "F##"],
  "A#": ["A#", "B#", "C##", "D#", "E#", "F##", "G##"]
};

// Map of semitone offsets to standard chord/scale intervals
export const INTERVAL_LABELS: Record<number, string> = {
  0: "1",
  1: "b2",
  2: "2",
  3: "b3",
  4: "3",
  5: "4",
  6: "b5",
  7: "5",
  8: "b6",
  9: "6",
  10: "b7",
  11: "7",
  12: "8",
  13: "b9",
  14: "9",
  15: "#9"
};

// Calculates notes & intervals for any given root and chord/scale name
export function computeMusicState(
  type: "scale" | "chord",
  root: NoteName,
  name: string
): MusicState {
  const sharpRoot = STANDARDIZE_NOTE[root] || root;
  const rootIndex = CHROMATIC_NOTES.indexOf(sharpRoot);

  let intervals: number[] = [];
  let description = "";

  if (type === "scale") {
    const scaleDef = SCALES.find((s) => s.name === name || s.name.toLowerCase().includes(name.toLowerCase()));
    if (scaleDef) {
      intervals = scaleDef.intervals;
      description = scaleDef.description;
    } else {
      // Default Major Scale
      intervals = SCALES[0].intervals;
      description = SCALES[0].description;
    }
  } else {
    const chordDef = CHORDS.find((c) => c.name === name || c.abbreviation === name || c.name.toLowerCase().includes(name.toLowerCase()));
    if (chordDef) {
      intervals = chordDef.intervals;
      description = chordDef.description;
    } else {
      // Default Major Triad
      intervals = CHORDS[0].intervals;
      description = CHORDS[0].description;
    }
  }

  // Resolve note names
  const resolvedNotes = intervals.map((offset) => {
    const semitones = (rootIndex + offset) % 12;
    return CHROMATIC_NOTES[semitones];
  });

  // Resolve interval labels
  const resolvedIntervalLabels = intervals.map((offset) => {
    return INTERVAL_LABELS[offset] || offset.toString();
  });

  return {
    type,
    root,
    name,
    notes: resolvedNotes,
    intervals: resolvedIntervalLabels,
    semitones: intervals,
    description
  };
}
