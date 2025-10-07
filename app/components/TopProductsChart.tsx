'use client';

import { Bar } from 'react-chartjs-2';
// FIX: 'IndexAxis' dihapus dari baris import di bawah ini
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTheme } from 'next-themes';
import { cheerfulColors } from '../../lib/chart-colors';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TopProductsChartProps { data: { 'Nama Produk'?: string | null; 'Views'?: string | null }[] }

export default function TopProductsChart({ data }: TopProductsChartProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const viewsPerProduk = data.reduce((acc, curr) => {
    const produk = curr['Nama Produk'];
    const views = parseInt(curr['Views']?.replace(/,/g, '') || '0', 10);
    if (produk) {
      acc[produk] = (acc[produk] || 0) + views;
    }
    return acc;
  }, {} as { [key: string]: number });

  const top5Products = Object.entries(viewsPerProduk)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const chartData = {
    labels: top5Products.map(([produk]) => produk),
    datasets: [{
      label: 'Total Views',
      data: top5Products.map(([, views]) => views),
      backgroundColor: cheerfulColors.map(color => color.background),
      borderColor: cheerfulColors.map(color => color.border),
      borderWidth: 1,
    }],
  };

  const options = {
    indexAxis: 'y' as const, // Bagian ini tetap sama dan sudah benar
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Top 5 Produk Berdasarkan Views', color: isDarkMode ? '#e5e7eb' : '#374151', font: { size: 16 } },
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