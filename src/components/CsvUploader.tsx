import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { StrongCSVRow } from "@/types/exercise";

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

  return (
    <div
      {...getRootProps()}
      className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
        ${isDragActive ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-blue-500 hover:bg-blue-500/10"}`}>
      <input {...getInputProps()} />
      {isDragActive ? <p className="text-blue-400">Drop your Strong App CSV file here...</p> : <p className="text-gray-400">Drag and drop your Strong App CSV file here, or click to select</p>}
    </div>
  );
};

export default CsvUploader;
