import { useMemo } from "react";
import { ExerciseSet } from "@/types/exercise";

interface WorkoutAnalyzerProps {
  data: any[];
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  onExerciseClick: (exerciseName: string) => void;
}

interface WorkoutData {
  date: string;
  name: string;
  exercises: {
    [exerciseName: string]: ExerciseSet[];
  };
  totalVolume: number;
  duration: string;
}

const WorkoutAnalyzer = ({ data, selectedDate, onDateChange, onExerciseClick }: WorkoutAnalyzerProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const workoutData = useMemo(() => {
    console.log("Raw data received:", data);
    const workouts = new Map<string, WorkoutData>();

    data.forEach((row) => {
      const date = row["Date"];
      const workoutName = row["Workout Name"];
      const exercise = row["Exercise Name"];

      console.log("Processing row:", { date, workoutName, exercise });

      if (!date || !workoutName || !exercise) return;

      if (!workouts.has(date)) {
        workouts.set(date, {
          date,
          name: workoutName,
          exercises: {},
          totalVolume: 0,
          duration: row["Workout Duration"] || "",
        });
      }

      const workout = workouts.get(date)!;

      if (!workout.exercises[exercise]) {
        workout.exercises[exercise] = [];
      }

      const set: ExerciseSet = {
        date,
        workout: workoutName,
        exercise,
        setNumber: parseInt(row["Set Order"] || "1"),
        weight: parseFloat(row["Weight"] || "0"),
        unit: row["Weight Unit"] || "kg",
        reps: parseInt(row["Reps"] || "0"),
        duration: row["Duration"] || "",
      };

      workout.exercises[exercise].push(set);
      workout.totalVolume += set.weight * set.reps;
    });

    const result = Array.from(workouts.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    console.log("Processed workout data:", result);
    return result;
  }, [data]);

  const selectedWorkout = useMemo((): WorkoutData | null => {
    if (!selectedDate) return null;

    // Convert the selected date to start of day for comparison
    const compareDate = new Date(selectedDate);
    compareDate.setHours(0, 0, 0, 0);

    const workout = workoutData.find((workout) => {
      // Convert workout date to start of day for comparison
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      return workoutDate.getTime() === compareDate.getTime();
    });

    return workout || null;
  }, [workoutData, selectedDate]);

  return (
    <div className="p-6 space-y-6">
      <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
        {workoutData.map((workout) => (
          <button
            key={workout.date}
            onClick={() => onDateChange(new Date(workout.date))}
            className={`w-full p-3 rounded-lg border transition-colors text-left flex items-center justify-between
              ${selectedWorkout?.date === workout.date ? "bg-blue-500/20 border-blue-500 text-blue-400" : "bg-gray-700 border-gray-600 text-gray-200 hover:border-blue-500 hover:text-blue-400"}`}>
            <div className="flex items-center gap-4">
              <div className="font-semibold">{formatDate(workout.date)}</div>
              <div className="text-sm opacity-80">{workout.name}</div>
            </div>
            <div className="text-sm opacity-60">{Object.keys(workout.exercises).length} exercises</div>
          </button>
        ))}
      </div>

      {selectedWorkout && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">{formatDate(selectedWorkout.date)}</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-2 text-gray-200">Total Volume</h3>
              <p className="text-2xl font-bold text-blue-400">{Math.round(selectedWorkout.totalVolume)} kg</p>
            </div>
            <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-2 text-gray-200">Exercises</h3>
              <p className="text-2xl font-bold text-blue-400">{Object.keys(selectedWorkout.exercises).length}</p>
            </div>
            <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-2 text-gray-200">Duration</h3>
              <p className="text-2xl font-bold text-blue-400">{selectedWorkout.duration}</p>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(selectedWorkout.exercises).map(([exerciseName, sets]) => (
              <div key={exerciseName} className="bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
                <div onClick={() => onExerciseClick(exerciseName)} className="px-4 py-3 bg-gray-750 border-b border-gray-600 rounded-t-lg cursor-pointer hover:bg-gray-700 transition-colors group">
                  <h4 className="font-semibold text-white group-hover:text-blue-400">{exerciseName}</h4>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-4 gap-4">
                    {sets.map((set, index) => (
                      <div key={index} className="p-3 bg-gray-800 rounded-lg">
                        <div className="text-sm text-gray-400">Set {set.setNumber}</div>
                        <div className="font-semibold text-white">
                          {set.weight} kg × {set.reps}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutAnalyzer;
