'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

type DataRow = {
  'Nama Akun'?: string | null;
  'PAYMENT'?: string | null;
};

interface LeaderboardProps {
  data: DataRow[];
}

const LeaderboardRow = ({ rank, name, totalPayment, index }: { rank: number; name: string; totalPayment: string, index: number }) => {
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <motion.li
      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div className="flex items-center">
        <span className={`text-lg font-bold w-8 ${rank <= 3 ? 'text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {rank <= 3 ? medals[rank - 1] : `${rank}.`}
        </span>
        <span className="font-semibold text-gray-800 dark:text-gray-200 truncate" title={name}>{name}</span>
      </div>
      <div className="text-right">
        <span className="font-bold text-lg text-green-500 dark:text-green-400">{totalPayment}</span>
        <p className="text-xs text-gray-500 dark:text-gray-400">total payment</p>
      </div>
    </motion.li>
  );
};

export default function PaymentLeaderboard({ data }: LeaderboardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  // ============================
  // PERUBAHAN DI SINI
  // ============================
  const itemsPerPage = 4; // Tampilkan 4 per halaman
  // ============================

  const leaderboardData = useMemo(() => {
    const creatorStats = data.reduce((acc, curr) => {
      const creatorName = curr['Nama Akun'];
      const payment = parseInt(curr['PAYMENT']?.replace(/[^0-9]/g, '') || '0', 10);
      if (creatorName && !isNaN(payment) && payment > 0) {
        acc[creatorName] = (acc[creatorName] || 0) + payment;
      }
      return acc;
    }, {} as { [key: string]: number });

    const creatorsWithPayment = Object.entries(creatorStats).map(([name, totalPayment]) => ({ name, totalPayment }));
    return creatorsWithPayment.sort((a, b) => b.totalPayment - a.totalPayment);
  }, [data]);

  const paginatedLeaderboard = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return leaderboardData.slice(startIndex, startIndex + itemsPerPage);
  }, [leaderboardData, currentPage]);
  const totalPages = Math.ceil(leaderboardData.length / itemsPerPage);

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Top Creator (by Payment)</h3>
      <ul className="space-y-2 flex-grow">
        {paginatedLeaderboard.map((creator, index) => {
          const globalRank = (currentPage - 1) * itemsPerPage + index + 1;
          return (
            <LeaderboardRow
              key={creator.name}
              rank={globalRank}
              name={creator.name}
              totalPayment={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(creator.totalPayment)}
              index={index}
            />
          );
        })}
        {/* Tambahkan placeholder jika baris kurang dari 4 untuk menjaga tinggi */}
        {Array.from({ length: Math.max(0, itemsPerPage - paginatedLeaderboard.length) }).map((_, i) => (
          <li key={`placeholder-${i}`} className="h-[60px]"></li> // Sesuaikan tinggi jika perlu
        ))}
      </ul>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage(prev => prev - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-md transition disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {totalPages > 0 ? `Page ${currentPage} of ${totalPages}` : 'No Data'}
        </span>
        <button
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-md transition disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}