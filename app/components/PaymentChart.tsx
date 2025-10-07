'use client';

import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useTheme } from 'next-themes';
import { cheerfulColors } from '../../lib/chart-colors';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PaymentChartProps { data: { 'Bulan'?: string | null; 'PAYMENT'?: string | null }[] }

export default function PaymentChart({ data }: PaymentChartProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const paymentPerBulan = data.reduce((acc, curr) => {
    const bulan = curr['Bulan'];
    const payment = parseInt(curr['PAYMENT']?.replace(/[^0-9]/g, '') || '0', 10);
    if (bulan) {
      acc[bulan] = (acc[bulan] || 0) + payment;
    }
    return acc;
  }, {} as { [key: string]: number });

  // Urutkan bulan jika perlu (contoh sederhana)
  const sortedLabels = Object.keys(paymentPerBulan).sort();

  const chartData = {
    labels: sortedLabels,
    datasets: [{
      label: 'Total Payment',
      data: sortedLabels.map(bulan => paymentPerBulan[bulan]),
      fill: false,
      borderColor: cheerfulColors[0].border,
      tension: 0.1
    }],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Total Payment per Bulan', color: isDarkMode ? '#e5e7eb' : '#374151', font: { size: 16 } },
    },
    scales: {
      x: { ticks: { color: isDarkMode ? '#9ca3af' : '#6b7280' } },
      y: { ticks: { color: isDarkMode ? '#9ca3af' : '#6b7280' } }
    }
  };

  return (
    <div className="h-80">
      <Line options={options} data={chartData} />
    </div>
  );
}