export type NoteName =
  | "C"
  | "C#"
  | "Db"
  | "D"
  | "D#"
  | "Eb"
  | "E"
  | "F"
  | "F#"
  | "Gb"
  | "G"
  | "G#"
  | "Ab"
  | "A"
  | "A#"
  | "Bb"
  | "B";

export interface ScaleDefinition {
  name: string;
  intervals: number[]; // semitones from root
  description: string;
}

export interface ChordDefinition {
  name: string;
  abbreviation: string;
  intervals: number[]; // semitones from root
  description: string;
}

export interface MusicState {
  type: "scale" | "chord";
  root: NoteName;
  name: string; // e.g. "Major", "Minor 7th"
  notes: NoteName[]; // resolved note names
  intervals: string[]; // e.g. ["1", "3", "5", "7"]
  semitones: number[]; // semitones relative to root
  description?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  isPending?: boolean;
  modelUsed?: string;
  command?: {
    type: "scale" | "chord";
    root: NoteName;
    name: string;
    notes: NoteName[];
  };
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  size: "1K" | "2K" | "4K";
  timestamp: string;
  mood?: string;
}
