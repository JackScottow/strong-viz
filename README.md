# Strong Workout Data Visualizer

A modern web application for visualizing and analyzing your workout data from the Strong App. Get insights into your exercise progression, workout history, and training volume with beautiful interactive charts and a clean interface.

![Strong Workout Data Visualizer](screenshot.png)

## Features

### Exercise Analysis

- Track progression of individual exercises over time
- View weight progression and volume trends with interactive charts
- See max weight, max reps, and total sets for each exercise
- Detailed set history with weights and reps
- Click on workout dates to see full workout details

### Workout Analysis

- Chronological list of all workouts with exercise counts
- Detailed workout summaries including:
  - Total volume lifted
  - Number of exercises performed
  - Workout duration
- Click on exercises to see their complete history and progression

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Strong App export file (CSV format)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/strong-viz.git
cd strong-viz
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Using Your Strong App Data

1. Export your workout data from the Strong App as a CSV file
2. Open the application in your browser
3. Click the upload area and select your CSV file
4. Your workout data will be automatically processed and displayed

## Technology Stack

- Next.js 13+ with App Router
- React 18
- TypeScript
- Tailwind CSS for styling
- Recharts for data visualization
- Papa Parse for CSV parsing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Strong App for providing the workout tracking platform
- Recharts for the excellent charting library
- All contributors who help improve this project
