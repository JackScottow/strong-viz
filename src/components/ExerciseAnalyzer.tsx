import { useState, useMemo, useEffect, useRef } from "react";
import { ExerciseData, ExerciseSet, StrongCSVRow } from "@/types/exercise";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

interface ExerciseAnalyzerProps {
  data: StrongCSVRow[];
  onWorkoutClick: (date: string) => void;
  selectedExercise: string;
  onExerciseSelect: (exercise: string) => void;
}

interface ChartDataPoint {
  date: string;
  weight: number;
  volume: number;
  sets: ExerciseSet[];
  totalVolume: number;
}

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  chartType: "progression" | "volume";
}

const CustomTooltip = ({ active, payload, label, chartType }: CustomTooltipProps) => {
  if (!active || !payload || !payload[0]) return null;

  const sets: ExerciseSet[] = (payload[0].payload as ChartDataPoint).sets;
  // Sort sets by set number to maintain order
  const sortedSets = [...sets].sort((a, b) => a.setNumber - b.setNumber);

  // Collect all unique notes for this date
  const dateNotes = [...new Set(sets.map((set) => set.notes).filter(Boolean))];

  // Find the top weight set
  const topWeightSet = sets.reduce((max, set) => (set.weight > max.weight ? set : max), sets[0]);

  // Calculate total volume for all sets
  const totalVolume = sets.reduce((sum, set) => sum + set.weight * set.reps, 0);

  // Use the appropriate top set based on chart type
  const topSet = chartType === "volume" ? topWeightSet : topWeightSet;

  return (
    <div className="bg-card p-3 border border-border rounded-lg shadow-lg">
      <p className="font-semibold text-white mb-2 text-center">
        {new Date(label).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </p>
      {dateNotes.length > 0 && <p className="text-xs text-gray-400 mb-2 italic">{dateNotes.join(" • ")}</p>}
      <div className="bg-primary/10 border border-primary/20 rounded px-2 py-1 mb-2">
        {chartType === "volume" ? (
          <>
            <p className="text-sm text-white font-medium text-center">Total Volume: {totalVolume} kg</p>
          </>
        ) : (
          <>
            <p className="text-sm text-white font-medium text-center">Top Weight: {topSet.weight} kg</p>
          </>
        )}
      </div>
      <div className="space-y-1">
        {sortedSets.map((set, index) => (
          <p key={index} className={`${set.weight === topSet.weight && set.reps === topSet.reps && chartType !== "volume" ? "font-semibold text-primary-light" : "text-gray-300"}`}>
            Set {set.setNumber}: {set.weight} kg × {set.reps} reps
          </p>
        ))}
      </div>
    </div>
  );
};

const ExerciseAnalyzer = ({ data, onWorkoutClick, selectedExercise, onExerciseSelect }: ExerciseAnalyzerProps) => {
  const [chartType, setChartType] = useState<"progression" | "volume">("progression");
  const [sortType, setSortType] = useState<"recent" | "alphabetical">("recent");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const exerciseData: ExerciseData = useMemo(() => {
    const processedData: ExerciseData = {};

    data.forEach((row) => {
      const exercise = row["Exercise Name"];
      const setOrder = row["Set Order"];
      if (!exercise) return;
      if (setOrder && setOrder.toString().includes("Rest Timer")) return;

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
          max1RM: 0,
          max1RMWeight: 0,
          max1RMReps: 0,
          max1RMDate: "",
          lastUsed: new Date(0),
        };
      }

      const date = new Date(row["Date"] || "");

      // Enhanced weight handling
      const weightStr = row["Weight"] || row["Weight (kg)"];
      let weight = 0;

      if (weightStr !== undefined && weightStr !== "" && weightStr !== '""') {
        // Remove quotes and try direct number conversion
        const cleanWeightStr = weightStr.toString().replace(/"/g, "");
        weight = Number(cleanWeightStr);

        // If that fails, try cleaning and parsing
        if (isNaN(weight)) {
          // Remove any non-numeric characters except dots and minus signs
          const cleanWeight = cleanWeightStr.replace(/[^\d.-]/g, "");
          weight = parseFloat(cleanWeight);

          // If still NaN, try one more time with stricter cleaning
          if (isNaN(weight)) {
            const strictClean = cleanWeightStr.match(/[-]?\d+\.?\d*/);
            weight = strictClean ? parseFloat(strictClean[0]) : 0;
          }
        }
      }

      // Enhanced reps handling
      const repsStr = row["Reps"];
      let reps = 0;

      if (repsStr !== undefined && repsStr !== "" && repsStr !== '""') {
        // Remove quotes and try direct number conversion
        const cleanRepsStr = repsStr.toString().replace(/"/g, "");
        reps = Number(cleanRepsStr);

        // If that fails, try cleaning and parsing
        if (isNaN(reps)) {
          const cleanReps = cleanRepsStr.replace(/[^\d]/g, "");
          reps = parseInt(cleanReps);

          // If still NaN, try one more time with stricter cleaning
          if (isNaN(reps)) {
            const strictClean = cleanRepsStr.match(/\d+/);
            reps = strictClean ? parseInt(strictClean[0]) : 0;
          }
        }
      }

      const set: ExerciseSet = {
        date: row["Date"] || "",
        workout: row["Workout Name"] || "",
        exercise: exercise,
        setNumber: parseInt((row["Set Order"] || "1").toString()) || 1,
        weight: weight,
        unit: row["Weight Unit"] || "kg",
        reps: reps,
        duration: row["Duration"] || "",
        notes: row["Notes"] || "",
      };

      const setVolume = set.weight * set.reps;
      processedData[exercise].sets.push(set);

      // Only consider sets with reps > 0 for PRs
      if (set.reps > 0) {
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

        // Calculate and track 1RM PR
        if (set.reps <= 15) {
          const estimated1RM = set.weight * (36 / (37 - set.reps));
          if (estimated1RM > processedData[exercise].max1RM) {
            processedData[exercise].max1RM = estimated1RM;
            processedData[exercise].max1RMWeight = set.weight;
            processedData[exercise].max1RMReps = set.reps;
            processedData[exercise].max1RMDate = set.date;
          }
        }
      }

      if (date > processedData[exercise].lastUsed) {
        processedData[exercise].lastUsed = date;
      }
    });

    return processedData;
  }, [data]);

  // Filter and sort exercises based on search query and sort type
  const filteredAndSortedExercises = useMemo(() => {
    // First filter by search query
    const filtered = searchQuery ? Object.keys(exerciseData).filter((name) => name.toLowerCase().includes(searchQuery.toLowerCase())) : Object.keys(exerciseData);

    // Then sort based on selected sort type
    if (sortType === "alphabetical") {
      return filtered.sort((a, b) => a.localeCompare(b));
    } else {
      return filtered.sort((a, b) => exerciseData[b].lastUsed.getTime() - exerciseData[a].lastUsed.getTime());
    }
  }, [exerciseData, sortType, searchQuery]);

  // Reset selected exercise if it doesn't exist in the current data
  useEffect(() => {
    if (selectedExercise && !exerciseData[selectedExercise]) {
      onExerciseSelect("");
    }
  }, [selectedExercise, exerciseData, onExerciseSelect]);

  const chartData = useMemo(() => {
    if (!selectedExercise || !exerciseData[selectedExercise]) return [];

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
        const topWeightSet = sets.reduce((max, set) => (set.weight > max.weight ? set : max), sets[0]);

        // Calculate total volume for all sets on this date
        const totalVolume = sets.reduce((sum, set) => sum + set.weight * set.reps, 0);

        return {
          date,
          weight: topWeightSet.weight,
          volume: totalVolume,
          sets: sets,
          totalVolume: totalVolume,
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return data;
  }, [selectedExercise, exerciseData]);

  // Group sets by date for the selected exercise
  const groupedSets = useMemo(() => {
    if (!selectedExercise || !exerciseData[selectedExercise]) return new Map<string, ExerciseSet[]>();

    const groups = new Map<string, ExerciseSet[]>();
    exerciseData[selectedExercise].sets.forEach((set) => {
      const existingSets = groups.get(set.date) || [];
      groups.set(set.date, [...existingSets, set]);
    });

    // Convert to array and sort by date (most recent first)
    return new Map(Array.from(groups.entries()).sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime()));
  }, [selectedExercise, exerciseData]);

  // If no exercise is selected or the selected exercise doesn't exist, show only the dropdown
  if (!selectedExercise || !exerciseData[selectedExercise]) {
    return (
      <div className="p-2 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-2 sm:gap-4">
          <div className="relative">
            <div className="flex items-stretch">
              <input type="text" placeholder="Search or select exercise..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setIsDropdownOpen(true)} className="w-full border rounded-l p-2 bg-secondary text-white border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm sm:text-base" />
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="bg-secondary border border-l-0 border-border rounded-r px-3 text-gray-300 hover:bg-secondary/80 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredAndSortedExercises.length > 0 ? (
                  filteredAndSortedExercises.map((exercise) => (
                    <div
                      key={exercise}
                      className={`p-2 hover:bg-secondary cursor-pointer text-sm ${exercise === selectedExercise ? "bg-primary/20 text-primary-light" : "text-white"}`}
                      onClick={() => {
                        onExerciseSelect(exercise);
                        setSearchQuery("");
                        setIsDropdownOpen(false);
                      }}>
                      {exercise} {sortType === "recent" && `(${new Date(exerciseData[exercise].lastUsed).toLocaleDateString()})`}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-400 text-sm">No exercises found</div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setSortType("recent")} className={`px-2 py-2 rounded text-xs sm:text-sm min-w-[70px] text-center h-full ${sortType === "recent" ? "bg-primary text-white" : "bg-secondary text-gray-300 border border-border hover:bg-secondary/80"}`}>
              Recent
            </button>
            <button onClick={() => setSortType("alphabetical")} className={`px-2 py-2 rounded text-xs sm:text-sm min-w-[70px] text-center h-full ${sortType === "alphabetical" ? "bg-primary text-white" : "bg-secondary text-gray-300 border border-border hover:bg-secondary/80"}`}>
              A-Z
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">
            <span className="inline-block bg-primary/20 text-primary-light p-1 rounded mr-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            Select an exercise to view weight progression, volume charts, and set history
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:gap-4">
        <div className="flex flex-row gap-2 items-stretch">
          <div className="flex-grow relative" ref={dropdownRef}>
            <div className="flex items-stretch">
              <input type="text" placeholder="Search exercises..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setIsDropdownOpen(true)} className="w-full border rounded-l p-2 bg-secondary text-white border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm sm:text-base" />
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="bg-secondary border border-l-0 border-border rounded-r px-3 text-gray-300 hover:bg-secondary/80 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredAndSortedExercises.length > 0 ? (
                  filteredAndSortedExercises.map((exercise) => (
                    <div
                      key={exercise}
                      className={`p-2 hover:bg-secondary cursor-pointer text-sm ${exercise === selectedExercise ? "bg-primary/20 text-primary-light" : "text-white"}`}
                      onClick={() => {
                        onExerciseSelect(exercise);
                        setSearchQuery("");
                        setIsDropdownOpen(false);
                      }}>
                      {exercise} {sortType === "recent" && `(${new Date(exerciseData[exercise].lastUsed).toLocaleDateString()})`}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-400 text-sm">No exercises found</div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setSortType("recent")} className={`px-2 py-2 rounded text-xs sm:text-sm min-w-[70px] text-center h-full ${sortType === "recent" ? "bg-primary text-white" : "bg-secondary text-gray-300 border border-border hover:bg-secondary/80"}`}>
              Recent
            </button>
            <button onClick={() => setSortType("alphabetical")} className={`px-2 py-2 rounded text-xs sm:text-sm min-w-[70px] text-center h-full ${sortType === "alphabetical" ? "bg-primary text-white" : "bg-secondary text-gray-300 border border-border hover:bg-secondary/80"}`}>
              A-Z
            </button>
          </div>
        </div>

        {/* Add a prominent display of the selected exercise */}
        <div className="bg-secondary border border-border rounded-lg p-3 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white mx-auto">{selectedExercise}</h2>
        </div>
      </div>

      {selectedExercise && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-secondary border border-border rounded-lg shadow-lg">
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-gray-200">Max Weight</h3>
              <p className="text-xl sm:text-2xl font-bold text-primary-light">
                {exerciseData[selectedExercise].maxWeight} kg × {exerciseData[selectedExercise].maxWeightReps} reps
              </p>
              {exerciseData[selectedExercise].maxWeightDate && (
                <button onClick={() => onWorkoutClick(exerciseData[selectedExercise].maxWeightDate)} className="text-sm text-gray-400 hover:text-primary-light transition-colors mt-1">
                  {new Date(exerciseData[selectedExercise].maxWeightDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </button>
              )}
            </div>
            <div className="p-3 sm:p-4 bg-secondary border border-border rounded-lg shadow-lg">
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-gray-200">Max Volume (Single Set)</h3>
              <p className="text-xl sm:text-2xl font-bold text-primary-light">
                {exerciseData[selectedExercise].maxVolume} kg ({exerciseData[selectedExercise].maxVolumeWeight} kg × {exerciseData[selectedExercise].maxVolumeReps} reps)
              </p>
              {exerciseData[selectedExercise].maxVolumeDate && (
                <button onClick={() => onWorkoutClick(exerciseData[selectedExercise].maxVolumeDate)} className="text-sm text-gray-400 hover:text-primary-light transition-colors mt-1">
                  {new Date(exerciseData[selectedExercise].maxVolumeDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </button>
              )}
            </div>
            <div className="p-3 sm:p-4 bg-secondary border border-border rounded-lg shadow-lg">
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-gray-200">Estimated 1RM</h3>
              {(() => {
                // Find the set that would give the highest estimated 1RM
                const maxEstimated1RM = exerciseData[selectedExercise].sets.reduce(
                  (max, set) => {
                    if (set.reps === 0 || set.reps > 15) return max; // Skip failed sets and sets with too many reps
                    const estimated1RM = set.weight * (36 / (37 - set.reps));
                    return estimated1RM > max.value ? { value: estimated1RM, set } : max;
                  },
                  { value: 0, set: null as ExerciseSet | null }
                );

                if (!maxEstimated1RM.set) return <p className="text-xl sm:text-2xl font-bold text-primary-light">N/A</p>;

                return (
                  <>
                    <p className="text-xl sm:text-2xl font-bold text-primary-light">{Math.round(maxEstimated1RM.value)} kg</p>
                    <p className="text-sm text-gray-400">
                      Based on {maxEstimated1RM.set.weight} kg × {maxEstimated1RM.set.reps} reps
                    </p>
                    <button onClick={() => onWorkoutClick(maxEstimated1RM.set!.date)} className="text-sm text-gray-400 hover:text-primary-light transition-colors mt-1">
                      {new Date(maxEstimated1RM.set.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </button>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="bg-secondary p-2 sm:p-4 border border-border rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-200">Progress Chart</h3>
              <select className="border rounded p-1 sm:p-2 bg-card text-white border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm" value={chartType} onChange={(e) => setChartType(e.target.value as "progression" | "volume")}>
                <option value="progression">Weight Progression</option>
                <option value="volume">Volume Over Time</option>
              </select>
            </div>
            <div className="h-[300px] sm:h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "progression" ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                    <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fill: "#9CA3AF", fontSize: "12px" }} tickFormatter={(date) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} minTickGap={30} />
                    <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF", fontSize: "12px" }} domain={["auto", "dataMax"]} padding={{ top: 0, bottom: 10 }} tickCount={6} tickFormatter={(value) => `${value}kg`} />
                    <Tooltip content={<CustomTooltip chartType={chartType} />} />
                    <Legend
                      wrapperStyle={{
                        color: "#9CA3AF",
                        fontSize: "12px",
                        paddingTop: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="weight" stroke="#a855f7" strokeWidth={2} name="Weight (kg)" dot={{ fill: "#a855f7", stroke: "#a855f7", r: 3 }} activeDot={{ r: 5, fill: "#7e22ce" }} />
                  </LineChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                    <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fill: "#9CA3AF", fontSize: "12px" }} tickFormatter={(date) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} minTickGap={30} />
                    <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF", fontSize: "12px" }} domain={["auto", "auto"]} padding={{ top: 0, bottom: 10 }} tickCount={6} tickFormatter={(value) => `${value}kg`} />
                    <Tooltip content={<CustomTooltip chartType={chartType} />} />
                    <Legend
                      wrapperStyle={{
                        color: "#9CA3AF",
                        fontSize: "12px",
                        paddingTop: "8px",
                      }}
                    />
                    <Bar dataKey="volume" fill="#a855f7" name="Total Volume (kg)" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold text-white">Set History</h3>
            {Array.from(groupedSets.entries()).map(([date, sets]) => {
              // Collect all unique notes for this date
              const dateNotes = [...new Set(sets.map((set) => set.notes).filter(Boolean))];

              return (
                <div key={date} className="bg-secondary border border-border rounded-lg shadow-lg">
                  <div onClick={() => onWorkoutClick(date)} className="px-3 sm:px-4 py-2 sm:py-3 bg-secondary/80 border-b border-border rounded-t-lg cursor-pointer hover:bg-secondary transition-colors group">
                    <h4 className="font-semibold text-sm sm:text-base text-white group-hover:text-primary-light">
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </h4>
                    {dateNotes.length > 0 && <div className="text-xs text-gray-400 mt-1 italic">{dateNotes.join(" • ")}</div>}
                  </div>
                  <div className="p-2 sm:p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                      {sets.map((set, index) => {
                        const isWeightPR = set.date === exerciseData[selectedExercise].maxWeightDate && set.weight === exerciseData[selectedExercise].maxWeight && set.reps === exerciseData[selectedExercise].maxWeightReps;
                        const isVolumePR = set.date === exerciseData[selectedExercise].maxVolumeDate && set.weight === exerciseData[selectedExercise].maxVolumeWeight && set.reps === exerciseData[selectedExercise].maxVolumeReps;
                        const is1RMPR = set.date === exerciseData[selectedExercise].max1RMDate && set.weight === exerciseData[selectedExercise].max1RMWeight && set.reps === exerciseData[selectedExercise].max1RMReps;
                        return (
                          <div key={index} className="p-2 sm:p-3 bg-card rounded-lg relative">
                            <div className="text-xs sm:text-sm text-gray-400">Set {set.setNumber}</div>
                            <div className="font-semibold text-sm sm:text-base text-white">
                              {set.weight} kg × {set.reps}
                            </div>
                            {(isWeightPR || isVolumePR || is1RMPR) && (
                              <div className="absolute top-0 bottom-0 right-1 flex gap-1 items-center h-full">
                                {isWeightPR && (
                                  <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-md" title="Weight PR">
                                    W
                                  </span>
                                )}
                                {isVolumePR && (
                                  <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-md" title="Volume PR">
                                    V
                                  </span>
                                )}
                                {is1RMPR && (
                                  <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-md" title="1RM PR">
                                    1RM
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseAnalyzer;
