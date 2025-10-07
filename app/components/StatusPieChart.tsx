'use client';

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface StatusPieChartProps {
  data: {
    'Lolos/Tidak'?: 'Lolos' | 'Tidak' | string | null;
  }[];
}

export default function StatusPieChart({ data }: StatusPieChartProps) {
  // Menghitung jumlah 'Lolos' dan 'Tidak'
  const statusCounts = data.reduce(
    (acc, curr) => {
      if (curr['Lolos/Tidak'] === 'Lolos') {
        acc.lolos += 1;
      } else if (curr['Lolos/Tidak'] === 'Tidak') {
        acc.tidak += 1;
      }
      return acc;
    },
    { lolos: 0, tidak: 0 }
  );

  const chartData = {
    labels: ['Lolos', 'Tidak Lolos'],
    datasets: [
      {
        label: 'Jumlah Konten',
        data: [statusCounts.lolos, statusCounts.tidak],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)', // Warna untuk 'Lolos'
          'rgba(255, 99, 132, 0.6)', // Warna untuk 'Tidak Lolos'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Proporsi Konten Lolos vs Tidak Lolos',
        font: {
          size: 18
        },
        color: '#333'
      },
    },
  };
  
  return (
    <div className="h-96">
      <Pie data={chartData} options={options} />
    </div>
  );
}