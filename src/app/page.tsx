"use client";

import { useState } from "react";
import CsvUploader from "@/components/CsvUploader";
import ExerciseAnalyzer from "@/components/ExerciseAnalyzer";
import WorkoutAnalyzer from "@/components/WorkoutAnalyzer";

type Tab = "exercise" | "workout";

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("exercise");
  const [selectedWorkoutDate, setSelectedWorkoutDate] = useState<Date | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string>("");

  const handleWorkoutClick = (date: string) => {
    // Create date at start of day in local timezone to avoid time-of-day mismatches
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
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        <h1 className="text-4xl font-bold text-center text-white">Exercise Data Analyzer</h1>

        <div className="space-y-4 bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white">Upload your Strong App CSV export</h2>
          <CsvUploader onDataLoaded={setData} />
        </div>

        {data.length > 0 && (
          <div className="space-y-6">
            <div className="border-b border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("exercise")}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === "exercise" ? "border-blue-500 text-blue-400" : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"}
                  `}>
                  By Exercise
                </button>
                <button
                  onClick={() => setActiveTab("workout")}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === "workout" ? "border-blue-500 text-blue-400" : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"}
                  `}>
                  By Workout Date
                </button>
              </nav>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">{activeTab === "exercise" ? <ExerciseAnalyzer data={data} onWorkoutClick={handleWorkoutClick} selectedExercise={selectedExercise} onExerciseSelect={setSelectedExercise} /> : <WorkoutAnalyzer data={data} selectedDate={selectedWorkoutDate} onDateChange={setSelectedWorkoutDate} onExerciseClick={handleExerciseClick} />}</div>
          </div>
        )}
      </div>
    </main>
  );
}
