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
    lastUsed: Date;
  };
}
