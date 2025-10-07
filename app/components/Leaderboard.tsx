'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

type LeaderboardData = {
  'Nama Akun'?: string | null;
  'Views'?: string | null;
}[];

interface LeaderboardProps {
  data: LeaderboardData;
}

const LeaderboardCard = ({ rank, name, avgViews, index }: { rank: number, name: string, avgViews: string, index: number }) => {
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <motion.div
      className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-xl flex flex-col items-center text-center transition-transform hover:scale-105"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="text-2xl mb-2">{rank <= 3 ? medals[rank - 1] : `#${rank}`}</div>
      <div className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate w-full" title={name}>{name}</div>
      <div className="text-lg font-extrabold text-indigo-500 dark:text-indigo-400 mt-1">{avgViews}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">avg views</div>
    </motion.div>
  );
};

export default function Leaderboard({ data }: LeaderboardProps) {
  const leaderboardData = useMemo(() => {
    const creatorStats = data.reduce((acc, curr) => {
      const creatorName = curr['Nama Akun'];
      
      // Mengubah string 'Views' menjadi angka
      const views = parseInt(curr['Views']?.replace(/,/g, '') || '0', 10);

      if (creatorName) {
        if (!acc[creatorName]) {
          acc[creatorName] = { totalViews: 0, videoCount: 0 };
        }
        // =======================================================================
        // PERBAIKAN DI SINI: Cek apakah 'views' adalah NaN. Jika ya, tambahkan 0.
        // =======================================================================
        acc[creatorName].totalViews += isNaN(views) ? 0 : views;
        acc[creatorName].videoCount += 1;
      }
      return acc;
    }, {} as { [key: string]: { totalViews: number; videoCount: number } });

    const creatorsWithAvg = Object.entries(creatorStats).map(([name, stats]) => ({
      name,
      avgViews: stats.videoCount > 0 ? Math.round(stats.totalViews / stats.videoCount) : 0,
    }));

    return creatorsWithAvg.sort((a, b) => b.avgViews - a.avgViews).slice(0, 5);
  }, [data]);

  return (
    <div>
      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Leaderboard Creator</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {leaderboardData.map((creator, index) => (
          <LeaderboardCard
            key={creator.name}
            rank={index + 1}
            name={creator.name}
            avgViews={new Intl.NumberFormat('en-US', { notation: 'compact' }).format(creator.avgViews)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}