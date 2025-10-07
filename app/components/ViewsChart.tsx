'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrasi komponen-komponen Chart.js yang akan digunakan
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Tipe data untuk properti komponen
interface ViewsChartProps {
  data: {
    'Nama Akun'?: string | null;
    'Views'?: string | null;
  }[];
}

export default function ViewsChart({ data }: ViewsChartProps) {
  // Mengolah data mentah menjadi format yang bisa dibaca oleh grafik
  // Mengelompokkan dan menjumlahkan total views per nama akun
  const viewsPerAkun = data.reduce((acc, curr) => {
    const akun = curr['Nama Akun'];
    // Membersihkan string angka dari koma dan mengubahnya menjadi integer
    const views = parseInt(curr['Views']?.replace(/,/g, '') || '0', 10);

    if (akun) {
      acc[akun] = (acc[akun] || 0) + views;
    }
    return acc;
  }, {} as { [key: string]: number });

  // Mengambil 10 akun dengan views terbanyak untuk ditampilkan
  const top10Akun = Object.entries(viewsPerAkun)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
  
  // Data yang akan dimasukkan ke dalam chart
  const chartData = {
    labels: top10Akun.map(([akun]) => akun),
    datasets: [
      {
        label: 'Total Views',
        data: top10Akun.map(([, totalViews]) => totalViews),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Opsi untuk kustomisasi tampilan chart
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Top 10 Akun Berdasarkan Total Views',
        font: {
          size: 18,
        },
        color: '#333' // Warna bisa disesuaikan untuk dark mode
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      }
    }
  };

  return (
    <div className="h-96"> {/* Memberi tinggi agar chart tidak gepeng */}
      <Bar options={options} data={chartData} />
    </div>
  );
}