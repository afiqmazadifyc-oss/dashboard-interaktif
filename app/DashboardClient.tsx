'use client';

import { useState, useMemo, useEffect, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';

// Impor komponen sesuai image_3f28e5.png
import KontenPieChart from './components/KontenPieChart';
import PaymentLeaderboard from './components/PaymentLeaderboard';
import TopProductsChart from './components/TopProductsChart';
import TopProductsCountChart from './components/TopProductsCountChart';
import Leaderboard from './components/Leaderboard';
import PemasukanLeaderboard from './components/PemasukanLeaderboard';
import ProfitStatCard from './components/ProfitStatCard';

// Tipe Data
type DataRow = { 
  'Bulan'?: string | null; 'Tanggal'?: string | null; 'Nama Akun'?: string | null; 'Rate'?: string | null; 'UA'?: string | null; 'Link Video'?: string | null; 'PID'?: string | null; 'KK/NK'?: string | null; 'Nama Produk'?: string | null; 'Konten'?: string | null; 'Views'?: string | null; 'Minimal Views'?: string | null; 'Lolos/Tidak'?: string | null; 'Lokasi'?: string | null; 'PAYMENT'?: string | null; 
};

type PemasukanDataRow = { 'BULAN'?: string | null; 'Kreator'?: string | null; 'Omset'?: string | null; };

interface DashboardClientProps { initialData: DataRow[], initialPemasukanData: PemasukanDataRow[] }

// Helper Parse Tanggal
const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  const parts = dateString.split('-');
  if (parts.length !== 3) return null;
  const monthMap: { [key: string]: number } = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Mei': 4, 'Jun': 5, 'Jul': 6, 'Agu': 7, 'Sep': 8, 'Okt': 9, 'Nov': 10, 'Des': 11 };
  return new Date(parseInt(parts[2], 10), monthMap[parts[1]], parseInt(parts[0], 10), 12);
};

// StatCard Minimalis
const StatCard = ({ title, value, className = '', children }: { title: string; value: string | number, className?: string, children?: React.ReactNode }) => (
  <div className={`p-6 rounded-lg shadow-lg text-white flex flex-col justify-center items-center ${className}`}>
    <h3 className="text-xs uppercase text-gray-300 font-bold tracking-wider mb-1">{title}</h3>
    <p className="text-4xl font-extrabold">{value}</p>
    {children}
  </div>
);

const getSelectedMonth = (start: string, end: string): string | null => {
  if (!start || !end) return null;
  const startDate = new Date(start);
  const lastDay = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
  if (startDate.getDate() !== 1 || new Date(end).getDate() !== lastDay) return null;
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(startDate);
};

export default function DashboardClient({ initialData, initialPemasukanData }: DashboardClientProps) {
  const [namaCreatorFilter, setNamaCreatorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const dataFilteredByDate = useMemo(() => {
    const start = dateFilter.start ? new Date(dateFilter.start) : null;
    const end = dateFilter.end ? new Date(dateFilter.end) : null;
    return initialData.filter(row => {
      const rowDate = parseDate(row['Tanggal'] || '');
      if (!rowDate) return false;
      return (!start || rowDate >= start) && (!end || rowDate <= end);
    });
  }, [initialData, dateFilter]);

  const uniqueCreators = useMemo(() => [...new Set(dataFilteredByDate.map(item => item['Nama Akun']).filter(Boolean))] as string[], [dataFilteredByDate]);
  const filteredData = useMemo(() => namaCreatorFilter ? dataFilteredByDate.filter(row => row['Nama Akun'] === namaCreatorFilter) : dataFilteredByDate, [dataFilteredByDate, namaCreatorFilter]);

  const { totalPayment } = useMemo(() => ({
     totalPayment: filteredData.reduce((sum, row) => sum + (parseInt((row['PAYMENT'] || '').replace(/[^0-9]/g, ''), 10) || 0), 0)
  }), [filteredData]);

  // LOGIKA 1: Leaderboard Views (UA & Bestselling)
  const viewLeaderboardData = useMemo(() => {
    const filtered = dataFilteredByDate.filter((row: any) => row['Konten'] === "UA" || row['Konten'] === "Bestselling Berbayar");
    const stats: Record<string, { total: number; count: number }> = {};
    filtered.forEach((row: any) => {
      const name = row['Nama Akun'];
      const views = parseInt(String(row['Views'] || '0').replace(/[^0-9]/g, '')) || 0;
      if (name) {
        if (!stats[name]) stats[name] = { total: 0, count: 0 };
        stats[name].total += views; stats[name].count += 1;
      }
    });
    return Object.entries(stats).map(([name, s]) => ({ 'Nama Akun': name, 'Views': `${(s.total/s.count/1000).toFixed(0)}K` }))
      .sort((a, b) => parseInt(b['Views']) - parseInt(a['Views'])).slice(0, 5);
  }, [dataFilteredByDate]);

  // LOGIKA 2: Pemasukan (FIX Presisi Top 5)
  const pemasukanStats = useMemo(() => {
    const selectedMonth = getSelectedMonth(dateFilter.start, dateFilter.end);
    if (!selectedMonth) return { show: false };
    const cleanVal = (v: any) => parseInt(String(v || '0').replace(/[^0-9]/g, ''), 10) || 0;
    const currentData = initialPemasukanData.filter(row => row['BULAN']?.toLowerCase() === selectedMonth.toLowerCase());
    const totalBulanIni = currentData.reduce((sum, row) => sum + cleanVal(row['Omset']), 0);

    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const [currName, currYear] = selectedMonth.split(" ");
    const currIdx = months.indexOf(currName);
    const prevMonthName = currIdx === 0 ? months[11] : months[currIdx - 1];
    const prevYear = currIdx === 0 ? parseInt(currYear) - 1 : currYear;
    const prevLabel = `${prevMonthName} ${prevYear}`;
    const totalBulanLalu = initialPemasukanData
      .filter(row => row['BULAN']?.toLowerCase() === prevLabel.toLowerCase())
      .reduce((sum, row) => sum + cleanVal(row['Omset']), 0);

    const growth = totalBulanLalu > 0 ? ((totalBulanIni - totalBulanLalu) / totalBulanLalu) * 100 : 0;
    const top5Data = [...currentData].sort((a, b) => cleanVal(b['Omset']) - cleanVal(a['Omset'])).slice(0, 5);

    return {
      show: true, totalPemasukan: totalBulanIni, growth: growth.toFixed(1), isUp: growth >= 0,
      totalKeuntungan: totalBulanIni - totalPayment,
      persenKeuntungan: totalPayment > 0 ? ((totalBulanIni - totalPayment) / totalPayment) * 100 : 0,
      leaderboardData: top5Data,
    };
  }, [dateFilter, initialPemasukanData, totalPayment]);

  const handleCopyLink = (link: string) => { navigator.clipboard.writeText(link); setCopiedLink(link); setTimeout(() => setCopiedLink(null), 2000); };
  const animationProps = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* JUDUL DIHAPUS BIAR GAK DOUBLE */}

      <motion.div {...animationProps} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg flex flex-col space-y-4">
              <div><label className="text-xs font-bold text-gray-500 uppercase">Start Date</label><input type="date" value={dateFilter.start} onChange={(e) => setDateFilter(p => ({...p, start: e.target.value}))} className="mt-1 w-full p-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white border-none" /></div>
              <div><label className="text-xs font-bold text-gray-500 uppercase">End Date</label><input type="date" value={dateFilter.end} onChange={(e) => setDateFilter(p => ({...p, end: e.target.value}))} className="mt-1 w-full p-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white border-none" /></div>
          </div>
          <StatCard title="TOTAL PAYMENT" value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalPayment)} className="bg-indigo-600" />
          <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg text-center flex flex-col justify-center">
              <label className="text-xs font-bold text-gray-500 uppercase">Nama Creator</label>
              <select value={namaCreatorFilter} onChange={(e) => setNamaCreatorFilter(e.target.value)} className="mt-2 w-full p-2 bg-gray-100 dark:bg-gray-700 dark:text-white rounded border-none"><option value="">All Creator</option>{uniqueCreators.map(c => <option key={c} value={c}>{c}</option>)}</select>
              <div className="mt-4">
                <p className="text-xs font-bold text-gray-500 uppercase">Total Creator</p>
                <p className="text-5xl font-extrabold text-gray-800 dark:text-white mt-1">{uniqueCreators.length}</p>
              </div>
          </div>
      </motion.div>
      
      {pemasukanStats.show && (
        <motion.div {...animationProps} transition={{ delay: 0.1 }} className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white px-2">Analisis Pemasukan Bulanan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="TOTAL PEMASUKAN" value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(pemasukanStats.totalPemasukan || 0)} className="bg-blue-600">
              <div className={`mt-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${pemasukanStats.isUp ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {pemasukanStats.isUp ? '↑' : '↓'} {Math.abs(Number(pemasukanStats.growth))}% vs bulan lalu
              </div>
            </StatCard>
            <ProfitStatCard label="LABA / RUGI" profit={pemasukanStats.totalKeuntungan || 0} percentage={pemasukanStats.persenKeuntungan || 0} />
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"><PemasukanLeaderboard data={(pemasukanStats.leaderboardData || []) as any} /></div>
          </div>
        </motion.div>
      )}

      <motion.div className="my-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg" {...animationProps} transition={{ delay: 0.2 }}>
        <h3 className="text-lg font-bold mb-6 text-gray-800 dark:text-white">Leaderboard Avg Views (UA Only)</h3>
        <Leaderboard data={viewLeaderboardData as any} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"><h3 className="font-bold mb-4 dark:text-white">Video Contribution</h3><KontenPieChart data={filteredData} /></div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"><PaymentLeaderboard data={filteredData} /></div>
      </div>

      <motion.div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6" {...animationProps} transition={{ delay: 0.4 }}>
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari kreator atau produk..." className="p-2.5 bg-gray-100 dark:bg-gray-700 dark:text-white rounded border-none w-full md:w-1/3" />
            <button onClick={() => { const csv = Papa.unparse(filteredData); const blob = new Blob([csv], { type: 'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'data.csv'; a.click(); }} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold transition-all shadow-md active:scale-95">Export CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700">
                    <tr>{Object.keys(initialData[0] || {}).map((h, i) => <th key={i} className="px-4 py-3 whitespace-nowrap">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredData.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage).map((row: any, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          {Object.keys(initialData[0] || {}).map((h, j) => (
                            <td key={j} className="px-4 py-4 whitespace-nowrap dark:text-gray-300">
                              {h === 'Link Video' && row[h] ? (
                                <div className="flex gap-2">
                                  <a href={row[h]} target="_blank" className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-bold hover:bg-blue-600">Link</a>
                                  <button onClick={() => handleCopyLink(row[h])} className={`px-3 py-1 rounded text-xs font-bold transition-all ${copiedLink === row[h] ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200'}`}>
                                    {copiedLink === row[h] ? 'Copied!' : 'Copy'}
                                  </button>
                                </div>
                              ) : (row[h] || '-')}
                            </td>
                          ))}
                      </tr>
                    ))}
                </tbody>
            </table>
          </div>
          <div className="flex justify-center mt-8 gap-4 items-center">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-30 dark:text-white font-bold">Prev</button>
            <span className="text-xs font-bold text-gray-500">Page {currentPage}</span>
            <button disabled={currentPage >= Math.ceil(filteredData.length / itemsPerPage)} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-30 dark:text-white font-bold">Next</button>
          </div>
      </motion.div>
    </div>
  );
}