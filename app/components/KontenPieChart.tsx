'use client';

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // <-- IMPOR PLUGIN BARU
import { useTheme } from 'next-themes';
import { cheerfulColors } from '../../lib/chart-colors';

// Registrasi pluginnya ke Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

interface KontenPieChartProps { data: { 'Konten'?: string | null }[] }

export default function KontenPieChart({ data }: KontenPieChartProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const kontenCounts = data.reduce((acc, curr) => {
    const konten = curr['Konten'];
    if (konten) {
      acc[konten] = (acc[konten] || 0) + 1;
    }
    return acc;
  }, {} as { [key: string]: number });

  const chartData = {
    labels: Object.keys(kontenCounts),
    datasets: [
      {
        label: 'Jumlah Video',
        data: Object.values(kontenCounts),
        backgroundColor: cheerfulColors.map(color => color.background),
        borderColor: isDarkMode ? '#1f2937' : '#ffffff', // <-- Sesuaikan border dengan background
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: isDarkMode ? '#e5e7eb' : '#374151',
          font: { size: 12 },
          boxWidth: 20,
        }
      },
      // =======================================================================
      // KONFIGURASI BARU: Untuk menampilkan angka di dalam chart
      // =======================================================================
      datalabels: {
        color: '#fff', // Warna angka
        font: {
          weight: 'bold' as const,
          size: 14,
        },
        // Formatter untuk menampilkan angka saja
        formatter: (value: number) => {
          return value;
        },
      }
    },
  };
  
  return (
    <div className="h-64 md:h-80">
      <Pie data={chartData} options={options} />
    </div>
  );
}