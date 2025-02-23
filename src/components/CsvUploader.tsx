import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";

interface CsvUploaderProps {
  onDataLoaded: (data: any[]) => void;
}

const CsvUploader = ({ onDataLoaded }: CsvUploaderProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      Papa.parse(file, {
        complete: (results) => {
          console.log("CSV Parse Results:", results);
          if (results.data && Array.isArray(results.data)) {
            // Filter out any empty rows
            const cleanData = results.data.filter((row) => row && typeof row === "object" && Object.keys(row).length > 0);
            console.log("Cleaned Data:", cleanData);
            onDataLoaded(cleanData);
          }
        },
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
          // Remove any BOM characters and trim whitespace
          return header.trim().replace(/^\uFEFF/, "");
        },
      });
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

  return (
    <div
      {...getRootProps()}
      className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
        ${isDragActive ? "border-blue-500 bg-blue-500/10 text-blue-400" : "border-gray-600 hover:border-blue-500 text-gray-400 hover:text-blue-400"}`}>
      <input {...getInputProps()} />
      {isDragActive ? <p className="text-blue-400">Drop the CSV file here...</p> : <p className="text-gray-400 hover:text-blue-400">Drag and drop a CSV file here, or click to select a file</p>}
    </div>
  );
};

export default CsvUploader;
