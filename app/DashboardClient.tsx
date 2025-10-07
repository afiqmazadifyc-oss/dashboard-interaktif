'use client';

import { useState, useMemo, useEffect, ChangeEvent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';

import KontenPieChart from './components/KontenPieChart';
import PaymentChart from './components/PaymentChart';
import TopProductsChart from './components/TopProductsChart';
import TopProductsCountChart from './components/TopProductsCountChart';
import Leaderboard from './components/Leaderboard';

// Tipe Data untuk setiap baris dari Google Sheet
type DataRow = {
  'Bulan'?: string | null; 'Tanggal'?: string | null; 'Nama Akun'?: string | null; 'Rate'?: string | null; 'UA'?: string | null; 'Link Video'?: string | null; 'PID'?: string | null; 'KK/NK'?: string | null; 'Nama Produk'?: string | null; 'Konten'?: string | null; 'Views'?: string | null; 'Minimal Views'?: string | null; 'Lolos/Tidak'?: 'Lolos' | 'Tidak' | string | null; 'Lokasi'?: string | null; 'PAYMENT'?: string | null;
};
interface DashboardClientProps { initialData: DataRow[] }

// Helper Function untuk mengubah format tanggal dari Google Sheet
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

// Komponen Card untuk Statistik
const StatCard = ({ title, value, className = '' }: { title: string; value: string | number, className?: string }) => (
  <div className={`p-6 rounded-lg shadow-lg text-white flex flex-col justify-center items-center ${className}`}>
    <h3 className="text-sm uppercase text-gray-300 font-bold tracking-wider">{title}</h3>
    <p className="text-4xl font-extrabold mt-2">{value}</p>
  </div>
);

export default function DashboardClient({ initialData }: DashboardClientProps) {
  // State untuk semua filter dan UI
  const [namaCreatorFilter, setNamaCreatorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Logika filter bertingkat
  const dataFilteredBySearch = useMemo(() => { if (!searchTerm) return initialData; const lowercasedTerm = searchTerm.toLowerCase(); return initialData.filter(row => row['Nama Akun']?.toLowerCase().includes(lowercasedTerm) || row['Nama Produk']?.toLowerCase().includes(lowercasedTerm)); }, [initialData, searchTerm]);
  const dataFilteredByDate = useMemo(() => { const startDate = dateFilter.start ? new Date(dateFilter.start) : null; if(startDate) startDate.setHours(0, 0, 0, 0); const endDate = dateFilter.end ? new Date(dateFilter.end) : null; if(endDate) endDate.setHours(23, 59, 59, 999); if (!startDate && !endDate) return dataFilteredBySearch; return dataFilteredBySearch.filter(row => { const rowDate = parseDate(row['Tanggal'] || ''); if (!rowDate) return false; if (startDate && endDate) return rowDate >= startDate && rowDate <= endDate; if (startDate) return rowDate >= startDate; if (endDate) return rowDate <= endDate; return true; }); }, [dataFilteredBySearch, dateFilter]);
  const uniqueCreators = useMemo(() => [...new Set(dataFilteredByDate.map(item => item['Nama Akun']).filter(Boolean))] as string[], [dataFilteredByDate]);
  const filteredData = useMemo(() => { if (!namaCreatorFilter) return dataFilteredByDate; return dataFilteredByDate.filter(row => row['Nama Akun'] === namaCreatorFilter); }, [dataFilteredByDate, namaCreatorFilter]);
  
  // Efek untuk reset filter & paginasi
  useEffect(() => { if (namaCreatorFilter && !uniqueCreators.includes(namaCreatorFilter)) { setNamaCreatorFilter(''); } }, [uniqueCreators, namaCreatorFilter]);
  useEffect(() => { setCurrentPage(1); }, [filteredData]);

  // Logika paginasi
  const paginatedData = useMemo(() => { const startIndex = (currentPage - 1) * itemsPerPage; return filteredData.slice(startIndex, startIndex + itemsPerPage); }, [filteredData, currentPage]);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Kalkulasi statistik
  const { totalPayment, totalCreator } = useMemo(() => { const totalCreatorCount = uniqueCreators.length; const totalPayment = filteredData.reduce((sum, row) => { const paymentValue = parseInt((row['PAYMENT'] || '').replace(/[^0-9]/g, ''), 10); return sum + (isNaN(paymentValue) ? 0 : paymentValue); }, 0); return { totalPayment, totalCreator: totalCreatorCount }; }, [filteredData, uniqueCreators]);
  
  // Handlers
  const handleCreatorChange = (e: ChangeEvent<HTMLSelectElement>) => { setNamaCreatorFilter(e.target.value) };
  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => { setDateFilter(prev => ({ ...prev, [e.target.name]: e.target.value }))};
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => { setSearchTerm(e.target.value) };
  const handleCopyLink = (link: string) => { navigator.clipboard.writeText(link); setCopiedLink(link); setTimeout(() => setCopiedLink(null), 2000); };
  const handleExportCSV = () => { const csv = Papa.unparse(filteredData); const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement('a'); const url = URL.createObjectURL(blob); link.setAttribute('href', url); link.setAttribute('download', 'dashboard_export.csv'); link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); };
  
  const animationProps = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

  return (
    <div>
      <motion.div {...animationProps}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800 flex flex-col space-y-4">
                <div><label htmlFor="start" className="text-sm font-bold text-gray-600 dark:text-gray-300">Start Date</label><input type="date" name="start" id="start" value={dateFilter.start} onChange={handleDateChange} className="mt-1 w-full p-2 rounded-md bg-gray-200 dark:bg-gray-700 border-none text-gray-800 dark:text-gray-200" /></div>
                <div><label htmlFor="end" className="text-sm font-bold text-gray-600 dark:text-gray-300">End Date</label><input type="date" name="end" id="end" value={dateFilter.end} onChange={handleDateChange} className="mt-1 w-full p-2 rounded-md bg-gray-200 dark:bg-gray-700 border-none text-gray-800 dark:text-gray-200" /></div>
            </div>
            <StatCard title="TOTAL PAYMENT" value={ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalPayment) } className="bg-gradient-to-br from-indigo-500 to-indigo-700" />
            <div className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800">
                <label htmlFor="namaCreator" className="text-sm font-bold text-gray-600 dark:text-gray-300">Nama Creator</label>
                <select id="namaCreator" value={namaCreatorFilter} onChange={handleCreatorChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"><option value="">All Creator</option>{uniqueCreators.map(creator => <option key={creator} value={creator}>{creator}</option>)}</select>
                <div className="mt-4 text-center"><h3 className="text-sm uppercase text-gray-500 dark:text-gray-400 font-bold tracking-wider">Total Creator</h3><p className="text-5xl font-extrabold text-gray-800 dark:text-gray-200 mt-1">{totalCreator}</p></div>
            </div>
        </div>
      </motion.div>
      
      <motion.div className="my-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg" {...animationProps} transition={{ duration: 0.5, delay: 0.1 }}>
        <Leaderboard data={filteredData} />
      </motion.div>

      <motion.div {...animationProps} transition={{ duration: 0.5, delay: 0.2 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"><h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Video Contribution</h3><KontenPieChart data={filteredData} /></div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"><PaymentChart data={filteredData} /></div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"><TopProductsChart data={filteredData} /></div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"><TopProductsCountChart data={filteredData} /></div>
        </div>
      </motion.div>
      
      <motion.div {...animationProps} transition={{ duration: 0.5, delay: 0.3 }}>
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg"><label htmlFor="search" className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Cari Video (berdasarkan Nama Creator atau Nama Produk)</label><input type="text" id="search" value={searchTerm} onChange={handleSearchChange} placeholder="Ketik nama kreator atau produk..." className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"/></div>
      </motion.div>
      
      <motion.div {...animationProps} transition={{ duration: 0.5, delay: 0.4 }}>
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Menampilkan **{paginatedData.length}** dari **{filteredData.length}** hasil.</p>
                <button onClick={handleExportCSV} className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white font-bold rounded-md transition">Ekspor ke CSV</button>
            </div>
            
            <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                    <tr>{(Object.keys(initialData[0] || {}) as Array<keyof DataRow>).map((header, index) => (<th key={index} scope="col" className="px-4 py-3 whitespace-nowrap">{header}</th>))}</tr>
                </thead>
                <tbody>
                    {paginatedData.map((row: DataRow, index: number) => (
                    <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        {(Object.keys(initialData[0] || {}) as Array<keyof DataRow>).map((header, i) => {
                        const cellValue = row[header];
                        if (header === 'Link Video' && cellValue) { return (<td key={i} className="px-4 py-2 whitespace-nowrap"><div className="flex items-center space-x-2"><a href={cellValue} target="_blank" rel="noopener noreferrer" className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition">Lihat Video</a><button onClick={() => handleCopyLink(cellValue)} className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-md transition">{copiedLink === cellValue ? 'Copied!' : 'Copy Link'}</button></div></td>); }
                        return (<td key={i} className="px-4 py-3 whitespace-nowrap">{cellValue ?? '-'}</td>);
                        })}
                    </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-center items-center mt-6 space-x-4">
                <button onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1} className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-md transition disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed">Previous</button>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Halaman {currentPage} dari {totalPages}</span>
                <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages || totalPages === 0} className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-md transition disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed">Next</button>
            </div>
        </div>
      </motion.div>
    </div>
  );
}