import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

interface DataVisualizerProps {
  data: any[];
}

const DataVisualizer = ({ data }: DataVisualizerProps) => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  const columns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter((key) => !isNaN(Number(data[0][key])) && key !== "");
  }, [data]);

  const chartData = useMemo(() => {
    return data.slice(0, 50); // Limit to first 50 rows for better visualization
  }, [data]);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <select className="border rounded p-2" value={chartType} onChange={(e) => setChartType(e.target.value as "bar" | "line")}>
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
        </select>

        <div className="flex gap-2 flex-wrap">
          {columns.map((column) => (
            <label key={column} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={selectedColumns.includes(column)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedColumns([...selectedColumns, column]);
                  } else {
                    setSelectedColumns(selectedColumns.filter((col) => col !== column));
                  }
                }}
              />
              {column}
            </label>
          ))}
        </div>
      </div>

      {selectedColumns.length > 0 && (
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={Object.keys(data[0])[0]} />
                <YAxis />
                <Tooltip />
                <Legend />
                {selectedColumns.map((column, index) => (
                  <Bar key={column} dataKey={column} fill={`hsl(${index * (360 / selectedColumns.length)}, 70%, 50%)`} />
                ))}
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={Object.keys(data[0])[0]} />
                <YAxis />
                <Tooltip />
                <Legend />
                {selectedColumns.map((column, index) => (
                  <Line key={column} type="monotone" dataKey={column} stroke={`hsl(${index * (360 / selectedColumns.length)}, 70%, 50%)`} />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default DataVisualizer;
