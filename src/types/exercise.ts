export interface ExerciseSet {
  date: string;
  workout: string;
  exercise: string;
  setNumber: number;
  weight: number;
  unit: string;
  reps: number;
  duration: string;
}

export interface ExerciseData {
  [exerciseName: string]: {
    sets: ExerciseSet[];
    maxWeight: number;
    maxWeightReps: number;
    maxWeightDate: string;
    maxVolume: number;
    maxVolumeWeight: number;
    maxVolumeReps: number;
    maxVolumeDate: string;
    max1RM: number;
    max1RMWeight: number;
    max1RMReps: number;
    max1RMDate: string;
    lastUsed: Date;
  };
}

export type StrongAppVersion = "legacy" | "current";

// Current version format
export interface StrongCSVRow {
  Date: string;
  "Workout Name": string;
  "Exercise Name": string;
  "Set Order": string;
  Weight: string;
  "Weight Unit": string;
  Reps: string;
  Duration: string;
  [key: string]: string;
}

// Legacy version format
export interface StrongCSVLegacyRow {
  "Workout #": string;
  Date: string;
  "Exercise Name": string;
  "Set Order": string;
  Weight: string;
  Reps: string;
  "Weight Unit": string;
  Duration: string;
  [key: string]: string;
}
