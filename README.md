# Strong-Viz

A modern web application for visualizing and analyzing your workout data from the Strong App. Track your progress, analyze your performance, and gain insights into your training with beautiful interactive charts.

![Strong-Viz](screenshot.png)

## Features

### Exercise Analysis

- Track progression of individual exercises over time
- View weight progression and volume trends with interactive charts
- See max weight, max volume, and total sets for each exercise
- Detailed set history with weights and reps
- Click on workout dates to see full workout details

### Workout Analysis

- Chronological list of all workouts with exercise counts
- Detailed workout summaries including:
  - Total volume lifted
  - Number of exercises performed
  - Workout duration
- Click on exercises to see their complete history and progression

### Using Your Strong App Data

1. Export your workout data from the Strong App as a CSV file (Settings cog > General > Export data)
   - Compatible with both pre-6.0 and post-6.0 Strong App versions
   - Automatically detects and handles both legacy and current CSV formats
2. Open Strong-Viz in your browser
3. Click the upload area and select your CSV file
4. Your workout data will be automatically processed and displayed

## Technology Stack

- React 18
- TypeScript
- Tailwind CSS for styling
- Recharts for data visualization
- Papa Parse for CSV parsing

## Acknowledgments

- Strong App for providing the workout tracking platform
- Recharts for the excellent charting library
- All contributors who help improve this project
