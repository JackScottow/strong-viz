"use client";

import { useState, useEffect, useMemo } from "react";
import CsvUploader from "@/components/CsvUploader";
import ExerciseAnalyzer from "@/components/ExerciseAnalyzer";
import WorkoutAnalyzer from "@/components/WorkoutAnalyzer";
import { StrongCSVRow, StrongCSVLegacyRow } from "@/types/exercise";

type Tab = "exercise" | "workout";

export default function Home() {
  const [data, setData] = useState<(StrongCSVRow | StrongCSVLegacyRow)[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("exercise");
  const [selectedWorkoutDate, setSelectedWorkoutDate] = useState<Date | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string>("");

  // Process data using useMemo
  const processedData = useMemo(() => {
    if (data.length === 0) return [];

    // Detect version based on first row structure
    const isLegacy = "Workout #" in data[0];

    return data.map((row) => {
      if (isLegacy) {
        const legacyRow = row as StrongCSVLegacyRow;
        const processed = {
          Date: legacyRow.Date,
          "Workout Name": `Workout ${legacyRow["Workout #"]}`,
          "Exercise Name": legacyRow["Exercise Name"],
          "Set Order": legacyRow["Set Order"],
          Weight: legacyRow.Weight,
          "Weight Unit": legacyRow["Weight Unit"],
          Reps: legacyRow.Reps,
          Duration: legacyRow.Duration,
          Notes: legacyRow.Notes || "",
        } as StrongCSVRow;
        return processed;
      }

      // For current format, ensure Weight and Reps are preserved as-is
      const currentRow = row as StrongCSVRow;
      return currentRow;
    });
  }, [data]);

  // Memoize the sorted dates and exercises
  const { sortedDates, mostRecentExercise } = useMemo(() => {
    if (processedData.length === 0) {
      return { sortedDates: [], mostRecentExercise: null };
    }

    const dates = [...new Set(processedData.map((row) => row.Date))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const exerciseDates = processedData.reduce((acc, row) => {
      const date = new Date(row.Date);
      const exercise = row["Exercise Name"];
      if (!acc[exercise] || date > acc[exercise]) {
        acc[exercise] = date;
      }
      return acc;
    }, {} as Record<string, Date>);

    const recentExercise = Object.entries(exerciseDates).sort(([, a], [, b]) => b.getTime() - a.getTime())[0]?.[0];

    return { sortedDates: dates, mostRecentExercise: recentExercise };
  }, [processedData]);

  // Set default selections when data changes
  useEffect(() => {
    if (sortedDates.length > 0) {
      const mostRecentDate = new Date(sortedDates[0]);
      mostRecentDate.setHours(0, 0, 0, 0);
      setSelectedWorkoutDate(mostRecentDate);
    }

    if (mostRecentExercise) {
      setSelectedExercise(mostRecentExercise);
    }
  }, [sortedDates, mostRecentExercise]);

  const handleWorkoutClick = (date: string) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    setSelectedWorkoutDate(newDate);
    setActiveTab("workout");
  };

  const handleExerciseClick = (exerciseName: string) => {
    setSelectedExercise(exerciseName);
    setActiveTab("exercise");
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6 sm:space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-primary-dark">Strong-Viz</h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">Upload your Strong App workout data to analyze your progress, track personal records, and gain insights into your training history with beautiful interactive charts.</p>
        </div>

        <div className="space-y-3 sm:space-y-4 bg-card p-4 sm:p-6 rounded-lg shadow-lg border border-border">
          <CsvUploader onDataLoaded={setData} hasData={data.length > 0} />
        </div>

        {data.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-card rounded-lg p-2">
              <nav className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTab("exercise")}
                  className={`
                    py-3 px-4 rounded-lg font-medium text-sm sm:text-base transition-all
                    flex items-center justify-center gap-2
                    ${activeTab === "exercise" ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-secondary text-gray-300 hover:bg-secondary/80"}
                  `}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3Z" />
                  </svg>
                  Exercise Analysis
                </button>
                <button
                  onClick={() => setActiveTab("workout")}
                  className={`
                    py-3 px-4 rounded-lg font-medium text-sm sm:text-base transition-all
                    flex items-center justify-center gap-2
                    ${activeTab === "workout" ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-secondary text-gray-300 hover:bg-secondary/80"}
                  `}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  Workout History
                </button>
              </nav>
            </div>

            <div className="bg-card rounded-lg shadow-lg border border-border">{activeTab === "exercise" ? <ExerciseAnalyzer data={processedData} onWorkoutClick={handleWorkoutClick} selectedExercise={selectedExercise} onExerciseSelect={setSelectedExercise} /> : <WorkoutAnalyzer data={processedData} selectedDate={selectedWorkoutDate} onDateChange={setSelectedWorkoutDate} onExerciseClick={handleExerciseClick} />}</div>
          </div>
        )}
      </div>
    </main>
  );
}
