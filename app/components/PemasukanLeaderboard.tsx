'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

type DataRow = {
  'Kreator'?: string | null;
  'Omset'?: string | null;
};
interface LeaderboardProps { data: DataRow[] }

const LeaderboardRow = ({ rank, name, omset, index }: { rank: number; name: string; omset: string, index: number }) => {
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <motion.li className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }} >
      <div className="flex items-center">
        <span className={`text-lg font-bold w-8 ${rank <= 3 ? 'text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {rank <= 3 ? medals[rank - 1] : `${rank}.`}
        </span>
        <span className="font-semibold text-gray-800 dark:text-gray-200 truncate" title={name}>{name}</span>
      </div>
      <div className="text-right">
        <span className="font-bold text-lg text-blue-500 dark:text-blue-400">{omset}</span>
        <p className="text-xs text-gray-500 dark:text-gray-400">total omset</p>
      </div>
    </motion.li>
  );
};

export default function PemasukanLeaderboard({ data }: LeaderboardProps) {
  const top5 = useMemo(() => {
    return data.sort((a, b) => {
      const omsetA = parseInt(a['Omset'] || '0', 10);
      const omsetB = parseInt(b['Omset'] || '0', 10);
      return omsetB - omsetA;
    }).slice(0, 5);
  }, [data]);

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Top 5 Pemasukan Kreator</h3>
      <ul className="space-y-2 flex-grow">
        {top5.map((creator, index) => (
          <LeaderboardRow
            key={creator['Kreator'] || index}
            rank={index + 1}
            name={creator['Kreator'] || 'N/A'}
            omset={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parseInt(creator['Omset'] || '0', 10))}
            index={index}
          />
        ))}
      </ul>
    </div>
  );
}