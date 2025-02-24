import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { StrongCSVRow } from "@/types/exercise";
import { sampleData } from "@/data/sampleData";

interface CsvUploaderProps {
  onDataLoaded: (data: StrongCSVRow[]) => void;
}

const CsvUploader = ({ onDataLoaded }: CsvUploaderProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        Papa.parse(file, {
          header: true,
          delimiter: ";",
          transformHeader: (header: string) => {
            const cleanHeader = header.replace(/"/g, "");
            const headerMap: { [key: string]: string } = {
              Date: "Date",
              "Workout Name": "Workout Name",
              "Exercise Name": "Exercise Name",
              "Set Order": "Set Order",
              "Weight (kg)": "Weight",
              Reps: "Reps",
              "Duration (sec)": "Duration",
            };
            return headerMap[cleanHeader] || cleanHeader;
          },
          complete: (results) => {
            onDataLoaded(results.data as StrongCSVRow[]);
          },
        });
      }
    },
    [onDataLoaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
  });

  const handleLoadDemoData = () => {
    onDataLoaded(sampleData);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
          ${isDragActive ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-blue-500 hover:bg-blue-500/10"}`}>
        <input {...getInputProps()} />
        {isDragActive ? <p className="text-blue-400">Drop your Strong App CSV file here...</p> : <p className="text-gray-400">Drag and drop your Strong App CSV file here, or click to select</p>}
      </div>

      <div className="flex justify-center">
        <div className="relative group">
          <button onClick={handleLoadDemoData} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Try Demo Data
          </button>
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 p-2 bg-gray-800 text-xs text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Load sample workout data to explore the app&apos;s features</div>
        </div>
      </div>
    </div>
  );
};

export default CsvUploader;
