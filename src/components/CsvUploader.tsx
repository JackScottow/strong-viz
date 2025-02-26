import { useCallback, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { StrongCSVRow } from "@/types/exercise";
import { sampleData } from "@/data/sampleData";
import { motion } from "framer-motion";

interface CsvUploaderProps {
  onDataLoaded: (data: StrongCSVRow[]) => void;
  hasData: boolean;
}

const CsvUploader = ({ onDataLoaded, hasData }: CsvUploaderProps) => {
  const [isExpanded, setIsExpanded] = useState(!hasData);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
              Notes: "Notes",
            };
            return headerMap[cleanHeader] || cleanHeader;
          },
          complete: (results) => {
            onDataLoaded(results.data as StrongCSVRow[]);
            setIsExpanded(false);
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
    setIsExpanded(false);
  };

  return (
    <div className="w-full">
      {!isExpanded && hasData && (
        <div className="flex justify-center">
          <button onClick={() => setIsExpanded(true)} className="h-10 flex items-center gap-2 px-4 text-sm font-medium text-white transition-colors bg-primary rounded-md hover:bg-primary-dark">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Change Data
          </button>
        </div>
      )}

      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
          ease: "easeInOut",
        }}
        className="overflow-hidden">
        <div>
          {/* Mobile version */}
          <div className="sm:hidden flex flex-col gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
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
                        Notes: "Notes",
                      };
                      return headerMap[cleanHeader] || cleanHeader;
                    },
                    complete: (results) => {
                      onDataLoaded(results.data as StrongCSVRow[]);
                      setIsExpanded(false);
                    },
                  });
                }
              }}
              className="hidden"
              accept=".csv"
            />
            <button onClick={() => fileInputRef.current?.click()} className="w-full h-10 px-4 text-sm font-medium text-white transition-colors bg-primary rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" />
              </svg>
              Select CSV File
            </button>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px bg-gray-700 flex-1"></div>
              <span className="text-sm text-gray-400">or</span>
              <div className="h-px bg-gray-700 flex-1"></div>
            </div>
            <button onClick={handleLoadDemoData} className="w-full h-10 px-4 text-sm font-medium text-white transition-colors bg-primary rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Try Demo Data
            </button>
          </div>

          {/* Desktop version */}
          <div className="hidden sm:block">
            <div {...getRootProps()} className={`p-6 border-2 border-dashed rounded-lg ${isDragActive ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-gray-300 dark:border-border"}`}>
              <input {...getInputProps()} />
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex flex-col items-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium">Upload Strong App CSV</p>
                  <p className="text-xs">Drop file here or click to browse</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col items-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="h-px bg-gray-700 w-12"></div>
                <span className="text-sm text-gray-400">or</span>
                <div className="h-px bg-gray-700 w-12"></div>
              </div>

              <button onClick={handleLoadDemoData} className="inline-flex items-center justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Try Demo Data
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CsvUploader;
