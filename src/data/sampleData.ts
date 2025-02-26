import { StrongCSVRow } from "@/types/exercise";

// Generate dates for the last 30 days
const generateDates = (count: number) => {
  const dates: string[] = [];
  const today = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 2); // Workout every other day
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
};

const dates = generateDates(30);

// Helper to add small random variations to weights and reps
const addVariation = (base: number, range: number) => {
  return base + (Math.random() < 0.5 ? -1 : 1) * Math.floor(Math.random() * range);
};

// Helper to generate progressive weights
const generateProgressiveWeight = (startWeight: number, increment: number, workoutIndex: number) => {
  // Every 3-4 workouts, increase the weight
  const progressions = Math.floor(workoutIndex / 3);
  return startWeight + progressions * increment;
};

// Helper to generate random workout duration between 45-75 minutes
const generateWorkoutDuration = () => {
  const minutes = Math.floor(45 + Math.random() * 31); // Random duration between 45-75 minutes
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  } else {
    return `${minutes}m`;
  }
};

export const sampleData: StrongCSVRow[] = [
  // Push workouts
  ...dates
    .filter((_, i) => i % 3 === 0)
    .flatMap((date, workoutIndex) => {
      const workoutDuration = generateWorkoutDuration();
      return [
        // Bench Press progression
        ...Array.from({ length: 3 }, (_, i) => {
          const baseWeight = generateProgressiveWeight(65, 2.5, workoutIndex); // Start at 65kg, increment by 2.5kg
          const weight = addVariation(baseWeight, 2); // Small variations
          const reps = i === 0 ? 5 : i === 1 ? 5 : 4; // 5,5,4 rep scheme

          return {
            Date: date,
            "Workout Name": "Push Day",
            "Exercise Name": "Bench Press",
            "Set Order": (i + 1).toString(),
            Weight: weight.toString(),
            "Weight Unit": "kg",
            Reps: workoutIndex > 8 && i === 2 && Math.random() < 0.2 ? "3" : reps.toString(), // Occasional failed last set after week 3
            Duration: "",
            "Workout Duration": workoutDuration,
            Notes: "",
          };
        }),
        // Overhead Press with slower progression
        ...Array.from({ length: 3 }, (_, i) => {
          const baseWeight = generateProgressiveWeight(40, 1.25, workoutIndex);
          const weight = addVariation(baseWeight, 1);
          return {
            Date: date,
            "Workout Name": "Push Day",
            "Exercise Name": "Overhead Press",
            "Set Order": (i + 4).toString(),
            Weight: weight.toString(),
            "Weight Unit": "kg",
            Reps: (6 - Math.floor(i / 2)).toString(), // 6,6,5 rep scheme
            Duration: "",
            "Workout Duration": workoutDuration,
            Notes: "",
          };
        }),
        // Incline Bench Press
        ...Array.from({ length: 3 }, (_, i) => {
          const baseWeight = generateProgressiveWeight(50, 2, workoutIndex);
          return {
            Date: date,
            "Workout Name": "Push Day",
            "Exercise Name": "Incline Bench Press",
            "Set Order": (i + 7).toString(),
            Weight: baseWeight.toString(),
            "Weight Unit": "kg",
            Reps: "8",
            Duration: "",
            "Workout Duration": workoutDuration,
            Notes: "",
          };
        }),
        // Lateral Raises
        ...Array.from({ length: 3 }, (_, i) => ({
          Date: date,
          "Workout Name": "Push Day",
          "Exercise Name": "Lateral Raise",
          "Set Order": (i + 10).toString(),
          Weight: "10",
          "Weight Unit": "kg",
          Reps: (15 - Math.floor(i / 2)).toString(), // 15,15,14 reps
          Duration: "",
          "Workout Duration": workoutDuration,
          Notes: "",
        })),
      ];
    }),

  // Pull workouts
  ...dates
    .filter((_, i) => i % 3 === 1)
    .flatMap((date, workoutIndex) => {
      const workoutDuration = generateWorkoutDuration();
      return [
        // Weighted Pull-ups with progression
        ...Array.from({ length: 3 }, (_, i) => {
          const baseWeight = generateProgressiveWeight(0, 2.5, workoutIndex); // Progress from bodyweight
          return {
            Date: date,
            "Workout Name": "Pull Day",
            "Exercise Name": "Pull-up",
            "Set Order": (i + 1).toString(),
            Weight: baseWeight.toString(),
            "Weight Unit": "kg",
            Reps: (8 - i).toString(), // 8,7,6 reps
            Duration: "",
            "Workout Duration": workoutDuration,
            Notes: "",
          };
        }),
        // Barbell Row progression
        ...Array.from({ length: 3 }, (_, i) => {
          const baseWeight = generateProgressiveWeight(60, 2.5, workoutIndex);
          const weight = addVariation(baseWeight, 2);
          return {
            Date: date,
            "Workout Name": "Pull Day",
            "Exercise Name": "Barbell Row",
            "Set Order": (i + 4).toString(),
            Weight: weight.toString(),
            "Weight Unit": "kg",
            Reps: "8",
            Duration: "",
            "Workout Duration": workoutDuration,
            Notes: "",
          };
        }),
        // Face Pulls (high rep)
        ...Array.from({ length: 3 }, (_, i) => ({
          Date: date,
          "Workout Name": "Pull Day",
          "Exercise Name": "Face Pull",
          "Set Order": (i + 7).toString(),
          Weight: "15",
          "Weight Unit": "kg",
          Reps: (20 - i * 2).toString(), // 20,18,16 reps
          Duration: "",
          "Workout Duration": workoutDuration,
          Notes: "",
        })),
        // Bicep Curls with small progression
        ...Array.from({ length: 3 }, (_, i) => {
          const baseWeight = generateProgressiveWeight(12, 1, workoutIndex);
          return {
            Date: date,
            "Workout Name": "Pull Day",
            "Exercise Name": "Bicep Curl",
            "Set Order": (i + 10).toString(),
            Weight: baseWeight.toString(),
            "Weight Unit": "kg",
            Reps: (12 - i).toString(), // 12,11,10 reps
            Duration: "",
            "Workout Duration": workoutDuration,
            Notes: "",
          };
        }),
      ];
    }),

  // Leg workouts
  ...dates
    .filter((_, i) => i % 3 === 2)
    .flatMap((date, workoutIndex) => {
      const workoutDuration = generateWorkoutDuration();
      return [
        // Squat progression
        ...Array.from({ length: 3 }, (_, i) => {
          const baseWeight = generateProgressiveWeight(80, 5, workoutIndex);
          const weight = addVariation(baseWeight, 2);
          const baseReps = 5;
          // Occasionally fail a rep on the last set when weight gets heavy
          const reps = workoutIndex > 6 && i === 2 && Math.random() < 0.3 ? baseReps - 1 : baseReps;

          return {
            Date: date,
            "Workout Name": "Leg Day",
            "Exercise Name": "Squat",
            "Set Order": (i + 1).toString(),
            Weight: weight.toString(),
            "Weight Unit": "kg",
            Reps: reps.toString(),
            Duration: "",
            "Workout Duration": workoutDuration,
            Notes: "",
          };
        }),
        // Romanian Deadlift
        ...Array.from({ length: 3 }, (_, i) => {
          const baseWeight = generateProgressiveWeight(70, 2.5, workoutIndex);
          return {
            Date: date,
            "Workout Name": "Leg Day",
            "Exercise Name": "Romanian Deadlift",
            "Set Order": (i + 4).toString(),
            Weight: baseWeight.toString(),
            "Weight Unit": "kg",
            Reps: "8",
            Duration: "",
            "Workout Duration": workoutDuration,
            Notes: "",
          };
        }),
        // Leg Press (higher rep range)
        ...Array.from({ length: 3 }, (_, i) => {
          const baseWeight = generateProgressiveWeight(120, 10, workoutIndex);
          return {
            Date: date,
            "Workout Name": "Leg Day",
            "Exercise Name": "Leg Press",
            "Set Order": (i + 7).toString(),
            Weight: baseWeight.toString(),
            "Weight Unit": "kg",
            Reps: (12 - Math.floor(i / 2)).toString(), // 12,12,11 reps
            Duration: "",
            "Workout Duration": workoutDuration,
            Notes: "",
          };
        }),
        // Calf Raises
        ...Array.from({ length: 4 }, (_, i) => ({
          Date: date,
          "Workout Name": "Leg Day",
          "Exercise Name": "Standing Calf Raise",
          "Set Order": (i + 10).toString(),
          Weight: "40",
          "Weight Unit": "kg",
          Reps: "15",
          Duration: "",
          "Workout Duration": workoutDuration,
          Notes: "",
        })),
      ];
    }),
];
