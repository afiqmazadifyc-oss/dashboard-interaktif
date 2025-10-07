'use client';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useTheme } from 'next-themes';
import { cheerfulColors } from '../../lib/chart-colors';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

interface TopProductsCountChartProps { data: { 'Nama Produk'?: string | null }[] }

export default function TopProductsCountChart({ data }: TopProductsCountChartProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Menghitung frekuensi kemunculan setiap produk
  const productCounts = data.reduce((acc, curr) => {
    const produk = curr['Nama Produk'];
    if (produk) {
      acc[produk] = (acc[produk] || 0) + 1;
    }
    return acc;
  }, {} as { [key: string]: number });

  // Mengambil 5 produk yang paling sering muncul
  const top5Products = Object.entries(productCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const chartData = {
    labels: top5Products.map(([produk]) => produk),
    datasets: [{
      label: 'Jumlah Produksi',
      data: top5Products.map(([, count]) => count),
      backgroundColor: cheerfulColors.map(color => color.background),
      borderColor: cheerfulColors.map(color => color.border),
      borderWidth: 1,
    }],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Top 5 Produk Paling Sering Diproduksi', color: isDarkMode ? '#e5e7eb' : '#374151', font: { size: 16 } },
      datalabels: {
        color: isDarkMode ? '#e5e7eb' : '#374151',
        anchor: 'end' as const,
        align: 'end' as const,
        font: { weight: 'bold' as const },
        formatter: (value: number) => ` ${value}x` // Format angka (e.g., " 5x")
      }
    },
    scales: {
      x: { ticks: { color: isDarkMode ? '#9ca3af' : '#6b7280' } },
      y: { ticks: { color: isDarkMode ? '#9ca3af' : '#6b7280' } }
    }
  };

  return (
    <div className="h-80">
      <Bar options={options} data={chartData} />
    </div>
  );
}