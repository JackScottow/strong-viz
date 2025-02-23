import { useState, useMemo } from "react";
import { ExerciseData, ExerciseSet } from "@/types/exercise";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ExerciseAnalyzerProps {
  data: any[];
  onWorkoutClick: (date: string) => void;
  selectedExercise: string;
  onExerciseSelect: (exercise: string) => void;
}

interface ChartDataPoint {
  date: string;
  weight: number;
  volume: number;
  sets: ExerciseSet[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload[0]) return null;

  const sets: ExerciseSet[] = payload[0].payload.sets;
  // Sort sets by set number to maintain order
  const sortedSets = [...sets].sort((a, b) => a.setNumber - b.setNumber);

  return (
    <div className="bg-gray-800 p-3 border border-gray-700 rounded-lg shadow-lg">
      <p className="font-semibold text-white mb-2">
        {new Date(label).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </p>
      <div className="space-y-1">
        {sortedSets.map((set, index) => (
          <p key={index} className="text-gray-300">
            Set {set.setNumber}: {set.weight} kg × {set.reps} reps
          </p>
        ))}
      </div>
    </div>
  );
};

const ExerciseAnalyzer = ({ data, onWorkoutClick, selectedExercise, onExerciseSelect }: ExerciseAnalyzerProps) => {
  const [chartType, setChartType] = useState<"progression" | "volume">("progression");

  const exerciseData: ExerciseData = useMemo(() => {
    const processedData: ExerciseData = {};

    data.forEach((row) => {
      const exercise = row["Exercise Name"];
      if (!exercise) return;

      if (!processedData[exercise]) {
        processedData[exercise] = {
          sets: [],
          maxWeight: 0,
          maxWeightReps: 0,
          maxWeightDate: "",
          maxVolume: 0,
          maxVolumeWeight: 0,
          maxVolumeReps: 0,
          maxVolumeDate: "",
          lastUsed: new Date(0),
        };
      }

      const date = new Date(row["Date"]);
      const set: ExerciseSet = {
        date: row["Date"],
        workout: row["Workout Name"],
        exercise: exercise,
        setNumber: parseInt(row["Set Order"] || "1"),
        weight: parseFloat(row["Weight"] || "0"),
        unit: row["Weight Unit"] || "kg",
        reps: parseInt(row["Reps"] || "0"),
        duration: row["Duration"] || "",
      };

      const setVolume = set.weight * set.reps;
      processedData[exercise].sets.push(set);

      if (set.weight > processedData[exercise].maxWeight) {
        processedData[exercise].maxWeight = set.weight;
        processedData[exercise].maxWeightReps = set.reps;
        processedData[exercise].maxWeightDate = set.date;
      }

      if (setVolume > processedData[exercise].maxVolume) {
        processedData[exercise].maxVolume = setVolume;
        processedData[exercise].maxVolumeWeight = set.weight;
        processedData[exercise].maxVolumeReps = set.reps;
        processedData[exercise].maxVolumeDate = set.date;
      }

      if (date > processedData[exercise].lastUsed) {
        processedData[exercise].lastUsed = date;
      }
    });

    console.log("Processed Exercise Data:", processedData);
    return processedData;
  }, [data]);

  console.log("Raw Data:", data);
  console.log("Available Exercises:", Object.keys(exerciseData));

  // Sort exercises by most recent use
  const sortedExercises = useMemo(() => {
    return Object.entries(exerciseData)
      .sort(([, a], [, b]) => b.lastUsed.getTime() - a.lastUsed.getTime())
      .map(([name]) => name);
  }, [exerciseData]);

  const chartData = useMemo(() => {
    if (!selectedExercise) return [];

    const exercise = exerciseData[selectedExercise];
    if (!exercise) return [];

    // Group sets by date
    const dateGroups = new Map<string, ExerciseSet[]>();
    exercise.sets.forEach((set) => {
      const existingSets = dateGroups.get(set.date) || [];
      dateGroups.set(set.date, [...existingSets, set]);
    });

    // Create chart data points
    const data: ChartDataPoint[] = Array.from(dateGroups.entries())
      .map(([date, sets]) => {
        // Find the top weight set for this date
        const topSet = sets.reduce((max, set) => (set.weight > max.weight ? set : max), sets[0]);

        // Calculate total volume for this date
        const volume = sets.reduce((total, set) => total + set.weight * set.reps, 0);

        return {
          date,
          weight: topSet.weight,
          volume,
          sets: sets,
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return data;
  }, [selectedExercise, exerciseData]);

  // Group sets by date for the selected exercise
  const groupedSets = useMemo(() => {
    if (!selectedExercise) return new Map<string, ExerciseSet[]>();

    const groups = new Map<string, ExerciseSet[]>();
    exerciseData[selectedExercise].sets.forEach((set) => {
      const existingSets = groups.get(set.date) || [];
      groups.set(set.date, [...existingSets, set]);
    });

    // Convert to array and sort by date (most recent first)
    return new Map(Array.from(groups.entries()).sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime()));
  }, [selectedExercise, exerciseData]);

  return (
    <div className="p-2 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center">
        <select className="w-full sm:w-auto border rounded p-2 bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base" value={selectedExercise} onChange={(e) => onExerciseSelect(e.target.value)}>
          <option value="">Select Exercise</option>
          {sortedExercises.map((exercise) => (
            <option key={exercise} value={exercise}>
              {exercise} ({new Date(exerciseData[exercise].lastUsed).toLocaleDateString()})
            </option>
          ))}
        </select>

        <select className="w-full sm:w-auto border rounded p-2 bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base" value={chartType} onChange={(e) => setChartType(e.target.value as "progression" | "volume")}>
          <option value="progression">Weight Progression</option>
          <option value="volume">Volume Over Time</option>
        </select>
      </div>

      {selectedExercise && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-gray-200">Max Weight</h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-400">
                {exerciseData[selectedExercise].maxWeight} kg × {exerciseData[selectedExercise].maxWeightReps} reps
              </p>
              {exerciseData[selectedExercise].maxWeightDate && (
                <button onClick={() => onWorkoutClick(exerciseData[selectedExercise].maxWeightDate)} className="text-sm text-gray-400 hover:text-blue-400 transition-colors mt-1">
                  {new Date(exerciseData[selectedExercise].maxWeightDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </button>
              )}
            </div>
            <div className="p-3 sm:p-4 bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-gray-200">Max Volume (Single Set)</h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-400">
                {exerciseData[selectedExercise].maxVolume} kg ({exerciseData[selectedExercise].maxVolumeWeight} kg × {exerciseData[selectedExercise].maxVolumeReps} reps)
              </p>
              {exerciseData[selectedExercise].maxVolumeDate && (
                <button onClick={() => onWorkoutClick(exerciseData[selectedExercise].maxVolumeDate)} className="text-sm text-gray-400 hover:text-blue-400 transition-colors mt-1">
                  {new Date(exerciseData[selectedExercise].maxVolumeDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </button>
              )}
            </div>
            <div className="p-3 sm:p-4 bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-gray-200">Total Sets</h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-400">{exerciseData[selectedExercise].sets.length}</p>
            </div>
          </div>

          <div className="h-[300px] sm:h-[400px] w-full bg-gray-700 p-2 sm:p-4 border border-gray-600 rounded-lg shadow-lg">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "progression" ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                  <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fill: "#9CA3AF", fontSize: "12px" }} tickFormatter={(date) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} minTickGap={30} />
                  <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF", fontSize: "12px" }} domain={["dataMin - 5", "dataMax + 5"]} tickFormatter={(value) => `${value}kg`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{
                      color: "#9CA3AF",
                      fontSize: "12px",
                      paddingTop: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#60A5FA" strokeWidth={2} name="Weight (kg)" dot={{ fill: "#60A5FA", stroke: "#60A5FA", r: 3 }} activeDot={{ r: 5, fill: "#2563EB" }} />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                  <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fill: "#9CA3AF", fontSize: "12px" }} tickFormatter={(date) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} minTickGap={30} />
                  <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF", fontSize: "12px" }} tickFormatter={(value) => `${value}kg`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{
                      color: "#9CA3AF",
                      fontSize: "12px",
                      paddingTop: "8px",
                    }}
                  />
                  <Bar dataKey="volume" fill="#60A5FA" name="Total Volume (kg)" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold text-white">Set History</h3>
            {Array.from(groupedSets.entries()).map(([date, sets]) => (
              <div key={date} className="bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
                <div onClick={() => onWorkoutClick(date)} className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-750 border-b border-gray-600 rounded-t-lg cursor-pointer hover:bg-gray-700 transition-colors group">
                  <h4 className="font-semibold text-sm sm:text-base text-white group-hover:text-blue-400">
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h4>
                </div>
                <div className="p-2 sm:p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                    {sets.map((set, index) => (
                      <div key={index} className="p-2 sm:p-3 bg-gray-800 rounded-lg">
                        <div className="text-xs sm:text-sm text-gray-400">Set {set.setNumber}</div>
                        <div className="font-semibold text-sm sm:text-base text-white">
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

export default ExerciseAnalyzer;
