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
    maxReps: number;
    lastUsed: Date;
  };
}
