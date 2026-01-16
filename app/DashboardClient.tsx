'use client';

import { useState, useMemo, useEffect, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';

// Impor komponen sesuai struktur folder image_3f28e5.png
import KontenPieChart from './components/KontenPieChart';
import PaymentLeaderboard from './components/PaymentLeaderboard';
import TopProductsChart from './components/TopProductsChart';
import TopProductsCountChart from './components/TopProductsCountChart';
import Leaderboard from './components/Leaderboard';
import PemasukanLeaderboard from './components/PemasukanLeaderboard';
import ProfitStatCard from './components/ProfitStatCard';

// Tipe Data sesuai script Abang
type DataRow = { 
  'Bulan'?: string | null; 
  'Tanggal'?: string | null; 
  'Nama Akun'?: string | null; 
  'Rate'?: string | null; 
  'UA'?: string | null; 
  'Link Video'?: string | null; 
  'PID'?: string | null; 
  'KK/NK'?: string | null; 
  'Nama Produk'?: string | null; 
  'Konten'?: string | null; 
  'Views'?: string | null; 
  'Minimal Views'?: string | null; 
  'Lolos/Tidak'?: string | null; 
  'Lokasi'?: string | null; 
  'PAYMENT'?: string | null; 
};

type PemasukanDataRow = { 
  'BULAN'?: string | null; 
  'Kreator'?: string | null; 
  'Omset'?: string | null; 
};

interface DashboardClientProps { 
  initialData: DataRow[], 
  initialPemasukanData: PemasukanDataRow[] 
}

// Helper Tanggal
const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  const parts = dateString.split('-');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const year = parseInt(parts[2], 10);
  const monthMap: { [key: string]: number } = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Mei': 4, 'Jun': 5, 'Jul': 6, 'Agu': 7, 'Sep': 8, 'Okt': 9, 'Nov': 10, 'Des': 11 };
  const month = monthMap[parts[1]];
  if (isNaN(day) || isNaN(year) || month === undefined) return null;
  return new Date(year, month, day, 12);
};

// StatCard dengan dukungan Children (untuk Badge Growth)
const StatCard = ({ title, value, className = '', children }: { title: string; value: string | number, className?: string, children?: React.ReactNode }) => (
  <div className={`p-6 rounded-lg shadow-lg text-white flex flex-col justify-center items-center ${className}`}>
    <h3 className="text-sm uppercase text-gray-200 font-bold tracking-wider">{title}</h3>
    <p className="text-4xl font-extrabold mt-2">{value}</p>
    {children}
  </div>
);

const getSelectedMonth = (start: string, end: string): string | null => {
  if (!start || !end) return null;
  const startDate = new Date(start);
  const endDate = new Date(end);
  startDate.setHours(12);
  if (startDate.getDate() !== 1) return null;
  const lastDay = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
  if (endDate.getDate() !== lastDay || startDate.getMonth() !== endDate.getMonth()) return null;
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(startDate);
};

export default function DashboardClient({ initialData, initialPemasukanData }: DashboardClientProps) {
  const [namaCreatorFilter, setNamaCreatorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filter Data Dasar
  const dataFilteredBySearch = useMemo(() => {
    if (!searchTerm) return initialData;
    const lower = searchTerm.toLowerCase();
    return initialData.filter(row => row['Nama Akun']?.toLowerCase().includes(lower) || row['Nama Produk']?.toLowerCase().includes(lower));
  }, [initialData, searchTerm]);

  const dataFilteredByDate = useMemo(() => {
    const start = dateFilter.start ? new Date(dateFilter.start) : null;
    if(start) start.setHours(0, 0, 0, 0);
    const end = dateFilter.end ? new Date(dateFilter.end) : null;
    if(end) end.setHours(23, 59, 59, 999);
    if (!start && !end) return dataFilteredBySearch;
    return dataFilteredBySearch.filter(row => {
      const rowDate = parseDate(row['Tanggal'] || '');
      if (!rowDate) return false;
      return (!start || rowDate >= start) && (!end || rowDate <= end);
    });
  }, [dataFilteredBySearch, dateFilter]);

  const uniqueCreators = useMemo(() => [...new Set(dataFilteredByDate.map(item => item['Nama Akun']).filter(Boolean))] as string[], [dataFilteredByDate]);
  const filteredData = useMemo(() => {
    if (!namaCreatorFilter) return dataFilteredByDate;
    return dataFilteredByDate.filter(row => row['Nama Akun'] === namaCreatorFilter);
  }, [dataFilteredByDate, namaCreatorFilter]);

  useEffect(() => { if (namaCreatorFilter && !uniqueCreators.includes(namaCreatorFilter)) setNamaCreatorFilter(''); }, [uniqueCreators, namaCreatorFilter]);
  useEffect(() => { setCurrentPage(1); }, [filteredData]);

  const { totalPayment, totalCreator } = useMemo(() => {
     const totalPayment = filteredData.reduce((sum, row) => {
       const val = parseInt((row['PAYMENT'] || '').replace(/[^0-9]/g, ''), 10);
       return sum + (isNaN(val) ? 0 : val);
     }, 0); 
     return { totalPayment, totalCreator: uniqueCreators.length }; 
  }, [filteredData, uniqueCreators]);

  // FIX LOGIKA LEADERBOARD: Filter UA/Bestselling & Hitung Rata-rata
  const viewLeaderboardData = useMemo(() => {
    const filtered = dataFilteredByDate.filter((row: any) => {
      const jenis = String(row['Konten'] || '').trim();
      return jenis === "UA" || jenis === "Bestselling Berbayar";
    });

    const stats: Record<string, { total: number; count: number }> = {};
    filtered.forEach((row: any) => {
      const name = row['Nama Akun'];
      const views = parseInt(String(row['Views'] || '0').replace(/[^0-9]/g, '')) || 0;
      if (name) {
        if (!stats[name]) stats[name] = { total: 0, count: 0 };
        stats[name].total += views;
        stats[name].count += 1;
      }
    });

    return Object.entries(stats)
      .map(([name, s]) => ({
        'Nama Akun': name,
        'Views': String(Math.round(s.total / s.count))
      }))
      .sort((a, b) => parseInt(b['Views']) - parseInt(a['Views']))
      .slice(0, 5);
  }, [dataFilteredByDate]);

  // LOGIKA PEMASUKAN & GROWTH
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

    const prevData = initialPemasukanData.filter(row => row['BULAN']?.toLowerCase() === prevLabel.toLowerCase());
    const totalBulanLalu = prevData.reduce((sum, row) => sum + cleanVal(row['Omset']), 0);

    const growth = totalBulanLalu > 0 ? ((totalBulanIni - totalBulanLalu) / totalBulanLalu) * 100 : 0;
    
    return {
      show: true,
      totalPemasukan: totalBulanIni,
      growth: growth.toFixed(1),
      isUp: growth >= 0,
      totalKeuntungan: totalBulanIni - totalPayment,
      persenKeuntungan: totalPayment > 0 ? ((totalBulanIni - totalPayment) / totalPayment) * 100 : 0,
      leaderboardData: currentData,
    };
  }, [dateFilter, initialPemasukanData, totalPayment]);

  const handleCopyLink = (link: string) => { navigator.clipboard.writeText(link); setCopiedLink(link); setTimeout(() => setCopiedLink(null), 2000); };
  const animationProps = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <motion.div {...animationProps}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800 flex flex-col space-y-4">
                <div><label className="text-sm font-bold text-gray-600 dark:text-gray-300">Start Date</label><input type="date" name="start" value={dateFilter.start} onChange={(e) => setDateFilter(p => ({...p, start: e.target.value}))} className="mt-1 w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200" /></div>
                <div><label className="text-sm font-bold text-gray-600 dark:text-gray-300">End Date</label><input type="date" name="end" value={dateFilter.end} onChange={(e) => setDateFilter(p => ({...p, end: e.target.value}))} className="mt-1 w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200" /></div>
            </div>
            <StatCard title="TOTAL PAYMENT" value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalPayment)} className="bg-gradient-to-br from-indigo-500 to-indigo-700" />
            <div className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800">
                <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Nama Creator</label>
                <select value={namaCreatorFilter} onChange={(e) => setNamaCreatorFilter(e.target.value)} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"><option value="">All Creator</option>{uniqueCreators.map(c => <option key={c} value={c}>{c}</option>)}</select>
                <div className="mt-4 text-center"><h3 className="text-sm uppercase text-gray-500 font-bold">Total Creator</h3><p className="text-5xl font-extrabold text-gray-800 dark:text-gray-200">{totalCreator}</p></div>
            </div>
        </div>
      </motion.div>
      
      {pemasukanStats.show && (
        <motion.div {...animationProps} transition={{ delay: 0.1 }}>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Analisis Pemasukan Bulanan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatCard title="Total Pemasukan" value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(pemasukanStats.totalPemasukan||0)} className="bg-gradient-to-br from-blue-500 to-blue-700">
              <div className={`mt-2 px-2 py-1 rounded-full text-xs font-bold ${pemasukanStats.isUp ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {pemasukanStats.isUp ? '↑' : '↓'} {Math.abs(Number(pemasukanStats.growth))}% vs bulan lalu
              </div>
            </StatCard>
            <ProfitStatCard label="Laba / Rugi" profit={pemasukanStats.totalKeuntungan||0} percentage={pemasukanStats.persenKeuntungan||0} />
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"><PemasukanLeaderboard data={(pemasukanStats.leaderboardData || []) as any} /></div>
          </div>
        </motion.div>
      )}

      <motion.div className="my-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg" {...animationProps} transition={{ delay: 0.2 }}>
        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Leaderboard Avg Views (UA Only)</h3>
        <Leaderboard data={viewLeaderboardData as any} />
      </motion.div>

      <motion.div {...animationProps} transition={{ delay: 0.3 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"><h3 className="text-lg font-bold mb-4">Video Contribution</h3><KontenPieChart data={filteredData} /></div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"><PaymentLeaderboard data={filteredData} /></div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"><TopProductsChart data={filteredData} /></div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"><TopProductsCountChart data={filteredData} /></div>
        </div>
      </motion.div>

      <motion.div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6" {...animationProps} transition={{ delay: 0.5 }}>
          <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari kreator atau produk..." className="p-2 border rounded-md dark:bg-gray-700 dark:text-white w-full md:w-1/3" />
            <button onClick={() => { const csv = Papa.unparse(filteredData); const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'data.csv'; a.click(); }} className="bg-green-600 text-white px-4 py-2 rounded-md font-bold">Export CSV</button>
          </div>
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                  <tr>{Object.keys(initialData[0] || {}).map((h, i) => <th key={i} className="px-4 py-3 whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody>
                  {filteredData.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage).map((row: any, i) => (
                    <tr key={i} className="border-b dark:border-gray-700">
                        {Object.keys(initialData[0] || {}).map((h, j) => (
                          <td key={j} className="px-4 py-3 whitespace-nowrap">
                            {h === 'Link Video' && row[h] ? (
                              <div className="flex gap-2">
                                <a href={row[h]} target="_blank" className="text-blue-500 underline">Link</a>
                                <button onClick={() => handleCopyLink(row[h])} className="text-xs bg-gray-200 px-2 py-1 rounded">{copiedLink === row[h] ? 'Copied!' : 'Copy'}</button>
                              </div>
                            ) : (row[h] || '-')}
                          </td>
                        ))}
                    </tr>
                  ))}
              </tbody>
          </table>
          <div className="flex justify-center mt-4 gap-4 items-center">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
            <span className="dark:text-white">Page {currentPage}</span>
            <button disabled={currentPage >= Math.ceil(filteredData.length / itemsPerPage)} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
          </div>
      </motion.div>
    </div>
  );
}
// force update logic v2